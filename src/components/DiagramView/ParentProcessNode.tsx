import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

interface ParentProcessNodeData {
  id: string
  name: string
  processPath: string
  returnToStep: number
  onNavigate?: () => void
  isHighlighted?: boolean
}

interface ParentProcessNodeProps {
  data: ParentProcessNodeData
  selected: boolean
}

export const ParentProcessNode = memo(function ParentProcessNode({ data, selected }: ParentProcessNodeProps) {
  const { name, returnToStep, onNavigate, isHighlighted } = data

  const handleNavigateClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent node selection
    onNavigate?.()
  }

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 min-w-[200px] max-w-[280px]
        transition-all duration-300
        border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.3)]
        ${selected ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-background' : ''}
        ${isHighlighted ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-background animate-highlight-pulse shadow-[0_0_30px_rgba(34,211,238,0.5)]' : ''}
      `}
    >
      {/* Parent process content */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {/* Parent icon */}
          <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          {/* Parent indicator */}
          <div className="flex items-center gap-1.5 mb-1">
            <svg className="w-3 h-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider">
              Parent Process
            </span>
          </div>
          
          {/* Name */}
          <h4 className="text-sm font-medium text-text-primary leading-tight truncate">
            {name}
          </h4>
          
          {/* Return step info */}
          <p className="text-[10px] text-text-muted mt-1 font-mono">
            Returns to Step {returnToStep}
          </p>
        </div>
      </div>

      {/* Navigate button */}
      <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between">
        <span className="text-[10px] text-amber-400">
          Double-click or use button
        </span>
        <button
          onClick={handleNavigateClick}
          className="p-1 rounded hover:bg-amber-500/20 transition-colors group"
          title="Open parent process (or double-click)"
        >
          <svg 
            className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
            />
          </svg>
        </button>
      </div>

      {/* Bottom handle - connects to first step */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-amber-500 !border-none !w-2 !h-2"
      />
    </div>
  )
})

