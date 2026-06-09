import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

interface SubstepNodeData {
  substep: {
    number: number
    name: string
    conditional?: boolean
    description?: string
  }
  status: 'completed' | 'active' | 'pending'
}

interface SubstepNodeProps {
  data: SubstepNodeData
}

export const SubstepNode = memo(function SubstepNode({ data }: SubstepNodeProps) {
  const { substep, status } = data

  const getNodeStyle = () => {
    if (status === 'completed') {
      return 'border-status-completed bg-status-completed/10'
    }
    if (status === 'active') {
      return 'border-status-active bg-status-active/10 shadow-[0_0_12px_rgba(34,211,238,0.3)] animate-pulse-slow'
    }
    return 'border-border bg-surface'
  }

  const getStatusIcon = () => {
    if (status === 'completed') {
      return (
        <svg className="w-3 h-3 text-status-completed" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
    if (status === 'active') {
      return (
        <div className="w-3 h-3 rounded-full border-2 border-status-active border-t-transparent animate-spin" />
      )
    }
    return (
      <div className="w-3 h-3 rounded-full border-2 border-status-pending" />
    )
  }

  return (
    <div
      className={`
        px-3 py-2 rounded-md border-2 min-w-[180px] max-w-[220px]
        transition-all duration-300
        ${getNodeStyle()}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-border !border-none !w-1.5 !h-1.5"
      />

      <div className="flex items-center gap-2">
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-text-muted">
              {substep.number}
            </span>
            {substep.conditional && (
              <span className="px-1 py-0 text-[8px] font-medium rounded bg-status-paused/20 text-status-paused">
                Cond
              </span>
            )}
          </div>
          <p className="text-xs text-text-primary leading-tight truncate">
            {substep.name}
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-border !border-none !w-1.5 !h-1.5"
      />
    </div>
  )
})
