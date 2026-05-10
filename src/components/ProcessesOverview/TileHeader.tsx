import type { ProcessInstance } from '../../types'
import { getStatusColor, getStatusBgColor } from '../../services/processService'
import { LazyPromptButton } from '../LazyPromptButton'

interface TileHeaderProps {
  process: ProcessInstance
  processPath: string
  needsAttention: boolean
  onClose: () => void
  onExpand: () => void
}

export function TileHeader({ process, processPath, needsAttention, onClose, onExpand }: TileHeaderProps) {
  const completedSteps = process.steps.filter(s => s.status === 'completed').length
  const progress = Math.round((completedSteps / process.steps.length) * 100)

  return (
    <div className={`
      flex items-center gap-2 px-3 py-1.5 bg-surface border-b flex-shrink-0
      ${needsAttention ? 'border-status-failed/50' : 'border-border'}
    `}>
      {/* Status dot */}
      <span className={`
        w-2 h-2 rounded-full flex-shrink-0
        ${needsAttention ? 'animate-pulse' : ''}
        ${process.status === 'running' ? 'bg-status-active' :
          process.status === 'completed' ? 'bg-status-completed' :
          process.status === 'failed' ? 'bg-status-failed' :
          process.status === 'paused' ? 'bg-status-paused' :
          'bg-status-pending'
        }
      `} />

      {/* Name */}
      <span className="flex-1 truncate text-xs font-mono font-medium text-text-primary">
        {process.name}
      </span>

      {/* Progress */}
      <span className="text-[10px] text-text-muted flex-shrink-0">
        {completedSteps}/{process.steps.length}
      </span>

      {/* Status badge */}
      <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${getStatusBgColor(process.status)} border`}>
        {process.status}
      </span>

      {/* Lazy Prompts */}
      <LazyPromptButton
        process={process}
        processPath={processPath}
        projectPath={process.metadata.projectPaths?.[0] || process.metadata.projectPath || ''}
        variant="icon-only"
      />

      {/* Expand button */}
      <button
        onClick={onExpand}
        className="p-1 rounded hover:bg-surface-elevated transition-colors text-text-muted hover:text-text-primary"
        title="Open full view"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>

      {/* Close button */}
      <button
        onClick={onClose}
        className="p-1 rounded hover:bg-surface-elevated transition-colors text-text-muted hover:text-text-primary"
        title="Close tile"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
