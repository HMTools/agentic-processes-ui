import { useEffect, useRef, useCallback } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import 'xterm/css/xterm.css'

interface TerminalProps {
  sessionId: string
  fontSize?: number
  onData?: (data: string) => void
  onResize?: (cols: number, rows: number) => void
}

export function Terminal({ sessionId, fontSize = 14, onData, onResize }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  // Write data to terminal
  const write = useCallback((data: string) => {
    xtermRef.current?.write(data)
  }, [])

  // Clear terminal
  const clear = useCallback(() => {
    xtermRef.current?.clear()
  }, [])

  // Focus terminal
  const focus = useCallback(() => {
    xtermRef.current?.focus()
  }, [])

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current) return

    // Create terminal instance
    const xterm = new XTerm({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9',
        cursor: '#58a6ff',
        cursorAccent: '#0d1117',
        selectionBackground: '#264f78',
        black: '#484f58',
        red: '#ff7b72',
        green: '#3fb950',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#39c5cf',
        white: '#b1bac4',
        brightBlack: '#6e7681',
        brightRed: '#ffa198',
        brightGreen: '#56d364',
        brightYellow: '#e3b341',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#56d4dd',
        brightWhite: '#f0f6fc'
      },
      allowTransparency: true,
      scrollback: 10000,
      convertEol: true
    })

    // Create and load addons
    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()

    xterm.loadAddon(fitAddon)
    xterm.loadAddon(webLinksAddon)

    // Open terminal in container
    xterm.open(terminalRef.current)

    // Initial fit
    setTimeout(() => {
      fitAddon.fit()
      onResize?.(xterm.cols, xterm.rows)
    }, 0)

    // Handle input
    xterm.onData((data) => {
      onData?.(data)
    })

    // Custom key event handler for copy/paste support
    xterm.attachCustomKeyEventHandler((e: KeyboardEvent) => {
      // Ctrl+C: Copy selected text (if there's a selection), otherwise pass through as SIGINT
      if (e.ctrlKey && e.key === 'c' && e.type === 'keydown') {
        const selection = xterm.getSelection()
        if (selection) {
          // Copy selection to clipboard
          if (window.electronAPI?.clipboardWriteText) {
            window.electronAPI.clipboardWriteText(selection)
          } else {
            navigator.clipboard.writeText(selection).catch(() => {})
          }
          xterm.clearSelection()
          return false // Prevent default (don't send SIGINT when copying)
        }
        // No selection - let Ctrl+C pass through to terminal (SIGINT)
        return true
      }

      // Ctrl+V: Paste from clipboard
      if (e.ctrlKey && e.key === 'v' && e.type === 'keydown') {
        const pasteFromClipboard = async () => {
          try {
            let text: string | undefined
            if (window.electronAPI?.clipboardReadText) {
              text = await window.electronAPI.clipboardReadText()
            } else {
              text = await navigator.clipboard.readText()
            }
            if (text) {
              onData?.(text)
            }
          } catch (err) {
            console.error('Failed to paste from clipboard:', err)
          }
        }
        pasteFromClipboard()
        return false // Prevent default
      }

      return true // Allow all other key events
    })

    // Store refs
    xtermRef.current = xterm
    fitAddonRef.current = fitAddon

    // Setup resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (fitAddonRef.current && xtermRef.current) {
        fitAddonRef.current.fit()
        onResize?.(xtermRef.current.cols, xtermRef.current.rows)
      }
    })

    resizeObserver.observe(terminalRef.current)
    resizeObserverRef.current = resizeObserver

    // Focus terminal
    xterm.focus()

    // Cleanup
    return () => {
      resizeObserver.disconnect()
      xterm.dispose()
      xtermRef.current = null
      fitAddonRef.current = null
    }
  }, [sessionId]) // Re-initialize if sessionId changes

  // Update font size
  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.fontSize = fontSize
      fitAddonRef.current?.fit()
    }
  }, [fontSize])

  // Expose methods via ref (alternative: use context or callbacks)
  // For now, we'll use the window object for simplicity
  useEffect(() => {
    const terminalApi = { write, clear, focus }
    // Store in a map keyed by sessionId for access from other components
    if (!window.__agentTerminals) {
      window.__agentTerminals = new Map()
    }
    window.__agentTerminals.set(sessionId, terminalApi)

    return () => {
      window.__agentTerminals?.delete(sessionId)
    }
  }, [sessionId, write, clear, focus])

  return (
    <div 
      ref={terminalRef} 
      className="w-full h-full bg-background"
      style={{ padding: '8px' }}
    />
  )
}

// Type declaration for the terminal API
declare global {
  interface Window {
    __agentTerminals?: Map<string, {
      write: (data: string) => void
      clear: () => void
      focus: () => void
    }>
  }
}

// Helper to get terminal API for a session
export function getTerminalApi(sessionId: string) {
  return window.__agentTerminals?.get(sessionId)
}
