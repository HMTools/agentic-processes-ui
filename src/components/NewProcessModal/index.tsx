import { useState, useCallback, useMemo, useEffect } from 'react'
import type { ProcessTemplate, AgentSettings } from '../../types'
import { ParameterForm } from './ParameterForm'
import {
  generateNewProcessPrompt,
  validateParameters,
  getDefaultParameterValues,
  createProcessViaAgent
} from '../../services/processCreationService'
import { filterByCategory, searchTemplates, formatCategoryName } from '../../services/templatesService'

type ModalStep = 'select-template' | 'fill-parameters' | 'review'
type CreationStatus = 'idle' | 'creating' | 'sending' | 'done' | 'error'

interface NewProcessModalProps {
  isOpen: boolean
  onClose: () => void
  templates: ProcessTemplate[]
  projectPath: string
  agentSettings: AgentSettings
  /** Pre-selected template (e.g. from Templates page "Use Template" button) */
  preSelectedTemplate?: ProcessTemplate | null
}

export function NewProcessModal({
  isOpen,
  onClose,
  templates,
  projectPath,
  agentSettings,
  preSelectedTemplate
}: NewProcessModalProps) {
  // Step management
  const [step, setStep] = useState<ModalStep>(
    preSelectedTemplate ? 'fill-parameters' : 'select-template'
  )

  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessTemplate | null>(
    preSelectedTemplate || null
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  // Parameter values
  const [paramValues, setParamValues] = useState<Record<string, string>>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Creation state
  const [creationStatus, setCreationStatus] = useState<CreationStatus>('idle')
  const [creationError, setCreationError] = useState<string | null>(null)

  // Reset state when modal opens/closes or preSelectedTemplate changes
  useEffect(() => {
    if (isOpen) {
      if (preSelectedTemplate) {
        setSelectedTemplate(preSelectedTemplate)
        setStep('fill-parameters')
        setParamValues(getDefaultParameterValues(preSelectedTemplate))
      } else {
        setSelectedTemplate(null)
        setStep('select-template')
        setParamValues({})
      }
      setSearchQuery('')
      setCategoryFilter(null)
      setValidationErrors([])
      setCreationStatus('idle')
      setCreationError(null)
    }
  }, [isOpen, preSelectedTemplate])

  // Categories from available templates
  const categories = useMemo(() => {
    const cats = new Set(templates.map(t => t.category))
    return Array.from(cats).sort()
  }, [templates])

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    let result = filterByCategory(templates, categoryFilter)
    if (searchQuery) {
      result = searchTemplates(result, searchQuery)
    }
    return result.sort((a, b) => a.metadata.title.localeCompare(b.metadata.title))
  }, [templates, categoryFilter, searchQuery])

  // Select a template and move to parameters step
  const handleSelectTemplate = useCallback((template: ProcessTemplate) => {
    setSelectedTemplate(template)
    setParamValues(getDefaultParameterValues(template))
    setValidationErrors([])
    setStep('fill-parameters')
  }, [])

  // Move to review step
  const handleProceedToReview = useCallback(() => {
    if (!selectedTemplate) return
    const result = validateParameters(selectedTemplate, paramValues)
    if (!result.valid) {
      setValidationErrors(result.errors)
      return
    }
    setValidationErrors([])
    setStep('review')
  }, [selectedTemplate, paramValues])

  // Go back one step
  const handleBack = useCallback(() => {
    if (step === 'fill-parameters') {
      if (preSelectedTemplate) {
        onClose()
      } else {
        setStep('select-template')
      }
    } else if (step === 'review') {
      setStep('fill-parameters')
    }
  }, [step, preSelectedTemplate, onClose])

  // Generate preview prompt
  const previewPrompt = useMemo(() => {
    if (!selectedTemplate) return ''
    return generateNewProcessPrompt(selectedTemplate, paramValues)
  }, [selectedTemplate, paramValues])

  // Copy prompt to clipboard
  const handleCopyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(previewPrompt)
      setCreationStatus('done')
      setTimeout(() => onClose(), 1000)
    } catch {
      setCreationError('Failed to copy to clipboard')
      setCreationStatus('error')
    }
  }, [previewPrompt, onClose])

  // Create process via agent
  const handleCreateProcess = useCallback(async () => {
    if (!selectedTemplate) return

    setCreationStatus('creating')
    setCreationError(null)

    try {
      const result = await createProcessViaAgent(
        selectedTemplate,
        paramValues,
        projectPath,
        agentSettings
      )

      if (result.success) {
        setCreationStatus('done')
        setTimeout(() => onClose(), 1500)
      } else {
        setCreationError(result.error || 'Unknown error')
        setCreationStatus('error')
      }
    } catch (err) {
      setCreationError(err instanceof Error ? err.message : 'Unknown error')
      setCreationStatus('error')
    }
  }, [selectedTemplate, paramValues, projectPath, agentSettings, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-background border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            {step !== 'select-template' && (
              <button
                onClick={handleBack}
                className="p-1 rounded-md hover:bg-surface transition-colors"
              >
                <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                {step === 'select-template' && 'New Process'}
                {step === 'fill-parameters' && 'Configure Parameters'}
                {step === 'review' && 'Review & Create'}
              </h2>
              <p className="text-xs text-text-muted">
                {step === 'select-template' && 'Select a template to start a new process'}
                {step === 'fill-parameters' && selectedTemplate?.metadata.title}
                {step === 'review' && selectedTemplate?.metadata.title}
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <StepDot active={step === 'select-template'} completed={step !== 'select-template'} label="1" />
              <div className="w-6 h-px bg-border" />
              <StepDot active={step === 'fill-parameters'} completed={step === 'review'} label="2" />
              <div className="w-6 h-px bg-border" />
              <StepDot active={step === 'review'} completed={false} label="3" />
            </div>
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {step === 'select-template' && (
            <TemplateSelectionStep
              templates={filteredTemplates}
              categories={categories}
              searchQuery={searchQuery}
              categoryFilter={categoryFilter}
              onSearchChange={setSearchQuery}
              onCategoryChange={setCategoryFilter}
              onSelect={handleSelectTemplate}
            />
          )}

          {step === 'fill-parameters' && selectedTemplate && (
            <div className="p-6">
              <ParameterForm
                parameters={selectedTemplate.parameters}
                values={paramValues}
                onChange={setParamValues}
                errors={validationErrors}
              />
            </div>
          )}

          {step === 'review' && selectedTemplate && (
            <ReviewStep
              template={selectedTemplate}
              params={paramValues}
              previewPrompt={previewPrompt}
              status={creationStatus}
              error={creationError}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {step === 'fill-parameters' && (
              <button
                onClick={handleProceedToReview}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-accent text-background hover:bg-accent/90 transition-colors"
              >
                Review
              </button>
            )}

            {step === 'review' && (
              <>
                <button
                  onClick={handleCopyToClipboard}
                  disabled={creationStatus === 'creating' || creationStatus === 'sending'}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface transition-colors disabled:opacity-50"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={handleCreateProcess}
                  disabled={creationStatus === 'creating' || creationStatus === 'sending' || creationStatus === 'done'}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-accent text-background hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {creationStatus === 'creating' && (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Starting Agent...
                    </>
                  )}
                  {creationStatus === 'sending' && (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  )}
                  {creationStatus === 'done' && (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Process Created
                    </>
                  )}
                  {(creationStatus === 'idle' || creationStatus === 'error') && 'Send to Agent'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

function StepDot({ active, completed, label }: { active: boolean; completed: boolean; label: string }) {
  return (
    <div className={`
      w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors
      ${active ? 'bg-accent text-background' : completed ? 'bg-accent/30 text-accent' : 'bg-surface text-text-muted'}
    `}>
      {completed && !active ? (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      ) : label}
    </div>
  )
}

// ============================================================================
// Template Selection Step
// ============================================================================

interface TemplateSelectionStepProps {
  templates: ProcessTemplate[]
  categories: string[]
  searchQuery: string
  categoryFilter: string | null
  onSearchChange: (query: string) => void
  onCategoryChange: (category: string | null) => void
  onSelect: (template: ProcessTemplate) => void
}

function TemplateSelectionStep({
  templates,
  categories,
  searchQuery,
  categoryFilter,
  onSearchChange,
  onCategoryChange,
  onSelect
}: TemplateSelectionStepProps) {
  return (
    <div className="flex h-full">
      {/* Category sidebar */}
      <div className="w-40 flex-shrink-0 border-r border-border p-3">
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange(null)}
            className={`w-full px-3 py-1.5 text-xs text-left rounded-md transition-colors ${
              categoryFilter === null
                ? 'bg-accent/20 text-accent font-medium'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            All Templates
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`w-full px-3 py-1.5 text-xs text-left rounded-md transition-colors ${
                categoryFilter === cat
                  ? 'bg-accent/20 text-accent font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface'
              }`}
            >
              {formatCategoryName(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Template list */}
      <div className="flex-1 flex flex-col">
        {/* Search bar */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>
        </div>

        {/* Template cards */}
        <div className="flex-1 overflow-y-auto p-3">
          {templates.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div>
                <p className="text-sm text-text-muted">
                  {searchQuery ? 'No templates match your search' : 'No templates found'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map(template => (
                <button
                  key={template.name}
                  onClick={() => onSelect(template)}
                  className="w-full text-left p-3 rounded-lg border border-border hover:border-accent/50 hover:bg-surface-elevated transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                          {template.metadata.title}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-surface text-text-muted flex-shrink-0">
                          {formatCategoryName(template.category)}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted line-clamp-2">{template.metadata.purposeAndUsage}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-text-muted">
                        <span>{template.steps.length} steps</span>
                        {template.parameters.required.length > 0 && (
                          <span>{template.parameters.required.length} required params</span>
                        )}
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-text-muted group-hover:text-accent mt-0.5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Review Step
// ============================================================================

interface ReviewStepProps {
  template: ProcessTemplate
  params: Record<string, string>
  previewPrompt: string
  status: CreationStatus
  error: string | null
}

function ReviewStep({ template, params, previewPrompt, status, error }: ReviewStepProps) {
  const filledParams = Object.entries(params).filter(([, v]) => v.trim() !== '')

  return (
    <div className="p-6 space-y-5">
      {/* Template summary */}
      <div>
        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Template</h4>
        <div className="p-3 bg-surface rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-text-primary">{template.metadata.title}</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-surface-elevated text-text-muted">
              {formatCategoryName(template.category)}
            </span>
          </div>
          <p className="text-xs text-text-muted">{template.steps.length} steps</p>
        </div>
      </div>

      {/* Parameters summary */}
      {filledParams.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Parameters</h4>
          <div className="space-y-1.5">
            {filledParams.map(([key, value]) => (
              <div key={key} className="flex items-start gap-2 p-2 bg-surface rounded-lg">
                <code className="text-xs font-mono text-accent flex-shrink-0">{key}</code>
                <span className="text-xs text-text-secondary break-all">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prompt preview */}
      <div>
        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Prompt Preview</h4>
        <pre className="p-3 bg-surface rounded-lg border border-border text-xs font-mono text-text-secondary whitespace-pre-wrap overflow-x-auto">
          {previewPrompt}
        </pre>
      </div>

      {/* Status messages */}
      {status === 'done' && (
        <div className="p-3 bg-status-completed/10 border border-status-completed/30 rounded-lg">
          <div className="flex items-center gap-2 text-status-completed text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Prompt sent to agent. The process will appear in the dashboard shortly.
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-status-failed/10 border border-status-failed/30 rounded-lg">
          <div className="flex items-center gap-2 text-status-failed text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
          <p className="text-xs text-text-muted mt-2">
            You can copy the prompt to clipboard and paste it into an agent session manually.
          </p>
        </div>
      )}
    </div>
  )
}
