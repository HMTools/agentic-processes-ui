import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import type { ProcessInstance, ProcessMemory, MemoryTopicFile, MemoryTopicEntry } from '../../types'
import { extractMemoryFlow } from '../../services/processService'
import { MemoryFlowTable } from '../Templates/MemoryFlowTable'

interface MemoryExplorerModalProps {
  isOpen: boolean
  onClose: () => void
  process: ProcessInstance
  memory: ProcessMemory | null
}

type ExplorerTab = 'flow' | 'topics' | 'history' | 'diffs'

// ============================================================================
// Status helpers
// ============================================================================

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-500',
  in_progress: 'bg-blue-500',
  pending: 'bg-gray-500',
  skipped: 'bg-yellow-500',
  awaiting_approval: 'bg-amber-500',
}

function StepStatusDot({ status }: { status?: string }) {
  const color = statusColors[status || ''] || 'bg-gray-500'
  return <span className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} title={status} />
}

// ============================================================================
// Flow Tab
// ============================================================================

function FlowTab({ process, memory }: { process: ProcessInstance; memory: ProcessMemory | null }) {
  const flow = useMemo(() => extractMemoryFlow(process), [process])

  // Set of topics that currently have data
  const topicsWithData = useMemo(() => {
    if (!memory?.topics) return new Set<string>()
    const s = new Set<string>()
    for (const [name, topicFile] of Object.entries(memory.topics)) {
      const tf = topicFile as MemoryTopicFile
      if (tf.entries && Object.keys(tf.entries).length > 0) {
        s.add(name)
      }
    }
    return s
  }, [memory])

  return (
    <div>
      <MemoryFlowTable
        flow={flow}
        renderStepStatus={(step) => <StepStatusDot status={step.stepStatus} />}
        renderTopicExtra={(topic) =>
          topicsWithData.has(topic) ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Has data" />
          ) : null
        }
      />
      {/* Status legend */}
      <div className="flex items-center gap-4 mt-4 px-2 text-[10px] text-text-muted border-t border-border/50 pt-3">
        <span className="font-medium uppercase tracking-wider">Step Status:</span>
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${color}`} />
            <span>{status.replace(/_/g, ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Topics Tab
// ============================================================================

function TopicsTab({ memory }: { memory: ProcessMemory | null }) {
  const topics = memory?.topics || {}
  const topicEntries = Object.entries(topics).sort((a, b) => a[0].localeCompare(b[0]))

  if (topicEntries.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-text-muted">
        No memory topics available yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {topicEntries.map(([topicName, topicFile]) => {
        const tf = topicFile as MemoryTopicFile
        const entries = Object.entries(tf.entries || {})

        // Find last-modified-by-step
        const lastModEntry = entries.reduce<[string, MemoryTopicEntry] | null>((latest, [sid, e]) => {
          const entry = e as MemoryTopicEntry
          if (!latest) return [sid, entry]
          return (entry.updatedAt || '') > (latest[1].updatedAt || '') ? [sid, entry] : latest
        }, null)

        return (
          <div key={topicName} className="bg-surface rounded-lg border border-border overflow-hidden">
            <div className="px-4 py-3 bg-surface-elevated border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-accent">{topicName}.json</span>
                <span className="text-xs text-text-muted">({entries.length} {entries.length === 1 ? 'entry' : 'entries'})</span>
              </div>
              <div className="flex items-center gap-3">
                {lastModEntry && (
                  <span className="text-xs text-accent" title={`Last modified by: ${lastModEntry[1].stepName}`}>
                    {lastModEntry[1].stepName}
                  </span>
                )}
                {tf.lastUpdated && (
                  <span className="text-xs text-text-muted">{new Date(tf.lastUpdated).toLocaleString()}</span>
                )}
              </div>
            </div>
            <div className="p-4 space-y-4">
              {entries.map(([stepId, rawEntry]) => {
                const entry = rawEntry as MemoryTopicEntry
                return (
                  <div key={stepId} className="border border-border/50 rounded-lg p-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-primary font-medium">{entry.stepName}</span>
                      <span className="text-xs text-text-muted font-mono">{stepId.slice(0, 8)}...</span>
                      {entry.updatedAt && (
                        <span className="text-xs text-text-muted ml-auto">{new Date(entry.updatedAt).toLocaleString()}</span>
                      )}
                    </div>

                    {entry.decisionsMade && entry.decisionsMade.length > 0 && (
                      <div>
                        <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Decisions</label>
                        <ul className="space-y-0.5">
                          {entry.decisionsMade.map((d, i) => (
                            <li key={i} className="flex gap-2 text-xs">
                              <span className="text-accent shrink-0">-</span>
                              <span className="text-text-secondary">{typeof d === 'string' ? d : JSON.stringify(d)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {entry.filesModifiedCreated && entry.filesModifiedCreated.length > 0 && (
                      <div>
                        <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Files</label>
                        <ul className="space-y-0.5">
                          {entry.filesModifiedCreated.map((f, i) => (
                            <li key={i} className="text-xs font-mono text-accent break-all">{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {entry.informationProduced && Object.keys(entry.informationProduced).length > 0 && (
                      <div>
                        <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Information</label>
                        <div className="text-xs text-text-muted bg-background rounded p-3 font-mono overflow-x-auto">
                          <pre className="whitespace-pre-wrap break-all">
                            {JSON.stringify(entry.informationProduced, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ============================================================================
// History Tab
// ============================================================================

interface HistoryItem {
  topic: string
  stepId: string
  stepName: string
  entry: MemoryTopicEntry
  updatedAt: string
}

function HistoryTimelineItem({ item }: { item: HistoryItem }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="relative pl-6 border-l-2 border-border/50 ml-2">
      {/* Timeline dot */}
      <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-accent" />

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left bg-surface rounded-lg border border-border p-3 hover:bg-surface-elevated transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-text-primary">{item.stepName}</span>
          <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-accent/20 text-accent">{item.topic}</span>
          {item.updatedAt && (
            <span className="text-xs text-text-muted ml-auto">{new Date(item.updatedAt).toLocaleString()}</span>
          )}
        </div>
      </button>

      {expanded && (
        <div className="mt-2 ml-2 p-3 bg-surface rounded border border-border/50 space-y-2">
          {item.entry.informationProduced && Object.keys(item.entry.informationProduced).length > 0 && (
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Information</label>
              <pre className="text-xs text-text-muted bg-background rounded p-2 font-mono whitespace-pre-wrap break-all overflow-x-auto">
                {JSON.stringify(item.entry.informationProduced, null, 2)}
              </pre>
            </div>
          )}
          {item.entry.decisionsMade && item.entry.decisionsMade.length > 0 && (
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Decisions</label>
              <ul className="space-y-0.5">
                {item.entry.decisionsMade.map((d, i) => (
                  <li key={i} className="flex gap-2 text-xs">
                    <span className="text-accent shrink-0">-</span>
                    <span className="text-text-secondary">{typeof d === 'string' ? d : JSON.stringify(d)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {item.entry.filesModifiedCreated && item.entry.filesModifiedCreated.length > 0 && (
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Files</label>
              <ul className="space-y-0.5">
                {item.entry.filesModifiedCreated.map((f, i) => (
                  <li key={i} className="text-xs font-mono text-accent break-all">{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function HistoryTab({ memory }: { memory: ProcessMemory | null }) {
  const [topicFilter, setTopicFilter] = useState<string>('all')

  const { items, topicNames } = useMemo(() => {
    const topics = memory?.topics || {}
    const allItems: HistoryItem[] = []
    const names = new Set<string>()

    for (const [topicName, topicFile] of Object.entries(topics)) {
      names.add(topicName)
      const tf = topicFile as MemoryTopicFile
      for (const [stepId, rawEntry] of Object.entries(tf.entries || {})) {
        const entry = rawEntry as MemoryTopicEntry
        allItems.push({
          topic: topicName,
          stepId,
          stepName: entry.stepName,
          entry,
          updatedAt: entry.updatedAt || '',
        })
      }
    }

    // Sort by updatedAt descending, fallback to step order
    allItems.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

    return { items: allItems, topicNames: Array.from(names).sort() }
  }, [memory])

  const filtered = topicFilter === 'all' ? items : items.filter(i => i.topic === topicFilter)

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-text-muted">
        No memory history available yet.
      </div>
    )
  }

  return (
    <div>
      {/* Topic filter */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-xs text-text-muted">Filter by topic:</label>
        <select
          value={topicFilter}
          onChange={e => setTopicFilter(e.target.value)}
          className="text-xs bg-surface border border-border rounded px-2 py-1 text-text-primary"
        >
          <option value="all">All topics</option>
          {topicNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {filtered.map((item, index) => (
          <HistoryTimelineItem key={`${item.stepId}-${item.topic}-${index}`} item={item} />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Diffs Tab
// ============================================================================

function DiffsTab({ memory }: { memory: ProcessMemory | null }) {
  const topics = memory?.topics || {}
  const topicNames = useMemo(() => Object.keys(topics).sort(), [topics])

  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [stepA, setStepA] = useState<string>('')
  const [stepB, setStepB] = useState<string>('')

  // Get available step entries for selected topic
  const stepEntries = useMemo(() => {
    if (!selectedTopic || !topics[selectedTopic]) return []
    const tf = topics[selectedTopic] as MemoryTopicFile
    return Object.entries(tf.entries || {}).map(([stepId, rawEntry]) => {
      const entry = rawEntry as MemoryTopicEntry
      return { stepId, stepName: entry.stepName, entry }
    })
  }, [selectedTopic, topics])

  // Reset step selections when topic changes
  useEffect(() => {
    setStepA('')
    setStepB('')
  }, [selectedTopic])

  const entryA = useMemo(() => stepEntries.find(e => e.stepId === stepA), [stepEntries, stepA])
  const entryB = useMemo(() => stepEntries.find(e => e.stepId === stepB), [stepEntries, stepB])

  // Compute diff between informationProduced objects
  const diff = useMemo(() => {
    if (!entryA || !entryB) return null
    const infoA = entryA.entry.informationProduced || {}
    const infoB = entryB.entry.informationProduced || {}
    const allKeys = new Set([...Object.keys(infoA), ...Object.keys(infoB)])

    const results: { key: string; status: 'added' | 'removed' | 'changed' | 'same'; valueA?: string; valueB?: string }[] = []

    for (const key of Array.from(allKeys).sort()) {
      const hasA = key in infoA
      const hasB = key in infoB
      const valA = hasA ? JSON.stringify(infoA[key], null, 2) : undefined
      const valB = hasB ? JSON.stringify(infoB[key], null, 2) : undefined

      if (!hasA && hasB) {
        results.push({ key, status: 'added', valueB: valB })
      } else if (hasA && !hasB) {
        results.push({ key, status: 'removed', valueA: valA })
      } else if (valA === valB) {
        results.push({ key, status: 'same', valueA: valA, valueB: valB })
      } else {
        results.push({ key, status: 'changed', valueA: valA, valueB: valB })
      }
    }

    return results
  }, [entryA, entryB])

  if (topicNames.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-text-muted">
        No memory topics available for comparison.
      </div>
    )
  }

  const statusStyles = {
    added: 'bg-emerald-500/10 border-emerald-500/30',
    removed: 'bg-red-500/10 border-red-500/30',
    changed: 'bg-amber-500/10 border-amber-500/30',
    same: 'bg-surface/50 border-border/30 opacity-60',
  }

  const statusLabels = {
    added: 'Added',
    removed: 'Removed',
    changed: 'Changed',
    same: 'Unchanged',
  }

  const statusLabelColors = {
    added: 'text-emerald-400',
    removed: 'text-red-400',
    changed: 'text-amber-400',
    same: 'text-text-muted',
  }

  return (
    <div>
      {/* Selectors */}
      <div className="flex items-end gap-4 mb-6">
        <div className="flex-1">
          <label className="text-xs text-text-muted block mb-1">Topic</label>
          <select
            value={selectedTopic}
            onChange={e => setSelectedTopic(e.target.value)}
            className="w-full text-xs bg-surface border border-border rounded px-2 py-1.5 text-text-primary"
          >
            <option value="">Select a topic...</option>
            {topicNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs text-text-muted block mb-1">Step A</label>
          <select
            value={stepA}
            onChange={e => setStepA(e.target.value)}
            disabled={!selectedTopic}
            className="w-full text-xs bg-surface border border-border rounded px-2 py-1.5 text-text-primary disabled:opacity-50"
          >
            <option value="">Select step...</option>
            {stepEntries.map(e => (
              <option key={e.stepId} value={e.stepId}>{e.stepName}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs text-text-muted block mb-1">Step B</label>
          <select
            value={stepB}
            onChange={e => setStepB(e.target.value)}
            disabled={!selectedTopic}
            className="w-full text-xs bg-surface border border-border rounded px-2 py-1.5 text-text-primary disabled:opacity-50"
          >
            <option value="">Select step...</option>
            {stepEntries.map(e => (
              <option key={e.stepId} value={e.stepId}>{e.stepName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Prompt or diff results */}
      {!selectedTopic && (
        <div className="text-center py-8 text-sm text-text-muted">
          Select a topic and two steps to compare their memory entries.
        </div>
      )}

      {selectedTopic && stepEntries.length < 2 && (
        <div className="text-center py-8 text-sm text-text-muted">
          Need at least 2 step entries in this topic to compare.
        </div>
      )}

      {diff && (
        <div className="space-y-3">
          {/* Legend */}
          <div className="flex items-center gap-4 text-[10px] text-text-muted mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border bg-emerald-500/10 border-emerald-500/30" />
              <span>Added in B</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border bg-red-500/10 border-red-500/30" />
              <span>Removed (in A only)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border bg-amber-500/10 border-amber-500/30" />
              <span>Changed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border bg-surface/50 border-border/30" />
              <span>Unchanged</span>
            </div>
          </div>

          {diff.map(item => (
            <div key={item.key} className={`rounded-lg border p-3 ${statusStyles[item.status]}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-medium text-text-primary">{item.key}</span>
                <span className={`text-[10px] font-medium ${statusLabelColors[item.status]}`}>
                  {statusLabels[item.status]}
                </span>
              </div>

              {item.status === 'changed' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-text-muted block mb-1">Step A: {entryA?.stepName}</label>
                    <pre className="text-xs text-text-muted bg-background/50 rounded p-2 font-mono whitespace-pre-wrap break-all overflow-x-auto">
                      {item.valueA}
                    </pre>
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted block mb-1">Step B: {entryB?.stepName}</label>
                    <pre className="text-xs text-text-muted bg-background/50 rounded p-2 font-mono whitespace-pre-wrap break-all overflow-x-auto">
                      {item.valueB}
                    </pre>
                  </div>
                </div>
              )}

              {item.status === 'added' && (
                <pre className="text-xs text-text-muted bg-background/50 rounded p-2 font-mono whitespace-pre-wrap break-all overflow-x-auto">
                  {item.valueB}
                </pre>
              )}

              {item.status === 'removed' && (
                <pre className="text-xs text-text-muted bg-background/50 rounded p-2 font-mono whitespace-pre-wrap break-all overflow-x-auto">
                  {item.valueA}
                </pre>
              )}

              {item.status === 'same' && (
                <pre className="text-xs text-text-muted bg-background/50 rounded p-2 font-mono whitespace-pre-wrap break-all overflow-x-auto max-h-20 overflow-y-hidden">
                  {item.valueA}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Main Modal
// ============================================================================

export function MemoryExplorerModal({ isOpen, onClose, process, memory }: MemoryExplorerModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<ExplorerTab>('flow')

  // Keyboard handler
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Focus modal on open
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const tabs: { id: ExplorerTab; label: string }[] = [
    { id: 'flow', label: 'Flow' },
    { id: 'topics', label: 'Topics' },
    { id: 'history', label: 'History' },
    { id: 'diffs', label: 'Diffs' },
  ]

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal container */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative z-10 max-w-6xl w-full max-h-[90vh] mx-4 bg-background rounded-xl border border-border shadow-2xl flex flex-col outline-none"
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Memory Explorer</h2>
            <p className="text-xs text-text-muted mt-0.5">{process.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface transition-colors"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex-shrink-0 px-6 border-b border-border">
          <div className="flex gap-1 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'flow' && <FlowTab process={process} memory={memory} />}
          {activeTab === 'topics' && <TopicsTab memory={memory} />}
          {activeTab === 'history' && <HistoryTab memory={memory} />}
          {activeTab === 'diffs' && <DiffsTab memory={memory} />}
        </div>
      </div>
    </div>,
    document.body
  )
}
