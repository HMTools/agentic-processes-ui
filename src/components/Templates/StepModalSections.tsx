import type { TemplateStep } from '../../types'
import { toDisplayText, type ParsedStepDefinition } from './TemplateDetail'

export function ModalSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-elevated">
        <span className="text-accent">{icon}</span>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}

export function OutputSection({ output }: { output: ParsedStepDefinition['output'] }) {
  if (!output?.description) return null
  return (
    <ModalSection
      title="Output"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      }
    >
      <p className="text-sm text-text-secondary leading-relaxed">{output.description}</p>
      {output.artifacts && output.artifacts.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {output.artifacts.map((a, i) => (
            <span key={i} className="px-2 py-1 text-xs rounded bg-surface-elevated text-text-secondary border border-border">
              {toDisplayText(a)}
            </span>
          ))}
        </div>
      )}
      {output.memoryUpdates && output.memoryUpdates.length > 0 && (
        <div className="mt-3">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Memory Updates</span>
          <ul className="mt-1.5 space-y-1">
            {output.memoryUpdates.map((m, i) => (
              <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                <span className="text-accent mt-0.5">+</span>
                {toDisplayText(m)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </ModalSection>
  )
}

export function SubstepsSection({ substeps }: { substeps: ParsedStepDefinition['substeps'] }) {
  if (!substeps || substeps.length === 0) return null
  return (
    <ModalSection
      title={`Substeps (${substeps.length})`}
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      }
    >
      <div className="space-y-3">
        {substeps.map((ss, i) => (
          <div key={i} className="p-3 bg-surface-elevated rounded-lg">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-6 flex items-center justify-center rounded bg-surface text-xs font-medium text-text-muted flex-shrink-0 border border-border">
                {ss.number}
              </span>
              <span className="text-sm font-medium text-text-primary">{ss.name}</span>
              {ss.conditional && (
                <span className="px-1.5 py-0.5 text-[10px] rounded bg-status-active/20 text-status-active font-medium">
                  Conditional
                </span>
              )}
            </div>
            <p className="text-sm text-text-muted ml-8">{toDisplayText(ss.description)}</p>
            {ss.actions && ss.actions.length > 0 && (
              <ul className="mt-2 ml-8 space-y-1">
                {ss.actions.map((action, j) => (
                  <li key={j} className="text-sm text-text-muted flex items-start gap-2">
                    <span className="text-accent flex-shrink-0">&rarr;</span>
                    <span>{toDisplayText(action)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </ModalSection>
  )
}

export function FlowSection({ flow }: { flow: ParsedStepDefinition['flow'] }) {
  if (!flow?.description) return null
  return (
    <ModalSection
      title="Flow"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      }
    >
      <p className="text-sm text-text-secondary leading-relaxed">{flow.description}</p>
    </ModalSection>
  )
}

export function GuidanceSection({ guidance }: { guidance: ParsedStepDefinition['guidance'] }) {
  if (!guidance) return null
  const hasContent = guidance.prerequisites?.length || guidance.specificActions?.length ||
    guidance.tools?.length || guidance.bestPractices?.length || guidance.files ||
    guidance.userGuidelines?.length
  if (!hasContent) return null

  return (
    <ModalSection
      title="Guidance"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
    >
      <div className="space-y-4">
        {guidance.prerequisites && guidance.prerequisites.length > 0 && (
          <div>
            <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Prerequisites</span>
            <ul className="mt-1.5 space-y-1">
              {guidance.prerequisites.map((p, i) => (
                <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                  <span className="text-accent mt-0.5 flex-shrink-0">&bull;</span>
                  <span>{toDisplayText(p)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {guidance.specificActions && guidance.specificActions.length > 0 && (
          <div>
            <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Actions</span>
            <ul className="mt-1.5 space-y-1">
              {guidance.specificActions.map((a, i) => (
                <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                  <span className="text-accent mt-0.5 flex-shrink-0">{i + 1}.</span>
                  <span>{toDisplayText(a)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {guidance.userGuidelines && guidance.userGuidelines.length > 0 && (
          <div>
            <span className="text-xs font-medium text-text-muted uppercase tracking-wide">User Guidelines</span>
            <ul className="mt-1.5 space-y-1">
              {guidance.userGuidelines.map((g, i) => (
                <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                  <span className="text-accent mt-0.5 flex-shrink-0">&bull;</span>
                  <span>{toDisplayText(g)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {guidance.tools && guidance.tools.length > 0 && (
          <div>
            <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Tools</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {guidance.tools.map((t, i) => (
                <span key={i} className="px-2 py-1 text-xs rounded bg-surface-elevated font-mono text-text-secondary border border-border">
                  {toDisplayText(t)}
                </span>
              ))}
            </div>
          </div>
        )}
        {guidance.bestPractices && guidance.bestPractices.length > 0 && (
          <div>
            <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Best Practices</span>
            <ul className="mt-1.5 space-y-1">
              {guidance.bestPractices.map((bp, i) => (
                <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                  <span className="text-status-completed mt-0.5 flex-shrink-0">&check;</span>
                  <span>{toDisplayText(bp)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {guidance.files && Object.keys(guidance.files).length > 0 && (
          <div>
            <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Files</span>
            <div className="mt-1.5 space-y-2">
              {Object.entries(guidance.files).map(([category, files]) => (
                <div key={category}>
                  <span className="text-xs text-text-muted capitalize">{category}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(files as string[]).map((f, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs rounded bg-surface-elevated font-mono text-text-secondary border border-border">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ModalSection>
  )
}

export function MemoryFileUsageSection({ memoryFileUsage }: { memoryFileUsage: ParsedStepDefinition['memoryFileUsage'] }) {
  if (!memoryFileUsage) return null
  if (!memoryFileUsage.readFrom && !memoryFileUsage.writeTo && (!memoryFileUsage.fields || memoryFileUsage.fields.length === 0)) return null

  return (
    <ModalSection
      title="Memory File Usage"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      }
    >
      <div className="space-y-2">
        {memoryFileUsage.readFrom && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Read from</span>
            <code className="text-xs font-mono text-accent">{memoryFileUsage.readFrom}</code>
          </div>
        )}
        {memoryFileUsage.writeTo && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Write to</span>
            <code className="text-xs font-mono text-accent">{memoryFileUsage.writeTo}</code>
          </div>
        )}
        {memoryFileUsage.fields && memoryFileUsage.fields.length > 0 && (
          <div>
            <span className="text-xs text-text-muted">Fields</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {memoryFileUsage.fields.map((f, i) => (
                <span key={i} className="px-2 py-0.5 text-xs rounded bg-surface-elevated font-mono text-text-secondary border border-border">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </ModalSection>
  )
}

export function ContextSection({ context }: { context: Record<string, unknown> }) {
  return (
    <ModalSection
      title="Context"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
        </svg>
      }
    >
      <div className="space-y-2">
        {Object.entries(context).map(([key, value]) => (
          <div key={key} className="flex items-start justify-between gap-4">
            <span className="text-xs text-text-muted font-mono flex-shrink-0">{key}</span>
            <span className="text-xs text-text-secondary text-right">{toDisplayText(value)}</span>
          </div>
        ))}
      </div>
    </ModalSection>
  )
}

export function SubProcessSection({ trigger }: { trigger: NonNullable<TemplateStep['subProcessTrigger']> }) {
  return (
    <ModalSection
      title="Sub-Process Trigger"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      }
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">Template</span>
          <code className="text-xs font-mono text-accent" title={trigger.template}>{trigger.templateName || trigger.template}</code>
        </div>
        {trigger.condition && (
          <div className="flex items-start justify-between gap-4">
            <span className="text-xs text-text-muted flex-shrink-0">Condition</span>
            <span className="text-xs text-text-secondary text-right">{trigger.condition}</span>
          </div>
        )}
        {trigger.forEach && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">For Each</span>
            <code className="text-xs font-mono text-text-secondary">{trigger.forEach}</code>
          </div>
        )}
        {trigger.syncPoint && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Sync Point</span>
            <code className="text-xs font-mono text-text-secondary">{trigger.syncPoint}</code>
          </div>
        )}
      </div>
    </ModalSection>
  )
}
