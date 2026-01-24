import type { ProcessLog, UserInteraction } from '../../types'

interface LogsViewProps {
  log: ProcessLog | null
  loading?: boolean
}

export function LogsView({ log, loading }: LogsViewProps) {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading logs...</span>
        </div>
      </div>
    )
  }

  if (!log) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No log data available</p>
        </div>
      </div>
    )
  }

  const stepEntries = log.steps ? Object.entries(log.steps).sort((a, b) => {
    const numA = parseInt(a[0].replace(/\D/g, '')) || 0
    const numB = parseInt(b[0].replace(/\D/g, '')) || 0
    return numB - numA
  }) : []
  const processWideObservations = log.processWideObservations
  const efficiencyMetrics = processWideObservations?.efficiencyMetrics

  return (
    <div className="h-full overflow-auto p-4">
      <div className="space-y-6">
        {/* Process Metadata */}
        {log.metadata && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Process Info
            </h3>
            <div className="bg-surface rounded-lg border border-border p-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                {log.metadata.template && (
                  <div>
                    <span className="text-text-muted">Template:</span>
                    <span className="ml-2 text-text-secondary font-mono">{log.metadata.template}</span>
                  </div>
                )}
                {log.metadata.started && (
                  <div>
                    <span className="text-text-muted">Started:</span>
                    <span className="ml-2 text-text-secondary">{formatDate(log.metadata.started)}</span>
                  </div>
                )}
                {log.metadata.completed && (
                  <div className="col-span-2">
                    <span className="text-text-muted">Completed:</span>
                    <span className="ml-2 text-status-completed">{formatDate(log.metadata.completed)}</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Efficiency Metrics */}
        {efficiencyMetrics && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Metrics
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <MetricCard 
                label="Steps Completed" 
                value={efficiencyMetrics.stepsCompleted ?? 0} 
                color="text-status-completed"
              />
              <MetricCard 
                label="User Corrections" 
                value={efficiencyMetrics.totalUserCorrections ?? 0} 
                color="text-status-paused"
              />
              <MetricCard 
                label="Files Modified" 
                value={efficiencyMetrics.filesModified ?? 0} 
                color="text-accent"
              />
              <MetricCard 
                label="Multi-iteration Steps" 
                value={efficiencyMetrics.stepsRequiringMultipleIterations ?? 0} 
                color="text-text-secondary"
              />
            </div>
          </section>
        )}

        {/* Step Logs */}
        {stepEntries.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Step Activity Logs
            </h3>
            <div className="space-y-3">
              {stepEntries.map(([stepKey, step]) => (
                <StepLogCard key={stepKey} stepKey={stepKey} step={step} />
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {processWideObservations?.recommendationsForFuture && processWideObservations.recommendationsForFuture.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Recommendations for Future
            </h3>
            <div className="bg-surface rounded-lg border border-border p-3">
              <ul className="space-y-1.5">
                {processWideObservations.recommendationsForFuture.map((rec, i) => (
                  <li key={i} className="flex gap-2 text-xs">
                    <span className="text-accent shrink-0">*</span>
                    <span className="text-text-secondary">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-surface rounded-lg border border-border p-3 text-center">
      <div className={`text-2xl font-mono font-semibold ${color}`}>{value}</div>
      <div className="text-xs text-text-muted mt-1">{label}</div>
    </div>
  )
}

function StepLogCard({ stepKey, step }: { stepKey: string; step: ProcessLog['steps'][string] }) {
  if (!step) return null

  const hasContent = (step.actionsTaken && step.actionsTaken.length > 0) || 
                     (step.userInteractions && step.userInteractions.length > 0) || 
                     (step.agentReasoning && step.agentReasoning.length > 0)

  if (!hasContent) {
    return null
  }

  const timestamp = step.timestamp || { started: null, completed: null }

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      <div className="px-3 py-2 bg-surface-elevated border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-accent">{stepKey}</span>
          <span className="text-xs text-text-primary font-medium">{step.name || 'Unknown Step'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          {timestamp.started && (
            <span>{formatDate(timestamp.started)}</span>
          )}
          {timestamp.completed && (
            <>
              <span>-&gt;</span>
              <span className="text-status-completed">{formatDate(timestamp.completed)}</span>
            </>
          )}
        </div>
      </div>
      
      <div className="p-3 space-y-4">
        {/* Actions Taken */}
        {step.actionsTaken && step.actionsTaken.length > 0 && (
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Actions Taken
            </label>
            <ul className="space-y-1.5">
              {step.actionsTaken.map((action, i) => (
                <li key={i} className="flex gap-2 text-xs">
                  <span className="text-status-completed shrink-0">+</span>
                  <span className="text-text-secondary">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Agent Reasoning */}
        {step.agentReasoning && step.agentReasoning.length > 0 && (
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Agent Reasoning
            </label>
            <ul className="space-y-1.5 bg-background rounded p-2">
              {step.agentReasoning.map((reasoning, i) => (
                <li key={i} className="flex gap-2 text-xs">
                  <span className="text-accent shrink-0">-&gt;</span>
                  <span className="text-text-muted italic">{reasoning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* User Interactions */}
        {step.userInteractions && step.userInteractions.length > 0 && (
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              User Interactions ({step.userInteractions.length})
            </label>
            <div className="space-y-2">
              {[...step.userInteractions].sort((a, b) => 
                  new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                ).map((interaction, i) => (
                <UserInteractionCard key={i} interaction={interaction} />
              ))}
            </div>
          </div>
        )}

        {/* Decisions Made */}
        {step.decisionsMade && step.decisionsMade.length > 0 && (
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Decisions Made
            </label>
            <ul className="space-y-1">
              {step.decisionsMade.map((decision, i) => (
                <li key={i} className="text-xs text-text-secondary">- {decision}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Problems Encountered */}
        {step.problemsEncountered && step.problemsEncountered.length > 0 && (
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-status-failed" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Problems Encountered
            </label>
            <ul className="space-y-1 bg-status-failed/10 border border-status-failed/30 rounded p-2">
              {step.problemsEncountered.map((problem, i) => (
                <li key={i} className="text-xs text-status-failed">! {problem}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function UserInteractionCard({ interaction }: { interaction: UserInteraction }) {
  if (!interaction) return null
  
  return (
    <div className="bg-background rounded-lg border border-border-muted p-2.5 space-y-2">
      <div>
        <div className="flex items-start gap-2">
          <span className="text-status-paused text-xs shrink-0">User:</span>
          <span className="text-xs text-text-primary">{interaction.request || 'N/A'}</span>
        </div>
        {interaction.reason && (
          <div className="ml-6 mt-1 text-xs text-text-muted italic">
            Reason: {interaction.reason}
          </div>
        )}
      </div>
      <div className="flex items-start gap-2">
        <span className="text-accent text-xs shrink-0">Agent:</span>
        <span className="text-xs text-text-secondary">{interaction.response || 'N/A'}</span>
      </div>
      {interaction.timestamp && (
        <div className="text-xs text-text-muted text-right">
          {formatDate(interaction.timestamp)}
        </div>
      )}
    </div>
  )
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return isoString
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return isoString
  }
}
