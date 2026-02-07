import { useState, useEffect, useCallback } from 'react'
import { Terminal, getTerminalApi } from '../AgentSessionPanel/Terminal'
import { Header } from './Header'
import { useSettings } from '../../hooks/useSettings'
import type { AgentSessionStatus } from '../../types'

interface WindowParams {
  sessionId: string
  processPath: string
  processName: string
}

export function TerminalWindowApp() {
  const { settings } = useSettings()
  const [params, setParams] = useState<WindowParams | null>(null)
  const [status, setStatus] = useState<AgentSessionStatus>('running')
  const [isLoading, setIsLoading] = useState(true)

  // Load window params from main process
  useEffect(() => {
    window.electronAPI.getWindowParams().then((result) => {
      if (result) {
        setParams({
          sessionId: result.sessionId,
          processPath: result.processPath,
          processName: result.processName
        })
      }
      setIsLoading(false)
    })
  }, [])

  // Subscribe to status updates for this session
  useEffect(() => {
    if (!params) return

    const unsubscribe = window.electronAPI.onAgentStatus((event) => {
      if (event.sessionId === params.sessionId) {
        setStatus(event.status)
      }
    })

    return unsubscribe
  }, [params?.sessionId])

  // Subscribe to terminal output for this session
  useEffect(() => {
    if (!params) return

    const unsubscribe = window.electronAPI.onAgentOutput((event) => {
      if (event.sessionId === params.sessionId) {
        const terminalApi = getTerminalApi(params.sessionId)
        terminalApi?.write(event.data)
      }
    })

    return unsubscribe
  }, [params?.sessionId])

  // Handle terminal input
  const handleTerminalData = useCallback((data: string) => {
    if (params) {
      window.electronAPI.agentInput(params.sessionId, data)
    }
  }, [params])

  // Handle terminal resize
  const handleTerminalResize = useCallback((cols: number, rows: number) => {
    if (params) {
      window.electronAPI.agentResize(params.sessionId, cols, rows)
    }
  }, [params])

  // Handle close
  const handleClose = useCallback(() => {
    window.electronAPI.closeTerminalWindow()
  }, [])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-text-muted">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading terminal...</span>
        </div>
      </div>
    )
  }

  if (!params) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-text-muted">
        <div className="text-center">
          <p className="text-sm">Failed to load terminal parameters.</p>
          <button
            onClick={handleClose}
            className="mt-3 px-4 py-1.5 text-xs font-medium rounded-md bg-surface-elevated hover:bg-surface text-text-primary transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background text-text-primary">
      {/* Header with process info */}
      <Header
        processName={params.processName}
        sessionId={params.sessionId}
        status={status}
        onClose={handleClose}
      />

      {/* Terminal area */}
      <div className="flex-1 min-h-0">
        <Terminal
          sessionId={params.sessionId}
          fontSize={settings.agent.terminalFontSize}
          onData={handleTerminalData}
          onResize={handleTerminalResize}
        />
      </div>

      {/* Footer with session info */}
      <div className="px-4 py-2 border-t border-border bg-surface text-xs text-text-muted">
        <div className="flex items-center justify-between">
          <span>Session: {params.sessionId.slice(0, 8)}...</span>
          <span>{params.processPath ? params.processPath.split(/[/\\]/).pop() : 'No process'}</span>
        </div>
      </div>
    </div>
  )
}
