import type { ProcessSummary, ProcessInstance } from '../../types'
import { getStatusColor, getProgressPercentage, formatRelativeTime } from '../../services/processService'

interface ProcessTreeItemProps {
  process: ProcessSummary
  fullProcess?: ProcessInstance
  depth: number
  isSelected: boolean
  needsAttention: boolean
  hasPendingInteraction?: boolean
  isExpanded: boolean
  hasChildren: boolean
  onSelect: (path: string, ctrlKey: boolean) => void
  onToggleExpand: (path: string) => void
  onContextMenu: (e: React.MouseEvent, path: string) => void
}

export function ProcessTreeItem({
  process,
  fullProcess,
  depth,
  isSelected,
  needsAttention,
  hasPendingInteraction,
  isExpanded,
  hasChildren,
  onSelect,
  onToggleExpand,
  onContextMenu
}: ProcessTreeItemProps) {
  const progress = fullProcess ? getProgressPercentage(fullProcess) : 0
  const completedSteps = fullProcess?.steps.filter(s => s.status === 'completed').length ?? 0
  const totalSteps = fullProcess?.steps.length ?? process.totalSteps

  return (
    <button
      className={`
        w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs transition-colors rounded-md
        ${isSelected
          ? 'bg-accent/20 text-accent'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
        }
      `}
      style={{ paddingLeft: `${8 + depth * 16}px` }}
      onClick={(e) => onSelect(process.path, e.ctrlKey || e.metaKey)}
      onContextMenu={(e) => onContextMenu(e, process.path)}
    >
      {/* Expand/collapse chevron */}
      {hasChildren ? (
        <span
          className="w-4 h-4 flex items-center justify-center flex-shrink-0 hover:text-text-primary"
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand(process.path)
          }}
        >
          <svg
            className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      ) : (
        <span className="w-4 flex-shrink-0" />
      )}

      {/* Status dot */}
      <span
        className={`
          w-2 h-2 rounded-full flex-shrink-0
          ${needsAttention ? 'animate-pulse' : ''}
          ${hasPendingInteraction ? 'bg-status-waiting' :
            process.status === 'running' ? 'bg-status-active' :
            process.status === 'completed' ? 'bg-status-completed' :
            process.status === 'failed' ? 'bg-status-failed' :
            process.status === 'paused' ? 'bg-status-paused' :
            'bg-status-pending'
          }
        `}
      />

      {/* Name */}
      <span className="flex-1 truncate font-mono">{process.name}</span>

      {/* Mini progress */}
      <span className={`flex-shrink-0 text-[10px] ${getStatusColor(process.status)}`}>
        {completedSteps}/{totalSteps}
      </span>
    </button>
  )
}
