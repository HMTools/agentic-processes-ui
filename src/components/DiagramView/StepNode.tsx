import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { ProcessStep, ProcessStatus } from '../../types'

interface StepNodeData {
  step: ProcessStep
  isActive: boolean
  processStatus: ProcessStatus
  currentSubstep?: { number: number; name: string }
  totalSubsteps?: number
  hasPendingInteraction?: boolean
}

interface StepNodeProps {
  data: StepNodeData
  selected: boolean
}

export const StepNode = memo(function StepNode({ data, selected }: StepNodeProps) {
  const { step, isActive, processStatus, hasPendingInteraction } = data
  const isWaitingForUser = hasPendingInteraction && isActive && step.approvalRequired && !step.approved

  const getNodeStyle = () => {
    if (processStatus === 'failed' && isActive) {
      return 'border-status-failed bg-status-failed/10 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
    }
    if (step.status === 'completed') {
      return 'border-status-completed bg-status-completed/10'
    }
    if (isWaitingForUser) {
      return 'border-status-waiting bg-status-waiting/10 shadow-[0_0_20px_rgba(244,114,182,0.4)] animate-pulse-urgent'
    }
    if (step.status === 'in_progress' || isActive) {
      return 'border-status-active bg-status-active/10 shadow-[0_0_20px_rgba(34,211,238,0.4)] animate-pulse-slow'
    }
    if (step.status === 'awaiting_approval') {
      return 'border-status-paused bg-status-paused/10 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
    }
    if (step.status === 'skipped') {
      return 'border-status-pending bg-surface opacity-50'
    }
    return 'border-border bg-surface'
  }

  const getStatusIcon = () => {
    if (step.status === 'completed') {
      return (
        <svg className="w-4 h-4 text-status-completed" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
    if (isWaitingForUser) {
      return (
        <svg className="w-4 h-4 text-status-waiting" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    }
    if (step.status === 'in_progress' || isActive) {
      return (
        <div className="w-4 h-4 rounded-full border-2 border-status-active border-t-transparent animate-spin" />
      )
    }
    if (step.status === 'awaiting_approval') {
      return (
        <svg className="w-4 h-4 text-status-paused" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
    if (processStatus === 'failed' && isActive) {
      return (
        <svg className="w-4 h-4 text-status-failed" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
    return (
      <div className="w-4 h-4 rounded-full border-2 border-status-pending" />
    )
  }

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 min-w-[200px] max-w-[280px]
        transition-all duration-300
        ${getNodeStyle()}
        ${selected ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : ''}
      `}
    >
      {/* Top handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-border !border-none !w-2 !h-2"
      />

      {/* Step content */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-text-muted">
              #{step.number}
            </span>
            {step.approvalRequired && (
              <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                step.approved ? 'bg-status-completed/20 text-status-completed'
                  : isWaitingForUser ? 'bg-status-waiting/20 text-status-waiting'
                  : 'bg-status-paused/20 text-status-paused'
              }`}>
                {step.approved ? 'Approved' : isWaitingForUser ? 'Action Required' : 'Approval'}
              </span>
            )}
          </div>
          <h4 className="text-sm font-medium text-text-primary leading-tight">
            {step.name}
          </h4>
          {isActive && data.currentSubstep && data.totalSubsteps && (
            <div className="text-[10px] text-text-muted mt-0.5 truncate">
              Substep {data.currentSubstep.number}/{data.totalSubsteps}: {data.currentSubstep.name}
            </div>
          )}
          {step.stepRef && (
            <p className="text-[10px] text-text-muted mt-1 font-mono truncate">
              {step.stepRef.startsWith('@') ? step.stepRef.replace('@step:', '').replace('@framework-step:', '').replace('@user-step:', '') : step.stepRef}
            </p>
          )}
        </div>
      </div>

      {/* Timestamps */}
      {(step.startedAt || step.completedAt) && (
        <div className="mt-2 pt-2 border-t border-border/50 text-[10px] text-text-muted">
          {step.startedAt && !step.completedAt && (
            <span>Started: {formatTime(step.startedAt)}</span>
          )}
          {step.completedAt && (
            <span>Completed: {formatTime(step.completedAt)}</span>
          )}
        </div>
      )}

      {/* Bottom handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-border !border-none !w-2 !h-2"
      />

      {/* Right handle - for connecting to sub-processes */}
      <Handle
        type="source"
        position={Position.Right}
        id="subprocess"
        className="!bg-violet-500 !border-none !w-2 !h-2"
      />
    </div>
  )
})

function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

