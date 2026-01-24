// Types based on the agentic-processes framework

export type ProcessStatus = 'running' | 'completed' | 'failed' | 'paused'

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

export interface ProcessMetadata {
  template: string
  templateCategory: string
  created: string
  lastUpdated: string
  projectPath: string
  processPath: string
}

export interface ProcessCurrentState {
  activeStepNumber: number
  activeStepName: string
  currentAction: string
  details?: string
}

export interface ProcessStep {
  number: number
  name: string
  status: StepStatus
  stepRef?: string
  output?: string
  startedAt?: string
  completedAt?: string
  approvalRequired?: boolean
  approved?: boolean
}

export interface ProcessFiles {
  process: string
  memory: string
  log: string
}

export interface ChildProcessRef {
  id: string
  name: string
  template: string
  status: ProcessStatus
  spawnedAtStep: number
  syncPoint: 'immediate' | string
  processPath: string
}

export interface ParentProcessRef {
  id: string
  name: string
  processPath: string
  returnToStep: number
}

export interface SubProcessState {
  parentProcess: ParentProcessRef | null
  childProcesses: ChildProcessRef[]
  nextSyncPoint?: string
}

export interface ProcessInstance {
  type: 'process-instance'
  id: string
  name: string
  metadata: ProcessMetadata
  status: ProcessStatus
  parameters: Record<string, string>
  currentState: ProcessCurrentState
  steps: ProcessStep[]
  subProcessState?: SubProcessState
  files: ProcessFiles
}

// UI-specific types
export interface ProcessSummary {
  id: string
  name: string
  status: ProcessStatus
  template: string
  currentStep: number
  totalSteps: number
  currentAction: string
  lastUpdated: string
  folderStatus: 'active' | 'completed' | 'failed'
  path: string
}

export interface DiagramNode {
  id: string
  type: 'step'
  data: {
    step: ProcessStep
    isActive: boolean
    processStatus: ProcessStatus
  }
  position: { x: number; y: number }
}

export interface DiagramEdge {
  id: string
  source: string
  target: string
  animated?: boolean
}

// Lazy Prompts types
export type LazyPromptType = 'continue-process'

export interface LazyPromptAction {
  type: 'clipboard' | 'agent-apply'
  label: string
}

export interface LazyPromptConfig {
  type: LazyPromptType
  label: string
  description: string
  availableActions: LazyPromptAction[]
}

// Settings types
export interface LazyPromptsSettings {
  enabled: boolean
  defaultAction: 'clipboard' | 'agent-apply'
}

export interface AppSettings {
  lazyPrompts: LazyPromptsSettings
}

// Memory file types (memory.json)
export interface MemoryStepInfo {
  name: string
  status: string
  informationProduced?: Record<string, unknown>
  decisionsMade?: (string | { decision: string; rationale?: string })[]
  filesModifiedCreated?: string[]
  notes?: string | string[]
  updated?: string
}

export interface ChildSubProcess {
  name: string
  template: string
  status: string
  spawnedAt: string
  syncPoint: string
}

export interface MemorySubProcessState {
  parent: unknown | null
  spawnedAtStep: unknown | null
  childSubProcesses: ChildSubProcess[]
  nextSyncPoint?: number
  pendingSubProcesses?: string[]
}

export interface MemoryCrossReferences {
  keyDecisions: string[]
  filesModified: string[]
}

export interface ProcessMemory {
  processName: string
  metadata: {
    processId: string
    created: string
    lastUpdated: string
    currentStep: number
  }
  parameters: Record<string, string>
  subProcessState?: MemorySubProcessState
  steps: Record<string, MemoryStepInfo>
  crossReferences: MemoryCrossReferences
}

// Log file types (log.json)
export interface UserInteraction {
  request: string
  reason: string
  response: string
  timestamp: string
}

export interface LogStepInfo {
  name: string
  timestamp: {
    started: string
    completed: string | null
  }
  actionsTaken: string[]
  agentReasoning: string[]
  userInteractions: UserInteraction[]
  problemsEncountered: string[]
  filesModified: string[]
  decisionsMade: string[]
  performanceNotes: string[]
}

export interface ProcessWideObservations {
  patternsDetected: string[]
  userFeedbackSummary: string[]
  efficiencyMetrics: {
    stepsCompleted: number
    totalUserCorrections: number
    filesModified: number
    stepsRequiringMultipleIterations: number
  }
  recommendationsForFuture: string[]
}

export interface ProcessLog {
  processName: string
  metadata: {
    processId: string
    template: string
    started: string
    completed: string | null
    parentProcess: unknown | null
    subProcesses: unknown[]
  }
  steps: Record<string, LogStepInfo>
  processWideObservations: ProcessWideObservations
}

