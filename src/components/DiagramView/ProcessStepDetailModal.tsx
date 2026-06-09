import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { ProcessStep, ProcessMemory, ProcessLog, MemoryTopicEntry, LogStepEntry } from '../../types'
import { getStatusColor, formatTimestamp } from '../../services/processService'
import { parseStepDefinition, toDisplayText } from '../Templates/TemplateDetail'
import { OutputSection, SubstepsSection, FlowSection, GuidanceSection, MemoryFileUsageSection, ModalSection } from '../Templates/StepModalSections'

interface ProcessStepDetailModalProps {
  steps: ProcessStep[]
  currentIndex: number
  onNavigate: (index: number) => void
  onClose: () => void
  memory: ProcessMemory | null
  log: ProcessLog | null
}

type Tab = 'definition' | 'execution'

export function ProcessStepDetailModal({ steps, currentIndex, onNavigate, onClose, memory, log }: ProcessStepDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const step = steps[currentIndex]
  const parsed = parseStepDefinition(step.stepDefinition)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < steps.length - 1

  // Aggregate memory contributions from all topic files for this step
  const memoryEntries: { topic: string; entry: MemoryTopicEntry }[] = []
  if (memory?.topics) {
    for (const [topicName, topicFile] of Object.entries(memory.topics)) {
      const tf = topicFile as any
      if (tf?.entries?.[step.id]) {
        memoryEntries.push({ topic: topicName, entry: tf.entries[step.id] as MemoryTopicEntry })
      }
    }
  }
  const memoryEntry = memoryEntries.length > 0 ? memoryEntries[0].entry : undefined
  const logEntry = log?.steps?.[step.id] as LogStepEntry | undefined

  const hasDefinitionContent = parsed.output?.description || (parsed.substeps && parsed.substeps.length > 0) ||
    parsed.flow?.description || parsed.guidance
  const hasExecutionContent = memoryEntry || logEntry

  const [activeTab, setActiveTab] = useState<Tab>(hasDefinitionContent ? 'definition' : 'execution')

  useEffect(() => {
    setActiveTab(hasDefinitionContent ? 'definition' : 'execution')
  }, [currentIndex])

  const handlePrev = useCallback(() => {
    if (hasPrev) onNavigate(currentIndex - 1)
  }, [hasPrev, currentIndex, onNavigate])

  const handleNext = useCallback(() => {
    if (hasNext) onNavigate(currentIndex + 1)
  }, [hasNext, currentIndex, onNavigate])

  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, handlePrev, handleNext])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-[95vw] h-[92vh] bg-background border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col outline-none animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-elevated flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-accent/20 text-accent text-sm font-semibold flex-shrink-0">
              {step.number}
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-text-primary truncate">{step.name}</h2>
              {step.stepRef && (
                <p className="text-xs font-mono text-text-muted truncate">{step.stepRef}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${getStatusBadgeStyle(step.status)}`}>
                {step.status.replace(/_/g, ' ')}
              </span>
              {step.approvalRequired && (
                <span className="px-1.5 py-0.5 text-[10px] rounded bg-status-paused/20 text-status-paused font-medium">
                  {step.approved ? 'Approved' : 'Approval Required'}
                </span>
              )}
            </div>
            {(step.startedAt || step.completedAt) && (
              <div className="flex items-center gap-3 text-[10px] text-text-muted flex-shrink-0 ml-2">
                {step.startedAt && <span>Started: {formatTimestamp(step.startedAt)}</span>}
                {step.completedAt && <span>Completed: {formatTimestamp(step.completedAt)}</span>}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className="p-1.5 rounded-md hover:bg-surface transition-colors disabled:opacity-30 disabled:cursor-default"
              >
                <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-xs text-text-muted whitespace-nowrap">
                Step {currentIndex + 1} of {steps.length}
              </span>
              <button
                onClick={handleNext}
                disabled={!hasNext}
                className="p-1.5 rounded-md hover:bg-surface transition-colors disabled:opacity-30 disabled:cursor-default"
              >
                <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-surface transition-colors"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 px-6 pt-3 bg-surface-elevated border-b border-border">
          <div className="flex gap-1">
            <TabButton active={activeTab === 'definition'} onClick={() => setActiveTab('definition')} disabled={!hasDefinitionContent}>
              Definition
            </TabButton>
            <TabButton active={activeTab === 'execution'} onClick={() => setActiveTab('execution')} disabled={!hasExecutionContent}>
              Execution
            </TabButton>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'definition' ? (
            <DefinitionTab parsed={parsed} />
          ) : (
            <ExecutionTab memoryEntry={memoryEntry} logEntry={logEntry} step={step} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 bg-surface-elevated border-t border-border flex items-center gap-4 text-xs text-text-muted flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-mono">Esc</kbd>
            <span>close</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-mono">&larr;</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-mono">&rarr;</kbd>
            <span>navigate steps</span>
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}

function TabButton({ active, onClick, disabled, children }: { active: boolean; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 text-xs font-medium rounded-t-md transition-colors border-b-2 -mb-px ${
        active
          ? 'border-accent text-accent bg-background'
          : disabled
            ? 'border-transparent text-text-muted/40 cursor-default'
            : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border'
      }`}
    >
      {children}
    </button>
  )
}

function DefinitionTab({ parsed }: { parsed: ReturnType<typeof parseStepDefinition> }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      <div className="lg:col-span-2 space-y-6">
        <OutputSection output={parsed.output} />
        <SubstepsSection substeps={parsed.substeps} />
        <FlowSection flow={parsed.flow} />
      </div>
      <div className="space-y-6">
        <GuidanceSection guidance={parsed.guidance} />
        <MemoryFileUsageSection memoryFileUsage={parsed.memoryFileUsage} />
      </div>
    </div>
  )
}

function ExecutionTab({ memoryEntry, logEntry, step }: { memoryEntry?: MemoryStepEntry; logEntry?: LogStepEntry; step: ProcessStep }) {
  if (!memoryEntry && !logEntry) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="w-12 h-12 text-text-muted mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-text-muted">No execution data available yet</p>
        <p className="text-xs text-text-muted mt-1">Data will appear once this step has been executed</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {/* Main column: actions, reasoning, interactions */}
      <div className="lg:col-span-2 space-y-6">
        <ActionsTakenSection actions={logEntry?.actionsTaken} />
        <AgentReasoningSection reasoning={logEntry?.agentReasoning} />
        <UserInteractionsSection interactions={logEntry?.userInteractions} />
        <ProblemsSection problems={logEntry?.problemsEncountered} />
      </div>

      {/* Sidebar: info produced, decisions, files */}
      <div className="space-y-6">
        {memoryEntry?.informationProduced && Object.keys(memoryEntry.informationProduced).length > 0 && (
          <ModalSection
            title="Information Produced"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            <div className="space-y-2">
              {Object.entries(memoryEntry.informationProduced).map(([key, value]) => (
                <div key={key}>
                  <span className="text-xs font-medium text-text-muted">{key}</span>
                  <p className="text-sm text-text-secondary mt-0.5">{toDisplayText(value)}</p>
                </div>
              ))}
            </div>
          </ModalSection>
        )}

        <DecisionsSection
          memoryDecisions={memoryEntry?.decisionsMade}
          logDecisions={logEntry?.decisionsMade}
        />

        <FilesSection
          memoryFiles={memoryEntry?.filesModifiedCreated}
          logFiles={logEntry?.filesModified}
        />

        {memoryEntry?.notes && (
          <ModalSection
            title="Notes"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          >
            <p className="text-sm text-text-secondary">{memoryEntry.notes}</p>
          </ModalSection>
        )}
      </div>
    </div>
  )
}

function ActionsTakenSection({ actions }: { actions?: string[] }) {
  if (!actions || actions.length === 0) return null
  return (
    <ModalSection
      title={`Actions Taken (${actions.length})`}
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      }
    >
      <ul className="space-y-1.5">
        {actions.map((a, i) => (
          <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
            <span className="text-accent mt-0.5 flex-shrink-0">{i + 1}.</span>
            <span>{a}</span>
          </li>
        ))}
      </ul>
    </ModalSection>
  )
}

function AgentReasoningSection({ reasoning }: { reasoning?: string[] }) {
  if (!reasoning || reasoning.length === 0) return null
  return (
    <ModalSection
      title="Agent Reasoning"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      }
    >
      <ul className="space-y-2">
        {reasoning.map((r, i) => (
          <li key={i} className="text-sm text-text-muted flex items-start gap-2">
            <span className="text-accent/60 mt-0.5 flex-shrink-0">&bull;</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </ModalSection>
  )
}

function UserInteractionsSection({ interactions }: { interactions?: Array<{ request: string; reason: string; agentResponse: string; timestamp: string }> }) {
  if (!interactions || interactions.length === 0) return null
  return (
    <ModalSection
      title={`User Interactions (${interactions.length})`}
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      }
    >
      <div className="space-y-4">
        {interactions.map((interaction, i) => (
          <div key={i} className="p-3 bg-surface-elevated rounded-lg space-y-2">
            <div>
              <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Request</span>
              <p className="text-sm text-text-primary mt-0.5">{interaction.request}</p>
            </div>
            {interaction.reason && (
              <div>
                <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Reason</span>
                <p className="text-sm text-text-muted mt-0.5">{interaction.reason}</p>
              </div>
            )}
            <div>
              <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Response</span>
              <p className="text-sm text-text-secondary mt-0.5">{interaction.agentResponse}</p>
            </div>
            {interaction.timestamp && (
              <p className="text-[10px] text-text-muted">{formatTimestamp(interaction.timestamp)}</p>
            )}
          </div>
        ))}
      </div>
    </ModalSection>
  )
}

function ProblemsSection({ problems }: { problems?: string[] }) {
  if (!problems || problems.length === 0) return null
  return (
    <ModalSection
      title={`Problems Encountered (${problems.length})`}
      icon={
        <svg className="w-4 h-4 text-status-failed" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      }
    >
      <ul className="space-y-1.5">
        {problems.map((p, i) => (
          <li key={i} className="text-sm text-status-failed/80 flex items-start gap-2">
            <span className="mt-0.5 flex-shrink-0">&bull;</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </ModalSection>
  )
}

function DecisionsSection({ memoryDecisions, logDecisions }: { memoryDecisions?: string[]; logDecisions?: string[] }) {
  const decisions = memoryDecisions?.length ? memoryDecisions : logDecisions
  if (!decisions || decisions.length === 0) return null
  return (
    <ModalSection
      title="Decisions Made"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      }
    >
      <ul className="space-y-1.5">
        {decisions.map((d, i) => (
          <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
            <span className="text-accent mt-0.5 flex-shrink-0">&check;</span>
            <span>{typeof d === 'string' ? d : toDisplayText(d)}</span>
          </li>
        ))}
      </ul>
    </ModalSection>
  )
}

function FilesSection({ memoryFiles, logFiles }: { memoryFiles?: string[]; logFiles?: string[] }) {
  const files = memoryFiles?.length ? memoryFiles : logFiles
  if (!files || files.length === 0) return null
  return (
    <ModalSection
      title="Files Modified"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      }
    >
      <div className="flex flex-wrap gap-1.5">
        {files.map((f, i) => (
          <span key={i} className="px-2 py-0.5 text-xs rounded bg-surface-elevated font-mono text-text-secondary border border-border">
            {typeof f === 'string' ? f : toDisplayText(f)}
          </span>
        ))}
      </div>
    </ModalSection>
  )
}

function getStatusBadgeStyle(status: string): string {
  switch (status) {
    case 'completed': return 'bg-status-completed/20 text-status-completed'
    case 'in_progress': return 'bg-status-active/20 text-status-active'
    case 'awaiting_approval': return 'bg-status-paused/20 text-status-paused'
    case 'skipped': return 'bg-surface-elevated text-text-muted'
    case 'pending': return 'bg-surface-elevated text-text-muted'
    default: return 'bg-surface-elevated text-text-muted'
  }
}
