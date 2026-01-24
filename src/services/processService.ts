import type { ProcessInstance, ProcessSummary, ProcessStatus } from '../types'

// Parse the folder status from the path
function getFolderStatus(path: string): 'active' | 'completed' | 'failed' {
  if (path.includes('/active/') || path.includes('\\active\\')) return 'active'
  if (path.includes('/completed/') || path.includes('\\completed\\')) return 'completed'
  if (path.includes('/failed/') || path.includes('\\failed\\')) return 'failed'
  return 'active' // default
}

// Convert a ProcessInstance to a ProcessSummary for the dashboard
export function toProcessSummary(process: ProcessInstance, path: string): ProcessSummary {
  const completedSteps = process.steps.filter(s => s.status === 'completed').length
  const totalSteps = process.steps.length
  
  return {
    id: process.id,
    name: process.name,
    status: process.status,
    template: process.metadata.template,
    currentStep: process.currentState.activeStepNumber,
    totalSteps,
    currentAction: process.currentState.currentAction,
    lastUpdated: process.metadata.lastUpdated,
    folderStatus: getFolderStatus(path),
    path
  }
}

// Calculate progress percentage
export function getProgressPercentage(process: ProcessInstance): number {
  if (process.steps.length === 0) return 0
  const completed = process.steps.filter(s => s.status === 'completed').length
  return Math.round((completed / process.steps.length) * 100)
}

// Get status color class
export function getStatusColor(status: ProcessStatus | StepStatus): string {
  switch (status) {
    case 'running':
    case 'in_progress':
      return 'text-status-active'
    case 'completed':
      return 'text-status-completed'
    case 'failed':
      return 'text-status-failed'
    case 'paused':
      return 'text-status-paused'
    case 'pending':
    case 'skipped':
    default:
      return 'text-status-pending'
  }
}

// Get status background color class
export function getStatusBgColor(status: ProcessStatus | StepStatus): string {
  switch (status) {
    case 'running':
    case 'in_progress':
      return 'bg-status-active/20 border-status-active'
    case 'completed':
      return 'bg-status-completed/20 border-status-completed'
    case 'failed':
      return 'bg-status-failed/20 border-status-failed'
    case 'paused':
      return 'bg-status-paused/20 border-status-paused'
    case 'pending':
    case 'skipped':
    default:
      return 'bg-status-pending/20 border-status-pending'
  }
}

// Format timestamp
export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format relative time
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatTimestamp(isoString)
}

type StepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

