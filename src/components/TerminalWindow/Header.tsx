import { useMemo } from 'react'
import type { AgentSessionStatus } from '../../types'

interface HeaderProps {
  processName: string
  sessionId: string
  status: AgentSessionStatus
  onClose: () => void
}

export function Header({ processName, sessionId, status, onClose }: HeaderProps) {
  const statusConfig = useMemo(() => {
    switch (status) {
      case 'running':
        return { label: 'Running', color: 'bg-status-active', textColor: 'text-status-active', pulse: true }
      case 'starting':
        return { label: 'Starting...', color: 'bg-status-paused', textColor: 'text-status-paused', pulse: true }
      case 'stopped':
        return { label: 'Stopped', color: 'bg-status-pending', textColor: 'text-status-pending', pulse: false }
      case 'error':
        return { label: 'Error', color: 'bg-status-failed', textColor: 'text-status-failed', pulse: false }
      default:
        return { label: 'Unknown', color: 'bg-text-muted', textColor: 'text-text-muted', pulse: false }
    }
  }, [status])

  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-elevated select-none"
         style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      {/* Left side: Process info */}
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-accent/20">
          <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-text-primary leading-tight">
            {processName || 'Agent Terminal'}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-text-muted font-mono">
              {sessionId.slice(0, 8)}...
            </span>
            <span className="text-text-muted">|</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.color} ${statusConfig.pulse ? 'animate-pulse' : ''}`} />
              <span className={`text-xs ${statusConfig.textColor}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Window controls */}
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-status-failed/20 text-text-muted hover:text-status-failed transition-colors"
          title="Close window"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
