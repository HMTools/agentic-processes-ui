import { useState, useEffect, useCallback, useMemo } from 'react'
import { Terminal, getTerminalApi } from './Terminal'
import { useSettings } from '../../hooks/useSettings'
import type { AgentSession, AgentType, ProcessInstance, ExternalSession, ChannelEndpoint } from '../../types'

interface AgentSessionPanelProps {
  process?: ProcessInstance
  processPath?: string
  projectPath: string
  onClose?: () => void
  externalSession?: ExternalSession | null
  onMigrateSession?: () => Promise<void>
}

export function AgentSessionPanel({
  process,
  processPath,
  projectPath,
  onClose,
  externalSession,
  onMigrateSession
}: AgentSessionPanelProps) {
  const { settings } = useSettings()
  const [session, setSession] = useState<AgentSession | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableAgents, setAvailableAgents] = useState<Array<{ type: AgentType; displayName: string; available: boolean }>>([])
  const [isMigrating, setIsMigrating] = useState(false)
  const [channelEndpoints, setChannelEndpoints] = useState<ChannelEndpoint[]>([])

  // Load channel endpoints
  useEffect(() => {
    if (!window.electronAPI?.channelList) return
    window.electronAPI.channelList().then(setChannelEndpoints)

    const unsubAvailable = window.electronAPI.onChannelAvailable?.(() => {
      window.electronAPI.channelList().then(setChannelEndpoints)
    })
    const unsubRemoved = window.electronAPI.onChannelRemoved?.(() => {
      window.electronAPI.channelList().then(setChannelEndpoints)
    })
    return () => { unsubAvailable?.(); unsubRemoved?.() }
  }, [])

  const hasChannel = channelEndpoints.length > 0

  // Load available agent types
  useEffect(() => {
    window.electronAPI.agentGetAvailable().then(setAvailableAgents)
  }, [])

  // Check for existing session for this process
  useEffect(() => {
    if (!processPath) return

    window.electronAPI.agentGetForProcess(processPath).then(result => {
      if (result.success && result.sessions.length > 0) {
        // Use the first active session
        const activeSession = result.sessions.find(s => s.status === 'running')
        if (activeSession) {
          setSession(activeSession)
        }
      }
    })
  }, [processPath])

  // Subscribe to session status updates
  useEffect(() => {
    if (!session) return

    const unsubscribe = window.electronAPI.onAgentStatus((event) => {
      if (event.sessionId === session.id) {
        setSession(prev => prev ? { ...prev, status: event.status } : null)
        if (event.error) {
          setError(event.error)
        }
      }
    })

    return unsubscribe
  }, [session?.id])

  // Subscribe to terminal output
  useEffect(() => {
    if (!session) return

    const unsubscribe = window.electronAPI.onAgentOutput((event) => {
      if (event.sessionId === session.id) {
        const terminalApi = getTerminalApi(session.id)
        terminalApi?.write(event.data)
      }
    })

    return unsubscribe
  }, [session?.id])

  // Start a new agent session
  const startSession = useCallback(async () => {
    setIsStarting(true)
    setError(null)

    try {
      const result = await window.electronAPI.agentCreate(
        settings.agent.defaultAgentType,
        projectPath,
        processPath,
        { permissionMode: settings.agent.permissionMode }
      )

      if (result.success && result.session) {
        setSession(result.session)
      } else {
        setError(result.error || 'Failed to start agent session')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsStarting(false)
    }
  }, [settings.agent.defaultAgentType, projectPath, processPath])

  // Stop the session
  const stopSession = useCallback(async () => {
    if (!session) return

    try {
      await window.electronAPI.agentKill(session.id)
      setSession(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop session')
    }
  }, [session])

  // Handle terminal input
  const handleTerminalData = useCallback((data: string) => {
    if (session) {
      window.electronAPI.agentInput(session.id, data)
    }
  }, [session])

  // Handle terminal resize
  const handleTerminalResize = useCallback((cols: number, rows: number) => {
    if (session) {
      window.electronAPI.agentResize(session.id, cols, rows)
    }
  }, [session])

  // Get status color
  const statusColor = useMemo(() => {
    switch (session?.status) {
      case 'running':
        return 'text-status-active'
      case 'starting':
        return 'text-status-paused'
      case 'stopped':
        return 'text-status-pending'
      case 'error':
        return 'text-status-failed'
      default:
        return 'text-text-muted'
    }
  }, [session?.status])

  // Pop out to detached terminal window
  const popOutTerminal = useCallback(() => {
    if (session && processPath) {
      window.electronAPI.openTerminalWindow(
        session.id,
        processPath,
        process?.name || 'Agent Terminal'
      )
    }
  }, [session, processPath, process?.name])

  // Handle external session migration
  const handleMigrate = useCallback(async () => {
    if (!onMigrateSession) return
    setIsMigrating(true)
    setError(null)
    try {
      await onMigrateSession()
      // After migration, refresh to pick up the new session
      if (processPath) {
        const result = await window.electronAPI.agentGetForProcess(processPath)
        if (result.success && result.sessions.length > 0) {
          const activeSession = result.sessions.find(s => s.status === 'running')
          if (activeSession) {
            setSession(activeSession)
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to migrate session')
    } finally {
      setIsMigrating(false)
    }
  }, [onMigrateSession, processPath])

  // Get the display name for current agent type
  const agentDisplayName = useMemo(() => {
    const agent = availableAgents.find(a => a.type === settings.agent.defaultAgentType)
    return agent?.displayName || 'Agent'
  }, [availableAgents, settings.agent.defaultAgentType])

  return (
    <div className="flex flex-col h-full bg-background border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-elevated">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-accent/20">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-primary">
              {agentDisplayName}
            </h3>
            {session && (
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    session.status === 'running' ? 'bg-status-active animate-pulse' :
                    session.status === 'starting' ? 'bg-status-paused' :
                    session.status === 'error' ? 'bg-status-failed' : 'bg-status-pending'
                  }`} />
                  <span className={statusColor}>
                    {session.status === 'running' ? 'Connected' :
                     session.status === 'starting' ? 'Starting...' :
                     session.status === 'error' ? 'Error' : 'Disconnected'}
                  </span>
                </div>
                {hasChannel && (
                  <div className="flex items-center gap-1" title={`Channel on port ${channelEndpoints[0]?.port}`}>
                    <svg className="w-3 h-3 text-status-completed" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0" />
                    </svg>
                    <span className="text-status-completed">Channel</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session?.status === 'running' ? (
            <>
              <button
                onClick={popOutTerminal}
                className="p-1.5 rounded-md hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
                title="Pop out to separate window"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
              <button
                onClick={stopSession}
                className="p-1.5 rounded-md hover:bg-status-failed/20 text-status-failed transition-colors"
                title="Stop agent"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={startSession}
              disabled={isStarting}
              className="px-3 py-1 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
              {isStarting ? 'Starting...' : 'Start Agent'}
            </button>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
              title="Close panel"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Process info banner */}
      {process && (
        <div className="px-4 py-2 bg-surface border-b border-border">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Attached to:</span>
            <span className="text-text-primary font-medium">{process.name}</span>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-status-failed/10 border-b border-status-failed/30">
          <div className="flex items-center gap-2 text-xs text-status-failed">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto hover:text-status-failed/80"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Terminal area */}
      <div className="flex-1 min-h-0">
        {session ? (
          <Terminal
            sessionId={session.id}
            fontSize={settings.agent.terminalFontSize}
            onData={handleTerminalData}
            onResize={handleTerminalResize}
          />
        ) : externalSession && onMigrateSession ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="p-4 rounded-full bg-yellow-500/10 mb-4">
              <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h4 className="text-sm font-medium text-text-primary mb-1">
              External Session Detected
            </h4>
            <p className="text-xs text-text-muted mb-4 max-w-xs">
              A Claude Code session is attached to this process from an external terminal{externalSession.pid > 0 ? ` (PID: ${externalSession.pid})` : ''}.
              You can migrate it here to continue working in the UI.
            </p>
            <button
              onClick={handleMigrate}
              disabled={isMigrating}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
              {isMigrating ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Migrating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Migrate Session
                </span>
              )}
            </button>
            <div className="mt-4 pt-4 border-t border-border w-full max-w-xs">
              <p className="text-xs text-text-muted mb-2">Or start a fresh session instead:</p>
              <button
                onClick={startSession}
                disabled={isStarting}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-surface-elevated text-text-secondary hover:text-text-primary border border-border hover:border-accent/50 transition-colors"
              >
                {isStarting ? 'Starting...' : `Start New ${agentDisplayName}`}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="p-4 rounded-full bg-surface-elevated mb-4">
              <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-sm font-medium text-text-primary mb-1">
              No Agent Session
            </h4>
            <p className="text-xs text-text-muted mb-4 max-w-xs">
              Start an agent session to interact with your process using {agentDisplayName}
            </p>
            <button
              onClick={startSession}
              disabled={isStarting}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
              {isStarting ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Starting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start {agentDisplayName}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Footer with session info */}
      {session && (
        <div className="px-4 py-2 border-t border-border bg-surface text-xs text-text-muted">
          <div className="flex items-center justify-between">
            <span>Session: {session.id.slice(0, 8)}...</span>
            <span>{new Date(session.createdAt).toLocaleTimeString()}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export { Terminal, getTerminalApi }
