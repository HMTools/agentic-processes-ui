import { useState, useEffect, useRef, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import mermaid from 'mermaid'
import type { ProcessTemplate, StepTemplate } from '../../types'
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

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#3b82f6',
    primaryTextColor: '#e5e7eb',
    primaryBorderColor: '#4b5563',
    lineColor: '#6b7280',
    secondaryColor: '#1f2937',
    tertiaryColor: '#374151',
    background: '#111827',
    mainBkg: '#1f2937',
    nodeBorder: '#4b5563',
    clusterBkg: '#1f2937',
    clusterBorder: '#4b5563',
    titleColor: '#e5e7eb',
    edgeLabelBackground: '#1f2937',
  },
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
  },
})

interface TemplateDetailProps {
  template: ProcessTemplate | StepTemplate
  templateType: 'process' | 'step'
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

type ViewMode = 'markdown' | 'formatted' | 'json'

export function TemplateDetail({ template, templateType, onClose, onUseTemplate, expandedStepIndex, onStepClick, onSubProcessClick, parentTemplateName, parentStepName, onNavigateBack, highlightedStepIndex }: TemplateDetailProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('markdown')

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
              {templateType === 'process' ? (
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                {template.metadata.title}
              </h2>
              <p className="text-xs text-text-muted">{template.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {templateType === 'process' && onUseTemplate && (
              <button
                onClick={() => onUseTemplate(template as ProcessTemplate)}
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
            onClick={() => setViewMode('markdown')}
            className={`flex-1 px-3 py-1 text-xs font-medium rounded transition-colors ${
              viewMode === 'markdown' 
                ? 'bg-accent text-background' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Markdown
          </button>
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
        {viewMode === 'markdown' ? (
          <MarkdownView template={template} />
        ) : viewMode === 'json' ? (
          <JsonView template={template} />
        ) : templateType === 'process' ? (
          <ProcessTemplateView template={template as ProcessTemplate} expandedStepIndex={expandedStepIndex} onStepClick={onStepClick} onSubProcessClick={onSubProcessClick} highlightedStepIndex={highlightedStepIndex} />
        ) : (
          <StepTemplateView template={template as StepTemplate} />
        )}
      </div>
    </div>
  )
}

// Markdown view component
function MarkdownView({ template }: { template: ProcessTemplate | StepTemplate }) {
  if (!template.markdownContent) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg className="w-12 h-12 text-text-muted mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm text-text-muted">No markdown documentation available</p>
        <p className="text-xs text-text-muted mt-1">Switch to Formatted or JSON view to see template details</p>
      </div>
    )
  }

  return (
    <div className="prose prose-sm max-w-none
      prose-headings:text-text-primary prose-headings:font-semibold
      prose-h1:text-lg prose-h1:border-b prose-h1:border-border prose-h1:pb-2 prose-h1:mb-4
      prose-h2:text-base prose-h2:mt-6 prose-h2:mb-3
      prose-h3:text-sm prose-h3:mt-4 prose-h3:mb-2
      prose-p:text-text-secondary prose-p:text-sm prose-p:leading-relaxed
      prose-a:text-accent prose-a:no-underline hover:prose-a:underline
      prose-strong:text-text-primary prose-strong:font-semibold
      prose-code:text-accent prose-code:bg-surface prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-surface prose-pre:rounded-lg prose-pre:p-4
      prose-ul:text-text-secondary prose-ul:text-sm
      prose-ol:text-text-secondary prose-ol:text-sm
      prose-li:text-text-secondary prose-li:my-1
      prose-blockquote:border-l-accent prose-blockquote:text-text-muted prose-blockquote:italic
      prose-hr:border-border
    ">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ className, children, ...props }: { className?: string; children?: React.ReactNode }) => {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''
            const codeContent = String(children).replace(/\n$/, '')
            
            // Handle mermaid diagrams
            if (language === 'mermaid') {
              return <MermaidDiagram chart={codeContent} />
            }
            
            // Regular code blocks (detected by having a language)
            if (language) {
              return (
                <div className="my-4 rounded-lg border border-border overflow-hidden not-prose">
                  <div className="px-3 py-1.5 bg-surface-elevated border-b border-border text-xs text-text-muted font-mono">
                    {language}
                  </div>
                  <pre className="bg-surface p-4 overflow-x-auto">
                    <code className="text-xs font-mono text-text-secondary leading-relaxed" {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              )
            }
            
            if (codeContent.includes('\n')) {
              return (
                <div className="my-4 rounded-lg border border-border overflow-hidden not-prose">
                  <pre className="bg-surface p-4 overflow-x-auto">
                    <code className="text-xs font-mono text-text-secondary leading-relaxed" {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              )
            }

            // Inline code
            return (
              <code className="text-accent bg-surface/80 px-1.5 py-0.5 rounded text-xs font-mono border border-border/50" {...props}>
                {children}
              </code>
            )
          },
          pre: ({ children }: { children?: React.ReactNode }) => {
            // Just pass through - let the code component handle styling
            return <>{children}</>
          },
        }}
      >
        {template.markdownContent}
      </ReactMarkdown>
    </div>
  )
}

// Mermaid diagram component
function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const idRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    const renderDiagram = async () => {
      if (!chart.trim()) return
      
      try {
        setError(null)
        const { svg: renderedSvg } = await mermaid.render(idRef.current, chart)
        setSvg(renderedSvg)
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
      }
    }

    renderDiagram()
  }, [chart])

  if (error) {
    return (
      <div className="my-4 p-4 bg-status-failed/10 border border-status-failed/30 rounded-lg not-prose">
        <div className="flex items-center gap-2 text-status-failed text-sm mb-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Mermaid diagram error</span>
        </div>
        <pre className="text-xs text-text-muted font-mono whitespace-pre-wrap">{error}</pre>
        <details className="mt-2">
          <summary className="text-xs text-text-muted cursor-pointer hover:text-text-secondary">Show source</summary>
          <pre className="mt-2 text-xs text-text-muted font-mono whitespace-pre-wrap bg-surface p-2 rounded">{chart}</pre>
        </details>
      </div>
    )
  }

  if (!svg) {
    return (
      <div className="my-4 p-4 bg-surface border border-border rounded-lg flex items-center justify-center not-prose">
        <svg className="w-5 h-5 animate-spin text-text-muted" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="my-4 p-4 bg-surface border border-border rounded-lg overflow-x-auto flex justify-center not-prose"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

// JSON view component
function JsonView({ template }: { template: ProcessTemplate | StepTemplate }) {
  // Remove UI-specific fields for cleaner JSON display
  const cleanTemplate = { ...template }
  delete (cleanTemplate as any).filePath
  delete (cleanTemplate as any).markdownPath
  delete (cleanTemplate as any).markdownContent

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
                      {step.stepRef ? getStepRefDisplayName(step.stepRef) : hasSubProcess ? step.subProcessTrigger!.template : ''}
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

// Step template formatted view
export function StepTemplateView({ template }: { template: StepTemplate }) {
  return (
    <div className="space-y-6">
      {/* Metadata */}
      <Section title="Overview">
        <div className="space-y-3">
          <InfoRow label="Category" value={formatCategoryName(template.category)} />
          <InfoRow label="Last Updated" value={template.metadata.lastUpdated} />
          {template.approvalRequired && (
            <InfoRow label="Approval" value="Required" />
          )}
          <div>
            <Label>Purpose</Label>
            <p className="text-xs text-text-secondary mt-1">{template.metadata.purposeAndUsage}</p>
          </div>
        </div>
      </Section>

      {/* Output */}
      <Section title="Output">
        <div className="space-y-2">
          <p className="text-xs text-text-secondary">{template.output.description}</p>
          {template.output.artifacts && template.output.artifacts.length > 0 && (
            <div>
              <Label>Artifacts</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {template.output.artifacts.map((artifact, i) => (
                  <span key={i} className="px-2 py-0.5 text-[10px] rounded bg-surface text-text-secondary">
                    {toDisplayText(artifact)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Guidance */}
      {template.guidance && (
        <Section title="Guidance">
          <div className="space-y-3">
            {template.guidance.prerequisites && template.guidance.prerequisites.length > 0 && (
              <div>
                <Label>Prerequisites</Label>
                <ul className="mt-1 space-y-1">
                  {template.guidance.prerequisites.map((prereq, i) => (
                    <li key={i} className="text-[10px] text-text-muted flex items-start gap-1.5">
                      <span className="text-accent mt-0.5">•</span>
                      {toDisplayText(prereq)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {template.guidance.specificActions && template.guidance.specificActions.length > 0 && (
              <div>
                <Label>Specific Actions</Label>
                <ul className="mt-1 space-y-1">
                  {template.guidance.specificActions.map((action, i) => (
                    <li key={i} className="text-[10px] text-text-muted flex items-start gap-1.5">
                      <span className="text-accent mt-0.5">{i + 1}.</span>
                      {toDisplayText(action)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {template.guidance.tools && template.guidance.tools.length > 0 && (
              <div>
                <Label>Tools</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {template.guidance.tools.map((tool, i) => (
                    <span key={i} className="px-2 py-0.5 text-[10px] rounded bg-surface font-mono text-text-secondary">
                      {toDisplayText(tool)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {template.guidance.bestPractices && template.guidance.bestPractices.length > 0 && (
              <div>
                <Label>Best Practices</Label>
                <ul className="mt-1 space-y-1">
                  {template.guidance.bestPractices.map((practice, i) => (
                    <li key={i} className="text-[10px] text-text-muted flex items-start gap-1.5">
                      <span className="text-status-completed mt-0.5">✓</span>
                      {toDisplayText(practice)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Substeps */}
      {template.substeps && template.substeps.length > 0 && (
        <Section title={`Substeps (${template.substeps.length})`}>
          <div className="space-y-2">
            {template.substeps.map((substep, index) => (
              <div key={index} className="p-2 bg-surface rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 flex items-center justify-center rounded bg-surface-elevated text-[10px] font-medium text-text-muted flex-shrink-0">
                    {substep.number}
                  </span>
                  <span className="text-xs font-medium text-text-primary">{substep.name}</span>
                  {substep.conditional && (
                    <span className="px-1 py-0.5 text-[9px] rounded bg-status-active/20 text-status-active">
                      Conditional
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-text-muted ml-7">{toDisplayText(substep.description)}</p>
                {substep.actions && substep.actions.length > 0 && (
                  <ul className="mt-1.5 ml-7 space-y-0.5">
                    {substep.actions.map((action, i) => (
                      <li key={i} className="text-[10px] text-text-muted flex items-start gap-1.5">
                        <span className="text-accent">→</span>
                        {toDisplayText(action)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Flow */}
      {template.flow?.description && (
        <Section title="Flow">
          <p className="text-xs text-text-secondary">{template.flow.description}</p>
        </Section>
      )}

      {/* Memory File Usage */}
      {template.memoryFileUsage && (
        <Section title="Memory File Usage">
          <div className="space-y-2">
            {template.memoryFileUsage.readFrom && (
              <InfoRow label="Read From" value={template.memoryFileUsage.readFrom} />
            )}
            {template.memoryFileUsage.writeTo && (
              <InfoRow label="Write To" value={template.memoryFileUsage.writeTo} />
            )}
          </div>
        </Section>
      )}

      {/* References */}
      {template.references && (
        <Section title="References">
          <div className="space-y-3">
            {template.references.relatedSteps && template.references.relatedSteps.length > 0 && (
              <div>
                <Label>Related Steps</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {template.references.relatedSteps.map(ref => (
                    <span key={ref} className="px-2 py-0.5 text-[10px] rounded bg-surface text-text-secondary">
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {template.references.usedInTemplates && template.references.usedInTemplates.length > 0 && (
              <div>
                <Label>Used In Templates</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {template.references.usedInTemplates.map(ref => (
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
