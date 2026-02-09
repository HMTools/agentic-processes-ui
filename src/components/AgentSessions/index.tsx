import { useState, useCallback, useMemo } from 'react'
import { useAgentSessions } from '../../hooks/useAgentSessions'
import type { AgentSession, AgentSessionStatus, ProcessInstance } from '../../types'

type FilterStatus = 'all' | 'running' | 'stopped'

interface AgentSessionsProps {
  onBack: () => void
  onNavigateToProcess?: (processPath: string) => void
  getProcess?: (path: string) => ProcessInstance | undefined
}

export function AgentSessions({ onBack, onNavigateToProcess, getProcess }: AgentSessionsProps) {
  const { sessions, isLoading, error, killSession, refresh } = useAgentSessions()
  const [filter, setFilter] = useState<FilterStatus>('all')

  const filteredSessions = useMemo(() => {
    if (filter === 'all') return sessions
    if (filter === 'running') return sessions.filter(s => s.status === 'running' || s.status === 'starting')
    return sessions.filter(s => s.status === 'stopped' || s.status === 'error')
  }, [sessions, filter])

  const runningSessions = useMemo(
    () => sessions.filter(s => s.status === 'running' || s.status === 'starting'),
    [sessions]
  )
  const stoppedSessions = useMemo(
    () => sessions.filter(s => s.status === 'stopped' || s.status === 'error'),
    [sessions]
  )

  const handleKill = useCallback(async (sessionId: string) => {
    await killSession(sessionId)
  }, [killSession])

  const handlePopOut = useCallback((session: AgentSession) => {
    const process = session.attachedProcessPath ? getProcess?.(session.attachedProcessPath) : undefined
    const displayName = process?.name 
      || (session.attachedProcessPath ? getProcessFolderName(session.attachedProcessPath) : null)
      || `Agent Session ${session.id.slice(0, 8)}`
    
    window.electronAPI.openTerminalWindow(
      session.id,
      session.attachedProcessPath || '', // Use empty string if no process
      `Agent - ${displayName}`
    )
  }, [getProcess])

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-md hover:bg-surface transition-colors"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-text-primary">Agent Sessions</h1>
              <p className="text-xs text-text-muted">
                {sessions.length} total session{sessions.length !== 1 ? 's' : ''}
                {runningSessions.length > 0 && ` (${runningSessions.length} running)`}
              </p>
            </div>
          </div>

          <button
            onClick={refresh}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-surface transition-colors disabled:opacity-50"
            title="Refresh sessions"
          >
            <svg
              className={`w-5 h-5 text-text-secondary ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {([
            { key: 'all' as FilterStatus, label: 'All', count: sessions.length },
            { key: 'running' as FilterStatus, label: 'Running', count: runningSessions.length },
            { key: 'stopped' as FilterStatus, label: 'Stopped', count: stoppedSessions.length },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                ${filter === tab.key
                  ? 'bg-accent text-background'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                }
              `}
            >
              {tab.label}
              <span className="ml-1.5 opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-status-failed/10 border border-status-failed/30 rounded-lg">
          <div className="flex items-center gap-2 text-status-failed text-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Session list */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredSessions.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="space-y-3">
            {filteredSessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                onKill={handleKill}
                onPopOut={handlePopOut}
                onNavigateToProcess={onNavigateToProcess}
                getProcess={getProcess}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Session Card
// ============================================================================

interface SessionCardProps {
  session: AgentSession
  onKill: (sessionId: string) => void
  onPopOut: (session: AgentSession) => void
  onNavigateToProcess?: (processPath: string) => void
  getProcess?: (path: string) => ProcessInstance | undefined
}

function SessionCard({ session, onKill, onPopOut, onNavigateToProcess, getProcess }: SessionCardProps) {
  const statusConfig = getStatusConfig(session.status)
  const resolvedProcess = session.attachedProcessPath ? getProcess?.(session.attachedProcessPath) : undefined
  const processName = resolvedProcess?.name
    || (session.attachedProcessPath ? getProcessFolderName(session.attachedProcessPath) : null)

  return (
    <div className="p-4 bg-surface rounded-lg border border-border">
      <div className="flex items-start justify-between gap-3">
        {/* Left side: Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {/* Status dot */}
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusConfig.dotClass}`} />
            <span className={`text-xs font-medium ${statusConfig.textClass}`}>
              {statusConfig.label}
            </span>
            <span className="text-[10px] text-text-muted font-mono">
              {session.id.slice(0, 8)}...
            </span>
          </div>

          {/* Agent type */}
          <div className="flex items-center gap-2 text-xs text-text-secondary mb-1">
            <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="capitalize">{session.agentType.replace('-', ' ')}</span>
          </div>

          {/* Attached process */}
          {processName && (
            <div className="flex items-center gap-2 text-xs mb-1">
              <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {onNavigateToProcess && session.attachedProcessPath ? (
                <button
                  onClick={() => onNavigateToProcess(session.attachedProcessPath!)}
                  className="text-accent hover:underline truncate"
                >
                  {processName}
                </button>
              ) : (
                <span className="text-text-secondary truncate">{processName}</span>
              )}
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-[10px] text-text-muted mt-1.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Created {new Date(session.createdAt).toLocaleString()}
          </div>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {session.status === 'running' && (
            <button
              onClick={() => onPopOut(session)}
              className="p-1.5 rounded-md hover:bg-surface-elevated text-text-muted hover:text-text-primary transition-colors"
              title="Open in terminal window"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          )}
          {(session.status === 'running' || session.status === 'starting') && (
            <button
              onClick={() => onKill(session.id)}
              className="p-1.5 rounded-md hover:bg-status-failed/20 text-text-muted hover:text-status-failed transition-colors"
              title="Kill session"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Extract the process folder name from a process path.
 * e.g. "C:\...\process-set-user-interaction-options-20260205\process.json"
 *   -> "process-set-user-interaction-options-20260205"
 */
function getProcessFolderName(processPath: string): string | null {
  const segments = processPath.split(/[/\\]/).filter(Boolean)
  // If the last segment is a file (e.g. process.json), use the parent directory
  const lastSegment = segments[segments.length - 1]
  if (lastSegment && lastSegment.includes('.')) {
    return segments[segments.length - 2] || lastSegment
  }
  return lastSegment || null
}

function getStatusConfig(status: AgentSessionStatus): { label: string; dotClass: string; textClass: string } {
  switch (status) {
    case 'running':
      return { label: 'Running', dotClass: 'bg-status-active animate-pulse', textClass: 'text-status-active' }
    case 'starting':
      return { label: 'Starting', dotClass: 'bg-status-paused', textClass: 'text-status-paused' }
    case 'stopped':
      return { label: 'Stopped', dotClass: 'bg-text-muted', textClass: 'text-text-muted' }
    case 'error':
      return { label: 'Error', dotClass: 'bg-status-failed', textClass: 'text-status-failed' }
    default:
      return { label: status, dotClass: 'bg-text-muted', textClass: 'text-text-muted' }
  }
}

function EmptyState({ filter }: { filter: FilterStatus }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-surface flex items-center justify-center">
        <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-text-secondary text-sm">
        {filter === 'all' ? 'No agent sessions' : `No ${filter} sessions`}
      </p>
      <p className="text-text-muted text-xs mt-1">
        Agent sessions are created when you start a new process or attach an agent from the process view.
      </p>
    </div>
  )
}
