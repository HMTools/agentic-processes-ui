// Types based on the agentic-processes framework

// ============================================================================
// Shared utility types (matching framework)
// ============================================================================

/** UUID identifier for a process instance */
export type ProcessId = string

/** UUID identifier for a step within a process */
export type StepId = string

/** ISO 8601 timestamp string */
export type ISOTimestamp = string

/** Relative path to a process directory from the project root */
export type ProcessPath = string

/** Reference to a step definition */
export type StepRef = string

/** Sync point for child process coordination (references a StepId) */
export type SyncPoint = StepId

// ============================================================================
// Status types
// ============================================================================

export type ProcessStatus = 'running' | 'completed' | 'failed' | 'paused'

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'awaiting_approval'

// ============================================================================
// Process instance types
// ============================================================================

export interface ProcessMetadata {
  template: string
  templateCategory?: string
  created: ISOTimestamp
  lastUpdated: ISOTimestamp
  projectPath?: string
  processPath?: ProcessPath
}

export interface ProcessCurrentState {
  activeStepId: StepId
  activeStepName: string
  actionSummary: string
  actionDetails?: string
}

export interface ProcessStep {
  id: StepId
  number: number
  name: string
  status: StepStatus
  stepRef: StepRef
  startedAt?: ISOTimestamp
  completedAt?: ISOTimestamp
  approvalRequired?: boolean
  approved?: boolean
}

export interface ChildProcessRef {
  id: ProcessId
  name: string
  status: ProcessStatus
  spawnedAtStep: StepId
  syncPoint: SyncPoint
  processPath: ProcessPath
}

export interface ParentProcessRef {
  id: ProcessId
  name: string
  processPath: ProcessPath
  returnToStep: StepId
}

export interface SubProcessState {
  parentProcess: ParentProcessRef | null
  childProcesses: ChildProcessRef[]
  nextSyncPoint?: StepId
}

export interface ProcessInstance {
  type: 'process-instance'
  id: ProcessId
  name: string
  metadata: ProcessMetadata
  status: ProcessStatus
  parameters: Record<string, string>
  currentState: ProcessCurrentState
  steps: ProcessStep[]
  subProcessState?: SubProcessState
}

// ============================================================================
// Process files types (for Files tab)
// ============================================================================

export type ProcessFileType = 'markdown' | 'json'

export interface ProcessFile {
  name: string
  path: string
  type: ProcessFileType
  size: number
  modifiedAt: string
}

export interface FileContentUpdateEvent {
  filePath: string
  content: string | null
  removed?: boolean
}

// ============================================================================
// UI-specific types
// ============================================================================

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

// ============================================================================
// Lazy Prompts types
// ============================================================================

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

// ============================================================================
// Settings types
// ============================================================================

export interface LazyPromptsSettings {
  enabled: boolean
  defaultAction: 'clipboard' | 'agent-apply'
}

export interface AppSettings {
  lazyPrompts: LazyPromptsSettings
}

// ============================================================================
// Memory file types (memory.json)
// ============================================================================

export interface MemoryStepEntry {
  name: string
  status?: StepStatus
  startedAt?: ISOTimestamp
  updatedAt?: ISOTimestamp
  informationProduced: Record<string, unknown>
  decisionsMade: string[]
  filesModifiedCreated: string[]
  notes?: string
}

export interface MemoryFile {
  type: 'memory-file'
  metadata: {
    process: string
    template: string
    created: ISOTimestamp
    lastUpdated: ISOTimestamp
    currentStep: StepId
  }
  subProcessState: {
    parentProcessPath: ProcessPath | null
    childSubProcesses: ChildProcessRef[]
    syncPoints: StepId[]
  }
  steps: Record<StepId, MemoryStepEntry>
  crossReferences: {
    keyDecisions: string[]
    filesModified?: string[]
    filesCreated?: string[]
    schemaFiles?: string[]
    targetFiles?: string[]
    custom?: Record<string, unknown>
  }
  searchHelpers: {
    byCategory: Record<string, string[]>
    byFileType?: Record<string, string[]>
  }
}

/** Alias for backward compatibility */
export type ProcessMemory = MemoryFile

// ============================================================================
// Log file types (log.json)
// ============================================================================

export interface StepTimestamp {
  startedAt: ISOTimestamp
  updatedAt?: ISOTimestamp
  completedAt?: ISOTimestamp
}

export interface UserInteraction {
  request: string
  reason: string
  agentResponse: string
  timestamp: ISOTimestamp
  forImprovementStep?: boolean
  potentialImprovement?: string
}

export interface LogStepEntry {
  timestamp: ISOTimestamp | StepTimestamp
  userInteractions?: UserInteraction[]
  actionsTaken?: string[]
  agentReasoning?: string[]
  problemsEncountered?: string[]
  filesModified?: string[]
  decisionsMade?: string[]
  performanceNotes?: string[]
}

export interface LogFile {
  type: 'log-file'
  metadata: {
    process: string
    template: string
    started: ISOTimestamp
    completed: ISOTimestamp | null
    parentProcessPath: ProcessPath | null
    subProcessPaths: ProcessPath[]
  }
  executionMetrics?: {
    totalSteps: number
    stepsCompleted: number
    currentStep: StepId
  }
  steps: Record<StepId, LogStepEntry>
  userInteractions?: UserInteraction[]
  processWideObservations: {
    patternsDetected: string[]
    userFeedbackSummary: string[]
    efficiencyMetrics: Record<string, unknown>
    recommendationsForFuture: string[]
  }
}

/** Alias for backward compatibility */
export type ProcessLog = LogFile

// ============================================================================
// Template types (for Templates management screen)
// ============================================================================

export type TemplateCategory = 
  | 'development'
  | 'testing'
  | 'review'
  | 'infrastructure'
  | 'documentation'
  | 'learning'

export type StepCategory =
  | 'common'
  | 'api'
  | 'service'
  | 'data'
  | 'testing'
  | 'planning'
  | 'investigation'
  | 'documentation'
  | 'guideline'
  | 'template'
  | 'learning'
  | 'external-services'

export interface TemplateMetadata {
  title: string
  purposeAndUsage: string
  lastUpdated: string
}

export interface ParameterDefinition {
  description: string
  type: string
  example?: string
  enum?: string[]
  default?: string
}

export interface TemplateParameters {
  required: string[]
  optional: string[]
  defaults?: Record<string, string>
  definitions: Record<string, ParameterDefinition>
}

export interface TemplateStep {
  number: number
  name: string
  stepRef: string
  output: string
  conditional?: string
  approvalRequired?: boolean
  context?: Record<string, unknown>
  subProcessTrigger?: {
    condition?: string
    template: string
    forEach?: string
    syncPoint?: string
  }
}

export interface TemplatePhase {
  name: string
  steps: number[] | string[] | 'dynamic'
}

export interface TemplateReferences {
  steps: string[]
  relatedTemplates: string[]
  dependencies: string[]
}

export interface ProcessTemplate {
  type: 'template'
  name: string
  category: string
  metadata: TemplateMetadata
  parameters: TemplateParameters
  phases?: TemplatePhase[]
  steps: TemplateStep[]
  dynamicSteps?: Record<string, string>
  references: TemplateReferences
  // UI-specific fields
  filePath?: string
  markdownPath?: string
  markdownContent?: string
}

export interface StepOutput {
  description: string
  artifacts?: string[]
  memoryUpdates?: string[]
}

export interface StepGuidance {
  prerequisites?: string[]
  mandatoryComponents?: string[]
  userGuidelines?: string[]
  specificActions?: string[]
  files?: {
    read?: string[]
    create?: string[]
    update?: string[]
  }
  tools?: string[]
  bestPractices?: string[]
}

export interface StepSubstep {
  number: number
  name: string
  description: string
  conditional?: boolean
  actions: string[]
}

export interface StepMemoryFileUsage {
  readFrom?: string | null
  writeTo?: string
  fields?: string[]
}

export interface StepReferences {
  relatedSteps?: string[]
  usedInTemplates?: string[]
  sharedComponent?: string
}

export interface StepTemplate {
  type: 'step'
  name: string
  category: string
  metadata: TemplateMetadata
  parameters?: TemplateParameters
  principlesRef?: string
  principlesPath?: string
  output: StepOutput
  guidance: StepGuidance
  substeps: StepSubstep[]
  flow?: {
    description: string
  }
  memoryFileUsage?: StepMemoryFileUsage
  approvalRequired?: boolean
  complexityScale?: Record<string, { range: string; description: string }>
  dependencies?: {
    requiredComponents?: string[]
    requiredFiles?: string[]
    requiredTools?: string[]
  }
  notes?: Record<string, string>
  references?: StepReferences
  // UI-specific fields
  filePath?: string
  markdownPath?: string
  markdownContent?: string
}

export interface TemplateSummary {
  name: string
  category: string
  title: string
  purpose: string
  stepCount: number
  filePath: string
  lastUpdated: string
}

export interface StepSummary {
  name: string
  category: string
  title: string
  purpose: string
  substepCount: number
  approvalRequired: boolean
  filePath: string
  lastUpdated: string
}
