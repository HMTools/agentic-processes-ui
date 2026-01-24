import type { ProcessSummary, ProcessInstance } from '../../types'
import { getStatusColor, getStatusBgColor, formatRelativeTime, getProgressPercentage } from '../../services/processService'
import { LazyPromptButton } from '../LazyPromptButton'

interface ProcessCardProps {
  process: ProcessSummary
  fullProcess?: ProcessInstance
  onClick: () => void
  isSelected?: boolean
}

export function ProcessCard({ process, fullProcess, onClick, isSelected }: ProcessCardProps) {
  const progress = fullProcess ? getProgressPercentage(fullProcess) : 
    Math.round((process.currentStep / process.totalSteps) * 100)
  
  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-lg border cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'bg-accent/10 border-accent shadow-glow-cyan' 
          : 'bg-surface border-border hover:border-accent/50 hover:bg-surface-elevated'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-mono text-sm font-medium text-text-primary truncate">
            {process.name}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            {process.template}
          </p>
        </div>
        <StatusBadge status={process.status} />
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-text-secondary mb-1">
          <span>Step {process.currentStep} of {process.totalSteps}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              process.status === 'completed' ? 'bg-status-completed' :
              process.status === 'failed' ? 'bg-status-failed' :
              'bg-status-active'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current action */}
      <p className="text-xs text-text-secondary line-clamp-2 mb-2">
        {process.currentAction}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <FolderIcon className="w-3 h-3" />
          {process.folderStatus}
        </span>
        <div className="flex items-center gap-2">
          {fullProcess && (
            <LazyPromptButton 
              process={fullProcess}
              processPath={process.path}
              variant="icon-only"
            />
          )}
          <span>{formatRelativeTime(process.lastUpdated)}</span>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`
      px-2 py-0.5 text-xs font-medium rounded-full border
      ${getStatusBgColor(status as any)}
      ${getStatusColor(status as any)}
    `}>
      {status}
    </span>
  )
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  )
}

