import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import mermaid from 'mermaid'
import type { ProcessFile } from '../../types'

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#3b82f6',
    primaryTextColor: '#e5e7eb',
    primaryBorderColor: '#4b5563',
    lineColor: '#6b7280',
    secondaryColor: '#1f2937',
    tertiaryColor: '#374151',
    background: '#111827',
    mainBkg: '#1f2937',
    nodeBorder: '#4b5563',
    clusterBkg: '#1f2937',
    clusterBorder: '#4b5563',
    titleColor: '#e5e7eb',
    edgeLabelBackground: '#1f2937',
  },
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
  },
})

interface FileContentModalProps {
  file: ProcessFile
  onClose: () => void
}

// Check if we're running in Electron
const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined
}

export function FileContentModal({ file, onClose }: FileContentModalProps) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Load file content
  const loadContent = useCallback(async () => {
    if (!isElectron()) {
      setError('Not running in Electron')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const fileContent = await window.electronAPI.readFileContent(file.path)
      if (fileContent === null) {
        setError('File not found or could not be read')
      } else {
        setContent(fileContent)
      }
    } catch (err) {
      console.error('Error loading file content:', err)
      setError('Failed to load file content')
    } finally {
      setLoading(false)
    }
  }, [file.path])

  // Initial load
  useEffect(() => {
    loadContent()
  }, [loadContent])

  // Set up file watching for hot reload
  useEffect(() => {
    if (!isElectron()) return

    // Start watching the file
    window.electronAPI.watchFile(file.path)

    // Subscribe to file content updates
    const unsubscribe = window.electronAPI.onFileContentUpdate(({ filePath, content: newContent, removed }) => {
      if (filePath === file.path) {
        if (removed) {
          setError('File has been removed')
          setContent(null)
        } else if (newContent !== null) {
          setContent(newContent)
        }
      }
    })

    // Cleanup: stop watching and unsubscribe
    return () => {
      window.electronAPI.unwatchFile(file.path)
      unsubscribe()
    }
  }, [file.path])

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Focus trap
  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  const isMarkdown = file.type === 'markdown'

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-[90vw] mx-4 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-elevated flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* File icon */}
            <div className={`p-1.5 rounded-lg ${
              isMarkdown 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'bg-amber-500/20 text-amber-400'
            }`}>
              {isMarkdown ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-mono font-semibold text-text-primary truncate">
                {file.name}
              </h2>
              <p className="text-xs text-text-muted">
                {isMarkdown ? 'Markdown' : 'JSON'} • Hot reload enabled
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface transition-colors text-text-muted hover:text-text-primary flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-background">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-text-muted">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Loading content...</span>
              </div>
            </div>
          ) : error ? (
            <div className="h-64 flex items-center justify-center text-status-failed">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          ) : content !== null ? (
            isMarkdown ? (
              <MarkdownContent content={content} />
            ) : (
              <JsonContent content={content} />
            )
          ) : null}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 bg-surface-elevated border-t border-border flex items-center justify-between text-xs text-text-muted flex-shrink-0">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono text-[10px]">esc</kbd>
            <span>close</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-status-completed animate-pulse"></span>
            <span>Auto-refresh on file change</span>
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}

function MarkdownContent({ content }: { content: string }) {
  // Custom components for ReactMarkdown with explicit styling
  const components = useMemo(() => ({
    // Headings with clear visual hierarchy
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-2xl font-bold text-text-primary mt-6 mb-4 pb-3 border-b-2 border-accent/30 first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-xl font-semibold text-text-primary mt-8 mb-3 pb-2 border-b border-border">
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-lg font-semibold text-accent mt-6 mb-2">
        {children}
      </h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="text-base font-semibold text-text-primary mt-4 mb-2">
        {children}
      </h4>
    ),
    h5: ({ children }: { children?: React.ReactNode }) => (
      <h5 className="text-sm font-semibold text-text-primary mt-3 mb-1">
        {children}
      </h5>
    ),
    h6: ({ children }: { children?: React.ReactNode }) => (
      <h6 className="text-sm font-medium text-text-secondary mt-3 mb-1">
        {children}
      </h6>
    ),
    
    // Paragraphs
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-sm text-text-secondary leading-relaxed my-3">
        {children}
      </p>
    ),
    
    // Lists
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="my-3 ml-4 space-y-1.5 list-none">
        {children}
      </ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="my-3 ml-4 space-y-1.5 list-decimal list-inside">
        {children}
      </ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="text-sm text-text-secondary leading-relaxed flex gap-2">
        <span className="text-accent shrink-0">•</span>
        <span>{children}</span>
      </li>
    ),
    
    // Links
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a 
        href={href} 
        className="text-accent hover:text-accent/80 underline underline-offset-2 decoration-accent/50 hover:decoration-accent transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    
    // Strong/Bold
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-text-primary">
        {children}
      </strong>
    ),
    
    // Emphasis/Italic
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic text-text-secondary">
        {children}
      </em>
    ),
    
    // Blockquotes
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="my-4 pl-4 border-l-4 border-accent/50 bg-surface/50 py-2 pr-4 rounded-r-lg italic text-text-muted">
        {children}
      </blockquote>
    ),
    
    // Horizontal rules
    hr: () => (
      <hr className="my-6 border-t border-border" />
    ),
    
    // Tables
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className="my-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: { children?: React.ReactNode }) => (
      <thead className="bg-surface-elevated border-b border-border">
        {children}
      </thead>
    ),
    tbody: ({ children }: { children?: React.ReactNode }) => (
      <tbody className="divide-y divide-border">
        {children}
      </tbody>
    ),
    tr: ({ children }: { children?: React.ReactNode }) => (
      <tr className="hover:bg-surface/50 transition-colors">
        {children}
      </tr>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th className="px-4 py-2.5 text-left font-semibold text-text-primary">
        {children}
      </th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td className="px-4 py-2.5 text-text-secondary">
        {children}
      </td>
    ),
    
    // Code blocks
    code: ({ className, children, ...props }: { className?: string; children?: React.ReactNode; node?: unknown }) => {
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : ''
      const codeContent = String(children).replace(/\n$/, '')
      
      // Handle mermaid diagrams
      if (language === 'mermaid') {
        return <MermaidDiagram chart={codeContent} />
      }
      
      // Regular code blocks (detected by having a language or being inside pre)
      if (language) {
        return (
          <div className="my-4 rounded-lg border border-border overflow-hidden">
            <div className="px-3 py-1.5 bg-surface-elevated border-b border-border text-xs text-text-muted font-mono">
              {language}
            </div>
            <pre className="bg-surface p-4 overflow-x-auto">
              <code className="text-xs font-mono text-text-secondary leading-relaxed" {...props}>
                {children}
              </code>
            </pre>
          </div>
        )
      }
      
      if (codeContent.includes('\n')) {
        return (
          <div className="my-4 rounded-lg border border-border overflow-hidden">
            <pre className="bg-surface p-4 overflow-x-auto">
              <code className="text-xs font-mono text-text-secondary leading-relaxed" {...props}>
                {children}
              </code>
            </pre>
          </div>
        )
      }

      // Inline code
      return (
        <code className="text-accent bg-surface/80 px-1.5 py-0.5 rounded text-xs font-mono border border-border/50" {...props}>
          {children}
        </code>
      )
    },
    pre: ({ children }: { children?: React.ReactNode }) => {
      // Just pass through - let the code component handle styling
      return <>{children}</>
    },
    
    // Task lists (checkboxes)
    input: ({ type, checked }: { type?: string; checked?: boolean }) => {
      if (type === 'checkbox') {
        return (
          <span className={`inline-flex items-center justify-center w-4 h-4 mr-2 rounded border ${
            checked 
              ? 'bg-accent border-accent text-white' 
              : 'border-border bg-surface'
          }`}>
            {checked && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
        )
      }
      return null
    },
  }), [])

  return (
    <div className="p-6 max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}

// Mermaid diagram component
function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const idRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    const renderDiagram = async () => {
      if (!chart.trim()) return
      
      try {
        setError(null)
        const { svg: renderedSvg } = await mermaid.render(idRef.current, chart)
        setSvg(renderedSvg)
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
      }
    }

    renderDiagram()
  }, [chart])

  if (error) {
    return (
      <div className="my-4 p-4 bg-status-failed/10 border border-status-failed/30 rounded-lg">
        <div className="flex items-center gap-2 text-status-failed text-sm mb-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Mermaid diagram error</span>
        </div>
        <pre className="text-xs text-text-muted font-mono whitespace-pre-wrap">{error}</pre>
        <details className="mt-2">
          <summary className="text-xs text-text-muted cursor-pointer hover:text-text-secondary">Show source</summary>
          <pre className="mt-2 text-xs text-text-muted font-mono whitespace-pre-wrap bg-surface p-2 rounded">{chart}</pre>
        </details>
      </div>
    )
  }

  if (!svg) {
    return (
      <div className="my-4 p-4 bg-surface border border-border rounded-lg flex items-center justify-center">
        <svg className="w-5 h-5 animate-spin text-text-muted" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="my-4 p-4 bg-surface border border-border rounded-lg overflow-x-auto flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

function JsonContent({ content }: { content: string }) {
  let formattedJson: string
  let parseError = false

  try {
    const parsed = JSON.parse(content)
    formattedJson = JSON.stringify(parsed, null, 2)
  } catch {
    // If it's not valid JSON, show as-is
    formattedJson = content
    parseError = true
  }

  return (
    <div className="p-4">
      {parseError && (
        <div className="mb-3 px-3 py-2 bg-status-failed/10 border border-status-failed/30 rounded-lg text-xs text-status-failed">
          Warning: Invalid JSON format - showing raw content
        </div>
      )}
      <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap break-words leading-relaxed bg-surface rounded-lg border border-border p-4 overflow-x-auto">
        <JsonSyntaxHighlight content={formattedJson} />
      </pre>
    </div>
  )
}

function JsonSyntaxHighlight({ content }: { content: string }) {
  // Simple syntax highlighting for JSON
  const highlighted = content
    .replace(/"([^"]+)":/g, '<span class="text-blue-400">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="text-green-400">"$1"</span>')
    .replace(/: (\d+)/g, ': <span class="text-amber-400">$1</span>')
    .replace(/: (true|false)/g, ': <span class="text-purple-400">$1</span>')
    .replace(/: (null)/g, ': <span class="text-red-400">$1</span>')

  return <span dangerouslySetInnerHTML={{ __html: highlighted }} />
}

