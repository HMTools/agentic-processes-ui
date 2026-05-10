import type { ProcessInstance, ProcessSummary, ProcessStatus, StepStatus, StepId, ProcessStep } from '../types'

/**
 * Normalize step status values from hyphenated format (as written by agents)
 * to underscore format (as defined in TypeScript types).
 * e.g., "in-progress" → "in_progress", "awaiting-approval" → "awaiting_approval"
 */
function normalizeStepStatus(status: string): StepStatus {
  return status.replace(/-/g, '_') as StepStatus
}

/**
 * Normalize a ProcessInstance to ensure status values match TypeScript type definitions.
 * Agents may write hyphenated statuses ("in-progress") but types use underscores ("in_progress").
 */
export function normalizeProcessInstance(process: ProcessInstance): ProcessInstance {
  return {
    ...process,
    status: process.status.replace(/-/g, '_') as ProcessStatus,
    steps: process.steps.map(step => ({
      ...step,
      status: normalizeStepStatus(step.status)
    }))
  }
}

// Parse the folder status from the path
function getFolderStatus(path: string): 'active' | 'completed' | 'failed' {
  if (path.includes('/active/') || path.includes('\\active\\')) return 'active'
  if (path.includes('/completed/') || path.includes('\\completed\\')) return 'completed'
  if (path.includes('/failed/') || path.includes('\\failed\\')) return 'failed'
  return 'active' // default
}

// Helper function to find step number from step ID
export function findStepNumber(process: ProcessInstance, stepId: StepId): number {
  const step = process.steps.find(s => s.id === stepId)
  return step?.number ?? 0
}

// Helper function to check if a step is active
export function isActiveStep(step: ProcessStep, process: ProcessInstance): boolean {
  return step.id === process.currentState.activeStepId
}

// Helper function to find step by ID
export function findStepById(process: ProcessInstance, stepId: StepId): ProcessStep | undefined {
  return process.steps.find(s => s.id === stepId)
}

// Convert a ProcessInstance to a ProcessSummary for the dashboard
export function toProcessSummary(process: ProcessInstance, path: string): ProcessSummary {
  const completedSteps = process.steps.filter(s => s.status === 'completed').length
  const totalSteps = process.steps.length
  
  // Handle both new format (activeStepId) and old format (activeStepNumber)
  const currentState = process.currentState as any // Allow access to both old and new fields
  let currentStepNumber: number
  
  if (currentState.activeStepId) {
    // New format: find step number from activeStepId
    currentStepNumber = findStepNumber(process, currentState.activeStepId)
  } else if (typeof currentState.activeStepNumber === 'number') {
    // Old format: use activeStepNumber directly
    currentStepNumber = currentState.activeStepNumber
  } else {
    // Fallback: use completed steps count
    currentStepNumber = completedSteps
  }
  
  // Handle both new format (actionSummary) and old format (currentAction)
  const currentAction = currentState.actionSummary || currentState.currentAction || 'Unknown action'
  
  return {
    id: process.id,
    name: process.name,
    status: process.status,
    template: process.metadata.template,
    currentStep: currentStepNumber,
    totalSteps,
    currentAction,
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
    case 'awaiting_approval':
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
    case 'awaiting_approval':
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
