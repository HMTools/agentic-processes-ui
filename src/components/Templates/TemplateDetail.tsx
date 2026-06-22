import { useState, useMemo } from 'react'
import type { ProcessTemplate } from '../../types'
import { formatCategoryName, getStepRefDisplayName, extractTemplateMemoryFlow } from '../../services/templatesService'
import { MemoryFlowTable } from './MemoryFlowTable'

export function toDisplayText(value: unknown): string {
  if (typeof value === 'string') return value
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if ('description' in obj && typeof obj.description === 'string') return obj.description
    if ('message' in obj && typeof obj.message === 'string') return obj.message
    if ('text' in obj && typeof obj.text === 'string') return obj.text
    if ('name' in obj && typeof obj.name === 'string') return obj.name
    return JSON.stringify(value)
  }
  return String(value)
}

interface TemplateDetailProps {
  template: ProcessTemplate
  onClose: () => void
  onUseTemplate?: (template: ProcessTemplate) => void
  expandedStepIndex?: number | null
  onStepClick?: (index: number | null) => void
  onSubProcessClick?: (templateName: string, stepIndex: number) => void
  parentTemplateName?: string
  parentStepName?: string
  onNavigateBack?: () => void
  highlightedStepIndex?: number | null
}

type ViewMode = 'formatted' | 'json'

export function TemplateDetail({ template, onClose, onUseTemplate, expandedStepIndex, onStepClick, onSubProcessClick, parentTemplateName, parentStepName, onNavigateBack, highlightedStepIndex }: TemplateDetailProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('formatted')

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Back to parent bar */}
      {parentTemplateName && onNavigateBack && (
        <button
          onClick={onNavigateBack}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-purple-500/10 border-b border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-colors text-left"
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-xs font-medium truncate">
            Back to {parentTemplateName}
            {parentStepName && <span className="text-purple-400/60"> &middot; {parentStepName}</span>}
          </span>
        </button>
      )}
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/20">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                {template.metadata.title}
              </h2>
              <p className="text-xs text-text-muted">{template.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onUseTemplate && (
              <button
                onClick={() => onUseTemplate(template)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-background hover:bg-accent/90 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Use Template
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-surface transition-colors"
            >
              <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex gap-1 bg-surface rounded-md p-0.5">
          <button
            onClick={() => setViewMode('formatted')}
            className={`flex-1 px-3 py-1 text-xs font-medium rounded transition-colors ${
              viewMode === 'formatted' 
                ? 'bg-accent text-background' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Formatted
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`flex-1 px-3 py-1 text-xs font-medium rounded transition-colors ${
              viewMode === 'json' 
                ? 'bg-accent text-background' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            JSON
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'json' ? (
          <JsonView template={template} />
        ) : (
          <ProcessTemplateView template={template} expandedStepIndex={expandedStepIndex} onStepClick={onStepClick} onSubProcessClick={onSubProcessClick} highlightedStepIndex={highlightedStepIndex} />
        )}
      </div>
    </div>
  )
}

// JSON view component
function JsonView({ template }: { template: ProcessTemplate }) {
  // Remove UI-specific fields for cleaner JSON display
  const cleanTemplate = { ...template }
  delete (cleanTemplate as any).filePath

  return (
    <pre className="text-xs font-mono text-text-secondary bg-surface rounded-lg p-4 overflow-x-auto">
      {JSON.stringify(cleanTemplate, null, 2)}
    </pre>
  )
}

// Process template formatted view
function ProcessTemplateView({ template, expandedStepIndex, onStepClick, onSubProcessClick, highlightedStepIndex }: { template: ProcessTemplate; expandedStepIndex?: number | null; onStepClick?: (index: number | null) => void; onSubProcessClick?: (templateName: string, stepIndex: number) => void; highlightedStepIndex?: number | null }) {
  const memoryFlow = useMemo(() => extractTemplateMemoryFlow(template), [template])

  return (
    <div className="space-y-6">
      {/* Metadata */}
      <Section title="Overview">
        <div className="space-y-3">
          <InfoRow label="Category" value={formatCategoryName(template.category)} />
          <InfoRow label="Last Updated" value={template.metadata.lastUpdated} />
          <div>
            <Label>Purpose</Label>
            <p className="text-xs text-text-secondary mt-1">{template.metadata.purposeAndUsage}</p>
          </div>
        </div>
      </Section>

      {/* Parameters */}
      {(template.parameters.required.length > 0 || template.parameters.optional.length > 0) && (
        <Section title="Parameters">
          <div className="space-y-3">
            {template.parameters.required.length > 0 && (
              <div>
                <Label>Required</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {template.parameters.required.map(param => (
                    <ParameterBadge key={param} name={param} required />
                  ))}
                </div>
              </div>
            )}
            {template.parameters.optional.length > 0 && (
              <div>
                <Label>Optional</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {template.parameters.optional.map(param => (
                    <ParameterBadge key={param} name={param} />
                  ))}
                </div>
              </div>
            )}
            {Object.keys(template.parameters.definitions).length > 0 && (
              <div>
                <Label>Definitions</Label>
                <div className="mt-2 space-y-2">
                  {Object.entries(template.parameters.definitions).map(([name, def]) => (
                    <div key={name} className="p-2 bg-surface rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-xs font-mono text-accent">{name}</code>
                        <span className="text-[10px] text-text-muted">({def.type})</span>
                      </div>
                      <p className="text-[10px] text-text-muted">{toDisplayText(def.description)}</p>
                      {def.example && (
                        <p className="text-[10px] text-text-muted mt-1">
                          Example: <code className="text-accent">{toDisplayText(def.example)}</code>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Steps */}
      <Section title={`Steps (${template.steps.length})`}>
        <div className="space-y-2">
          {template.steps.map((step, index) => {
            const hasDefinition = step.stepDefinition && Object.keys(step.stepDefinition).length > 0
            const hasSubProcess = !!step.subProcessTrigger
            const isClickable = hasDefinition || hasSubProcess
            const isHighlighted = highlightedStepIndex === index
            return (
              <div
                key={index}
                ref={isHighlighted ? (el) => { el?.scrollIntoView({ behavior: 'smooth', block: 'center' }) } : undefined}
              >
                <button
                  onClick={() => {
                    if (hasSubProcess && !hasDefinition) {
                      onSubProcessClick?.(step.subProcessTrigger!.template, index)
                    } else if (hasDefinition) {
                      onStepClick?.(index)
                    }
                  }}
                  className={`
                    w-full text-left flex items-start gap-3 p-2 rounded-md transition-all duration-500
                    bg-surface hover:bg-surface-elevated
                    ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                    ${isHighlighted ? 'ring-2 ring-purple-400/60 bg-purple-500/10' : ''}
                  `}
                >
                  <span className="w-5 h-5 flex items-center justify-center rounded bg-surface-elevated text-[10px] font-medium text-text-muted flex-shrink-0 mt-0.5">
                    {step.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-text-primary">{step.name}</span>
                      {step.approvalRequired && (
                        <span className="px-1 py-0.5 text-[9px] rounded bg-status-paused/20 text-status-paused">
                          Approval
                        </span>
                      )}
                      {step.conditional && (
                        <span className="px-1 py-0.5 text-[9px] rounded bg-status-active/20 text-status-active">
                          Conditional
                        </span>
                      )}
                      {hasSubProcess && (
                        <span className="px-1 py-0.5 text-[9px] rounded bg-purple-500/20 text-purple-400">
                          Sub-Process
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {step.stepRef ? getStepRefDisplayName(step.stepRef, step.stepRefName) : hasSubProcess ? (step.subProcessTrigger!.templateName || step.subProcessTrigger!.template) : ''}
                    </p>
                    {step.output && (
                      <p className="text-[10px] text-text-muted mt-0.5">
                        Output: {toDisplayText(step.output)}
                      </p>
                    )}
                  </div>
                  {hasDefinition && (
                    <svg className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  )}
                  {hasSubProcess && !hasDefinition && (
                    <svg className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Memory Flow */}
      {memoryFlow.allTopics.length > 0 && (
        <Section title="Memory Flow">
          <MemoryFlowTable flow={memoryFlow} />
        </Section>
      )}

      {/* References */}
      {template.references && (
        <Section title="References">
          <div className="space-y-3">
            {template.references.relatedTemplates.length > 0 && (
              <div>
                <Label>Related Templates</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {template.references.relatedTemplates.map(ref => (
                    <span key={ref} className="px-2 py-0.5 text-[10px] rounded bg-surface text-text-secondary">
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}
    </div>
  )
}

export interface ParsedStepDefinition {
  output?: { description?: string; artifacts?: string[]; memoryUpdates?: string[] }
  guidance?: { prerequisites?: string[]; userGuidelines?: string[]; specificActions?: string[]; tools?: string[]; bestPractices?: string[]; files?: Record<string, string[]> }
  substeps?: Array<{ number: number; name: string; description: string; actions?: string[]; conditional?: string }>
  flow?: { description?: string }
  memoryFileUsage?: { readFrom?: string; writeTo?: string; fields?: string[] }
}

export function parseStepDefinition(stepDef: Record<string, unknown>): ParsedStepDefinition {
  return {
    output: stepDef.output as ParsedStepDefinition['output'],
    guidance: stepDef.guidance as ParsedStepDefinition['guidance'],
    substeps: stepDef.substeps as ParsedStepDefinition['substeps'],
    flow: stepDef.flow as ParsedStepDefinition['flow'],
    memoryFileUsage: stepDef.memoryFileUsage as ParsedStepDefinition['memoryFileUsage'],
  }
}

function StepDefinitionDetail({ stepDef }: { stepDef: Record<string, unknown> }) {
  const { output, guidance, substeps, flow, memoryFileUsage } = parseStepDefinition(stepDef)

  return (
    <div className="space-y-4 py-2">
      {output?.description && (
        <div>
          <Label>Output</Label>
          <p className="text-[10px] text-text-secondary mt-1">{output.description}</p>
          {output.artifacts && output.artifacts.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {output.artifacts.map((a, i) => (
                <span key={i} className="px-1.5 py-0.5 text-[10px] rounded bg-surface text-text-secondary">{toDisplayText(a)}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {guidance && (
        <div className="space-y-2">
          {guidance.prerequisites && guidance.prerequisites.length > 0 && (
            <div>
              <Label>Prerequisites</Label>
              <ul className="mt-1 space-y-0.5">
                {guidance.prerequisites.map((p, i) => (
                  <li key={i} className="text-[10px] text-text-muted flex items-start gap-1.5">
                    <span className="text-accent mt-0.5">•</span>
                    {toDisplayText(p)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {guidance.specificActions && guidance.specificActions.length > 0 && (
            <div>
              <Label>Actions</Label>
              <ul className="mt-1 space-y-0.5">
                {guidance.specificActions.map((a, i) => (
                  <li key={i} className="text-[10px] text-text-muted flex items-start gap-1.5">
                    <span className="text-accent mt-0.5">{i + 1}.</span>
                    {toDisplayText(a)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {guidance.tools && guidance.tools.length > 0 && (
            <div>
              <Label>Tools</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {guidance.tools.map((t, i) => (
                  <span key={i} className="px-1.5 py-0.5 text-[10px] rounded bg-surface font-mono text-text-secondary">{toDisplayText(t)}</span>
                ))}
              </div>
            </div>
          )}
          {guidance.bestPractices && guidance.bestPractices.length > 0 && (
            <div>
              <Label>Best Practices</Label>
              <ul className="mt-1 space-y-0.5">
                {guidance.bestPractices.map((bp, i) => (
                  <li key={i} className="text-[10px] text-text-muted flex items-start gap-1.5">
                    <span className="text-status-completed mt-0.5">✓</span>
                    {toDisplayText(bp)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {substeps && substeps.length > 0 && (
        <div>
          <Label>Substeps ({substeps.length})</Label>
          <div className="mt-1 space-y-1.5">
            {substeps.map((ss, i) => (
              <div key={i} className="p-1.5 bg-surface rounded">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 flex items-center justify-center rounded bg-surface-elevated text-[9px] font-medium text-text-muted flex-shrink-0">
                    {ss.number}
                  </span>
                  <span className="text-[10px] font-medium text-text-primary">{ss.name}</span>
                  {ss.conditional && (
                    <span className="px-1 py-0.5 text-[8px] rounded bg-status-active/20 text-status-active">Conditional</span>
                  )}
                </div>
                <p className="text-[10px] text-text-muted mt-0.5 ml-5.5">{toDisplayText(ss.description)}</p>
                {ss.actions && ss.actions.length > 0 && (
                  <ul className="mt-1 ml-5.5 space-y-0.5">
                    {ss.actions.map((action, j) => (
                      <li key={j} className="text-[10px] text-text-muted flex items-start gap-1">
                        <span className="text-accent">→</span>
                        {toDisplayText(action)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {flow?.description && (
        <div>
          <Label>Flow</Label>
          <p className="text-[10px] text-text-secondary mt-1">{flow.description}</p>
        </div>
      )}

      {memoryFileUsage && (
        <div>
          <Label>Memory Usage</Label>
          <div className="mt-1 space-y-0.5">
            {memoryFileUsage.readFrom && (
              <p className="text-[10px] text-text-muted">Read from: <code className="text-accent">{memoryFileUsage.readFrom}</code></p>
            )}
            {memoryFileUsage.writeTo && (
              <p className="text-[10px] text-text-muted">Write to: <code className="text-accent">{memoryFileUsage.writeTo}</code></p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper components
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-text-primary mb-3 pb-2 border-b border-border">
        {title}
      </h3>
      {children}
    </div>
  )
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide">
      {children}
    </span>
  )
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <span className="text-xs text-text-secondary">{value}</span>
    </div>
  )
}

function ParameterBadge({ name, required }: { name: string; required?: boolean }) {
  return (
    <span className={`px-2 py-0.5 text-[10px] rounded font-mono ${
      required 
        ? 'bg-accent/20 text-accent' 
        : 'bg-surface text-text-secondary'
    }`}>
      {name}
      {required && <span className="text-status-failed ml-0.5">*</span>}
    </span>
  )
}
