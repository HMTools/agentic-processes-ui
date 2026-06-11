import type { MemoryFlowMapping } from '../../types'

interface MemoryFlowTableProps {
  flow: MemoryFlowMapping
  /** Optional: render step status indicator (for instance view) */
  renderStepStatus?: (step: MemoryFlowMapping['steps'][number]) => React.ReactNode
  /** Optional: render topic column header extras (for instance view, e.g. data-present dot) */
  renderTopicExtra?: (topic: string) => React.ReactNode
}

function AccessBadge({ access }: { access: 'R' | 'W' | 'R/W' }) {
  const styles = {
    R: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    W: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'R/W': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  }

  return (
    <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium rounded border ${styles[access]}`}>
      {access}
    </span>
  )
}

export function MemoryFlowTable({ flow, renderStepStatus, renderTopicExtra }: MemoryFlowTableProps) {
  if (flow.allTopics.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-text-muted">
        No memory topics defined in this process.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="text-left px-2 py-2 text-text-muted font-medium uppercase tracking-wider border-b border-border sticky left-0 bg-background z-10 min-w-[160px]">
              Step
            </th>
            {flow.allTopics.map(topic => (
              <th
                key={topic}
                className="px-2 py-2 text-center text-text-muted font-medium border-b border-border min-w-[80px]"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="font-mono text-accent truncate max-w-[100px]" title={topic}>
                    {topic}
                  </span>
                  {renderTopicExtra?.(topic)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {flow.steps.map(step => (
            <tr key={step.stepNumber} className="hover:bg-surface/50 transition-colors">
              <td className="px-2 py-2 border-b border-border/50 sticky left-0 bg-background z-10">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center rounded bg-surface-elevated text-[10px] font-medium text-text-muted flex-shrink-0">
                    {step.stepNumber}
                  </span>
                  {renderStepStatus?.(step)}
                  <span className="text-text-primary truncate" title={step.stepName}>
                    {step.stepName}
                  </span>
                </div>
              </td>
              {flow.allTopics.map(topic => {
                const reads = step.readFrom.includes(topic)
                const writes = step.writeTo.includes(topic)
                const access = reads && writes ? 'R/W' : reads ? 'R' : writes ? 'W' : null

                return (
                  <td key={topic} className="px-2 py-2 text-center border-b border-border/50">
                    {access && <AccessBadge access={access} />}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 px-2 text-[10px] text-text-muted">
        <div className="flex items-center gap-1.5">
          <AccessBadge access="R" />
          <span>Read</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AccessBadge access="W" />
          <span>Write</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AccessBadge access="R/W" />
          <span>Read + Write</span>
        </div>
      </div>
    </div>
  )
}
