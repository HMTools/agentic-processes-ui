import type { ProcessMemory } from '../../types'

interface MemoryViewProps {
  memory: ProcessMemory | null
  loading?: boolean
}

export function MemoryView({ memory, loading }: MemoryViewProps) {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading memory...</span>
        </div>
      </div>
    )
  }

  if (!memory) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No memory data available</p>
        </div>
      </div>
    )
  }

  const stepEntries = Object.entries(memory.steps).sort((a, b) => {
    const numA = parseInt(a[0].replace(/\D/g, '')) || 0
    const numB = parseInt(b[0].replace(/\D/g, '')) || 0
    return numB - numA
  })

  return (
    <div className="h-full overflow-auto p-4">
      <div className="space-y-6">
        {/* Parameters Section */}
        {Object.keys(memory.parameters).length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Parameters
            </h3>
            <div className="bg-surface rounded-lg border border-border p-3">
              <div className="space-y-2">
                {Object.entries(memory.parameters).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="text-xs font-mono text-accent shrink-0">{key}:</span>
                    <span className="text-xs text-text-secondary break-all">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Cross References - Key Decisions */}
        {memory.crossReferences?.keyDecisions?.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Key Decisions
            </h3>
            <div className="bg-surface rounded-lg border border-border p-3">
              <ul className="space-y-1.5">
                {memory.crossReferences.keyDecisions.map((decision, i) => (
                  <li key={i} className="flex gap-2 text-xs">
                    <span className="text-status-completed shrink-0">•</span>
                    <span className="text-text-secondary">{decision}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Files Modified */}
        {memory.crossReferences?.filesModified?.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Files Modified
            </h3>
            <div className="bg-surface rounded-lg border border-border p-3">
              <ul className="space-y-1">
                {memory.crossReferences.filesModified.map((file, i) => (
                  <li key={i} className="text-xs font-mono text-accent break-all">{file}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Sub-Process State */}
        {memory.subProcessState?.childSubProcesses?.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              Child Sub-Processes
            </h3>
            <div className="space-y-2">
              {memory.subProcessState.childSubProcesses.map((child, i) => (
                <div key={i} className="bg-surface rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-text-primary truncate">{child.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      child.status === 'completed' ? 'bg-status-completed/20 text-status-completed' :
                      child.status === 'pending' ? 'bg-status-pending/20 text-status-pending' :
                      'bg-status-active/20 text-status-active'
                    }`}>
                      {child.status}
                    </span>
                  </div>
                  <div className="text-xs text-text-muted">
                    <span className="text-text-secondary">{child.template}</span>
                    <span className="mx-2">•</span>
                    <span>Spawned at {child.spawnedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Steps Memory */}
        {stepEntries.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Step Details
            </h3>
            <div className="space-y-3">
              {stepEntries.map(([stepKey, step]) => (
                <StepMemoryCard key={stepKey} stepKey={stepKey} step={step} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function StepMemoryCard({ stepKey, step }: { stepKey: string; step: ProcessMemory['steps'][string] }) {
  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      <div className="px-3 py-2 bg-surface-elevated border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-accent">{stepKey}</span>
          <span className="text-xs text-text-primary font-medium">{step.name}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          step.status === 'completed' ? 'bg-status-completed/20 text-status-completed' :
          step.status === 'in_progress' ? 'bg-status-active/20 text-status-active' :
          'bg-status-pending/20 text-status-pending'
        }`}>
          {step.status.replace('_', ' ')}
        </span>
      </div>
      
      <div className="p-3 space-y-3">
        {/* Decisions Made */}
        {step.decisionsMade && step.decisionsMade.length > 0 && (
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider block mb-1.5">
              Decisions Made
            </label>
            <ul className="space-y-1">
              {step.decisionsMade.map((decision, i) => (
                <li key={i} className="flex gap-2 text-xs">
                  <span className="text-accent shrink-0">→</span>
                  <span className="text-text-secondary">
                    {typeof decision === 'string' 
                      ? decision 
                      : decision.decision}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Files Modified */}
        {step.filesModifiedCreated && step.filesModifiedCreated.length > 0 && (
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider block mb-1.5">
              Files Created/Modified
            </label>
            <ul className="space-y-0.5">
              {step.filesModifiedCreated.map((file, i) => (
                <li key={i} className="text-xs font-mono text-accent break-all">{file}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        {step.notes && (typeof step.notes === 'string' ? step.notes : step.notes.length > 0) && (
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider block mb-1.5">
              Notes
            </label>
            <ul className="space-y-1">
              {typeof step.notes === 'string' ? (
                <li className="text-xs text-text-secondary">{step.notes}</li>
              ) : (
                step.notes.map((note, i) => (
                  <li key={i} className="text-xs text-text-secondary">{note}</li>
                ))
              )}
            </ul>
          </div>
        )}

        {/* Information Produced Preview */}
        {step.informationProduced && Object.keys(step.informationProduced).length > 0 && (
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider block mb-1.5">
              Information Produced
            </label>
            <div className="text-xs text-text-muted bg-background rounded p-2 font-mono overflow-x-auto">
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(step.informationProduced, null, 2).slice(0, 500)}
                {JSON.stringify(step.informationProduced, null, 2).length > 500 && '...'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

