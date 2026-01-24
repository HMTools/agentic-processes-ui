import { memo, useState, useCallback } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { ProcessStatus, ProcessInstance } from '../../types'
import { useSettings } from '../../hooks/useSettings'
import { LazyPromptModal } from '../LazyPromptModal'

interface SubProcessNodeData {
  id: string
  name: string
  template: string
  status: ProcessStatus
  spawnedAtStep: number
  onNavigate?: () => void
  isHighlighted?: boolean
  // For lazy prompts
  subProcess?: ProcessInstance
  subProcessPath?: string
}

interface SubProcessNodeProps {
  data: SubProcessNodeData
  selected: boolean
}

export const SubProcessNode = memo(function SubProcessNode({ data, selected }: SubProcessNodeProps) {
  const { name, template, status, onNavigate, isHighlighted, subProcess, subProcessPath } = data
  const { settings } = useSettings()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleNavigateClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent node selection
    onNavigate?.()
  }

  const handleLazyPromptClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!subProcess || !subProcessPath) return
    setIsModalOpen(true)
  }, [subProcess, subProcessPath])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const showLazyPromptButton = settings.lazyPrompts.enabled && subProcess && subProcessPath
  
  const getNodeStyle = () => {
    if (status === 'completed') {
      return 'border-status-completed bg-status-completed/10'
    }
    if (status === 'running') {
      return 'border-violet-500 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.3)] animate-pulse-slow'
    }
    if (status === 'failed') {
      return 'border-status-failed bg-status-failed/10 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
    }
    if (status === 'paused') {
      return 'border-status-paused bg-status-paused/10'
    }
    return 'border-border bg-surface'
  }

  const getStatusIcon = () => {
    if (status === 'completed') {
      return (
        <svg className="w-3.5 h-3.5 text-status-completed" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
    if (status === 'running') {
      return (
        <div className="w-3.5 h-3.5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      )
    }
    if (status === 'failed') {
      return (
        <svg className="w-3.5 h-3.5 text-status-failed" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
    if (status === 'paused') {
      return (
        <svg className="w-3.5 h-3.5 text-status-paused" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
        </svg>
      )
    }
    return (
      <div className="w-3.5 h-3.5 rounded-full border-2 border-status-pending" />
    )
  }

  return (
    <>
      <div
        className={`
          px-3 py-2.5 rounded-lg border-2 border-dashed min-w-[160px] max-w-[220px]
          transition-all duration-300
          ${getNodeStyle()}
          ${selected ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-background' : ''}
          ${isHighlighted ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-background animate-highlight-pulse shadow-[0_0_30px_rgba(34,211,238,0.5)]' : ''}
        `}
      >
        {/* Left handle - connects from parent step */}
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-violet-500 !border-none !w-2 !h-2"
        />

        {/* Sub-process content */}
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-0.5">
            {getStatusIcon()}
          </div>
          <div className="flex-1 min-w-0">
            {/* Sub-process indicator */}
            <div className="flex items-center gap-1.5 mb-1">
              <svg className="w-3 h-3 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <span className="text-[10px] font-medium text-violet-400 uppercase tracking-wider">
                Sub-Process
              </span>
            </div>
            
            {/* Name */}
            <h4 className="text-xs font-medium text-text-primary leading-tight truncate">
              {name || template}
            </h4>
            
            {/* Template */}
            <p className="text-[10px] text-text-muted mt-1 font-mono truncate">
              {template}
            </p>
          </div>
        </div>

        {/* Status badge and action buttons */}
        <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between">
          <span className={`
            text-[10px] px-1.5 py-0.5 rounded-full font-medium
            ${status === 'completed' ? 'bg-status-completed/20 text-status-completed' :
              status === 'running' ? 'bg-violet-500/20 text-violet-400' :
              status === 'failed' ? 'bg-status-failed/20 text-status-failed' :
              status === 'paused' ? 'bg-status-paused/20 text-status-paused' :
              'bg-status-pending/20 text-status-pending'}
          `}>
            {status}
          </span>
          
          <div className="flex items-center gap-1">
            {/* Lazy Prompt button */}
            {showLazyPromptButton && (
              <button
                onClick={handleLazyPromptClick}
                className="p-1 rounded hover:bg-accent/20 transition-colors group"
                title="Open lazy prompts"
              >
                <svg className="w-3.5 h-3.5 text-accent group-hover:text-accent-hover" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            )}
            
            {/* Navigate button */}
            <button
              onClick={handleNavigateClick}
              className="p-1 rounded hover:bg-violet-500/20 transition-colors group"
              title="Open sub-process (or double-click)"
            >
              <svg 
                className="w-3.5 h-3.5 text-violet-400 group-hover:text-violet-300" 
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
        </div>
      </div>

      {/* Lazy Prompt Modal */}
      {isModalOpen && subProcess && subProcessPath && (
        <LazyPromptModal
          process={subProcess}
          processPath={subProcessPath}
          onClose={handleCloseModal}
        />
      )}
    </>
  )
})
