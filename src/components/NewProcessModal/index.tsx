import { useState, useCallback, useMemo, useEffect } from 'react'
import type { ProcessTemplate, AgentSettings } from '../../types'
import {
  generateNewProcessCommand,
  createProcessViaAgentWithPrompt
} from '../../services/processCreationService'
import { filterByCategory, searchTemplates, formatCategoryName } from '../../services/templatesService'
import { useFavoriteTemplates } from '../../hooks/useFavoriteTemplates'

const FAVORITES_FILTER = '__favorites__'

type ModalStep = 'select-template' | 'select-project' | 'write-prompt'
type CreationStatus = 'idle' | 'creating' | 'sending' | 'done' | 'error'

interface NewProcessModalProps {
  isOpen: boolean
  onClose: () => void
  templates: ProcessTemplate[]
  /** Array of project paths where processes can be created */
  projectPaths: string[]
  agentSettings: AgentSettings
  /** Pre-selected template (e.g. from Templates page "Use Template" button) */
  preSelectedTemplate?: ProcessTemplate | null
}

export function NewProcessModal({
  isOpen,
  onClose,
  templates,
  projectPaths,
  agentSettings,
  preSelectedTemplate
}: NewProcessModalProps) {
  // Step management - skip project selection if only one project
  const needsProjectSelection = projectPaths.length > 1

  const [step, setStep] = useState<ModalStep>(
    preSelectedTemplate ? (needsProjectSelection ? 'select-project' : 'write-prompt') : 'select-template'
  )

  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessTemplate | null>(
    preSelectedTemplate || null
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  // Project selection (for multi-project workspaces)
  const [selectedProjectPath, setSelectedProjectPath] = useState<string>(
    projectPaths.length === 1 ? projectPaths[0] : ''
  )

  // Prompt text
  const [promptText, setPromptText] = useState<string>('')

  // Creation state
  const [creationStatus, setCreationStatus] = useState<CreationStatus>('idle')
  const [creationError, setCreationError] = useState<string | null>(null)

  // Reset state when modal opens/closes or preSelectedTemplate changes
  useEffect(() => {
    if (isOpen) {
      if (preSelectedTemplate) {
        setSelectedTemplate(preSelectedTemplate)
        setStep(needsProjectSelection ? 'select-project' : 'write-prompt')
      } else {
        setSelectedTemplate(null)
        setStep('select-template')
      }
      setSearchQuery('')
      setCategoryFilter(null)
      // Auto-select if only one project
      setSelectedProjectPath(projectPaths.length === 1 ? projectPaths[0] : '')
      setPromptText('')
      setCreationStatus('idle')
      setCreationError(null)
    }
  }, [isOpen, preSelectedTemplate, needsProjectSelection, projectPaths])

  // Categories from available templates
  const categories = useMemo(() => {
    const cats = new Set(templates.map(t => t.category))
    return Array.from(cats).sort()
  }, [templates])

  const { isFavorite, toggleFavorite, countFavorites } = useFavoriteTemplates()
  const favoritesCount = countFavorites('process')

  // When favorites filter is active, pre-filter to only favorites
  const showingFavorites = categoryFilter === FAVORITES_FILTER
  const effectiveCategoryFilter = showingFavorites ? null : categoryFilter

  // Filtered templates - favorites sorted to top
  const filteredTemplates = useMemo(() => {
    let source = templates
    if (showingFavorites) {
      source = templates.filter(t => isFavorite('process', t.name))
    }
    let result = filterByCategory(source, effectiveCategoryFilter)
    if (searchQuery) {
      result = searchTemplates(result, searchQuery)
    }
    return result.sort((a, b) => {
      const aFav = isFavorite('process', a.name) ? 0 : 1
      const bFav = isFavorite('process', b.name) ? 0 : 1
      if (aFav !== bFav) return aFav - bFav
      return a.metadata.title.localeCompare(b.metadata.title)
    })
  }, [templates, effectiveCategoryFilter, searchQuery, isFavorite, showingFavorites])

  // Select a template and move to next step
  const handleSelectTemplate = useCallback((template: ProcessTemplate) => {
    setSelectedTemplate(template)
    setPromptText('')
    // If multiple projects, go to project selection; otherwise straight to prompt
    setStep(needsProjectSelection ? 'select-project' : 'write-prompt')
  }, [needsProjectSelection])

  // Select a project and move to prompt step
  const handleSelectProject = useCallback((path: string) => {
    setSelectedProjectPath(path)
    setStep('write-prompt')
  }, [])

  // Go back one step
  const handleBack = useCallback(() => {
    if (step === 'write-prompt') {
      if (needsProjectSelection) {
        setStep('select-project')
      } else if (preSelectedTemplate) {
        onClose()
      } else {
        setStep('select-template')
      }
    } else if (step === 'select-project') {
      if (preSelectedTemplate) {
        onClose()
      } else {
        setStep('select-template')
      }
    }
  }, [step, preSelectedTemplate, onClose, needsProjectSelection])

  // Generate preview command
  const previewCommand = useMemo(() => {
    if (!selectedTemplate || !promptText.trim()) return ''
    return generateNewProcessCommand(selectedTemplate, promptText)
  }, [selectedTemplate, promptText])

  // Create process via agent
  const handleCreateProcess = useCallback(async () => {
    if (!selectedTemplate || !promptText.trim() || !selectedProjectPath) return

    setCreationStatus('creating')
    setCreationError(null)

    try {
      const result = await createProcessViaAgentWithPrompt(
        selectedTemplate,
        promptText,
        selectedProjectPath,
        agentSettings
      )

      if (result.success) {
        setCreationStatus('done')
        // Don't auto-close - let user manually close
        // They can watch the agent terminal that was opened
      } else {
        setCreationError(result.error || 'Unknown error')
        setCreationStatus('error')
      }
    } catch (err) {
      setCreationError(err instanceof Error ? err.message : 'Unknown error')
      setCreationStatus('error')
    }
  }, [selectedTemplate, promptText, selectedProjectPath, agentSettings])

  // No projects configured
  if (!isOpen) return null

  if (projectPaths.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-md bg-background border border-border rounded-xl shadow-2xl p-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-status-paused/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-status-paused" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No Project Folder</h3>
            <p className="text-sm text-text-muted mb-6">
              Add a project folder first to create processes. The project folder should contain (or will have)
              processes will be created in <code className="px-1 py-0.5 bg-surface rounded text-accent font-mono text-xs">~/.claude/agentic-processes/</code>.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-accent text-background hover:bg-accent/90 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Compute total steps for indicator
  const totalSteps = needsProjectSelection ? 3 : 2
  const currentStepNum = step === 'select-template' ? 1 : step === 'select-project' ? 2 : (needsProjectSelection ? 3 : 2)

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
                {step === 'select-project' && 'Select Project'}
                {step === 'write-prompt' && 'Describe What You Want'}
              </h2>
              <p className="text-xs text-text-muted">
                {step === 'select-template' && 'Select a template to start a new process'}
                {step === 'select-project' && 'Choose which project to create the process in'}
                {step === 'write-prompt' && selectedTemplate?.metadata.title}
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <StepDot active={step === 'select-template'} completed={currentStepNum > 1} label="1" />
              <div className="w-6 h-px bg-border" />
              {needsProjectSelection && (
                <>
                  <StepDot active={step === 'select-project'} completed={currentStepNum > 2} label="2" />
                  <div className="w-6 h-px bg-border" />
                </>
              )}
              <StepDot active={step === 'write-prompt'} completed={false} label={String(totalSteps)} />
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
              isFavorite={(name: string) => isFavorite('process', name)}
              onToggleFavorite={(name: string) => toggleFavorite('process', name)}
              favoritesCount={favoritesCount}
            />
          )}

          {step === 'select-project' && (
            <ProjectSelectionStep
              projectPaths={projectPaths}
              selectedPath={selectedProjectPath}
              onSelect={handleSelectProject}
            />
          )}

          {step === 'write-prompt' && selectedTemplate && (
            <PromptStep
              template={selectedTemplate}
              promptText={promptText}
              onPromptChange={setPromptText}
              previewCommand={previewCommand}
              status={creationStatus}
              error={creationError}
              selectedProjectPath={selectedProjectPath}
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
            {step === 'write-prompt' && (
              <button
                onClick={handleCreateProcess}
                disabled={!promptText.trim() || !selectedProjectPath || creationStatus === 'creating' || creationStatus === 'sending' || creationStatus === 'done'}
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
  isFavorite: (name: string) => boolean
  onToggleFavorite: (name: string) => void
  favoritesCount: number
}

function TemplateSelectionStep({
  templates,
  categories,
  searchQuery,
  categoryFilter,
  onSearchChange,
  onCategoryChange,
  onSelect,
  isFavorite,
  onToggleFavorite,
  favoritesCount
}: TemplateSelectionStepProps) {
  return (
    <div className="flex h-full">
      {/* Category sidebar */}
      <div className="w-40 flex-shrink-0 border-r border-border p-3">
        <div className="space-y-1">
          {favoritesCount > 0 && (
            <button
              onClick={() => onCategoryChange(FAVORITES_FILTER)}
              className={`w-full px-3 py-1.5 text-xs text-left rounded-md transition-colors flex items-center gap-1.5 ${
                categoryFilter === FAVORITES_FILTER
                  ? 'bg-accent/20 text-accent font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface'
              }`}
            >
              <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Favorites ({favoritesCount})
            </button>
          )}
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
                    <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(template.name) }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onToggleFavorite(template.name) } }}
                        className="p-1 rounded hover:bg-surface transition-colors cursor-pointer"
                        title={isFavorite(template.name) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {isFavorite(template.name) ? (
                          <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-text-muted hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        )}
                      </div>
                      <svg className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
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
// Project Selection Step (for multi-project workspaces)
// ============================================================================

interface ProjectSelectionStepProps {
  projectPaths: string[]
  selectedPath: string
  onSelect: (path: string) => void
}

function ProjectSelectionStep({ projectPaths, selectedPath, onSelect }: ProjectSelectionStepProps) {
  // Extract folder name from path
  const getFolderName = (path: string) => {
    const parts = path.replace(/\\/g, '/').split('/')
    return parts[parts.length - 1] || path
  }

  return (
    <div className="p-6">
      <p className="text-sm text-text-muted mb-4">
        Select which project folder to create the process in:
      </p>
      <div className="space-y-2">
        {projectPaths.map((path) => (
          <button
            key={path}
            onClick={() => onSelect(path)}
            className={`
              w-full text-left p-4 rounded-lg border transition-all group
              ${selectedPath === path 
                ? 'border-accent bg-accent/10' 
                : 'border-border hover:border-accent/50 hover:bg-surface-elevated'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`
                p-2 rounded-lg transition-colors
                ${selectedPath === path ? 'bg-accent/20 text-accent' : 'bg-surface text-text-muted group-hover:text-text-primary'}
              `}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${selectedPath === path ? 'text-accent' : 'text-text-primary'}`}>
                  {getFolderName(path)}
                </div>
                <div className="text-xs text-text-muted truncate">{path}</div>
              </div>
              {selectedPath === path && (
                <svg className="w-5 h-5 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Prompt Step
// ============================================================================

interface PromptStepProps {
  template: ProcessTemplate
  promptText: string
  onPromptChange: (text: string) => void
  previewCommand: string
  status: CreationStatus
  error: string | null
  selectedProjectPath: string
}

function PromptStep({ template, promptText, onPromptChange, previewCommand, status, error, selectedProjectPath }: PromptStepProps) {
  // Extract folder name from path
  const getFolderName = (path: string) => {
    const parts = path.replace(/\\/g, '/').split('/')
    return parts[parts.length - 1] || path
  }

  return (
    <div className="p-6 space-y-5">
      {/* Template info */}
      <div>
        <div className="p-3 bg-surface rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-text-primary">{template.metadata.title}</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-surface-elevated text-text-muted">
              {formatCategoryName(template.category)}
            </span>
          </div>
          <p className="text-xs text-text-muted">{template.metadata.purposeAndUsage}</p>
        </div>
      </div>

      {/* Selected project indicator */}
      {selectedProjectPath && (
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span>Creating in: <span className="text-text-secondary font-medium">{getFolderName(selectedProjectPath)}</span></span>
        </div>
      )}

      {/* Prompt textarea */}
      <div>
        <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wide mb-2">
          Describe What You Want
        </h4>
        <p className="text-xs text-text-muted mb-3">
          Describe the process you want to create. The agent will extract parameters from your description.
        </p>
        <textarea
          value={promptText}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="e.g. Create a new authentication flow with JWT tokens, including login and registration endpoints..."
          className="w-full h-48 px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
          autoFocus
        />
      </div>

      {/* Command preview */}
      {previewCommand && (
        <div>
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Command Preview</h4>
          <pre className="p-3 bg-surface rounded-lg border border-border text-xs font-mono text-text-secondary whitespace-pre-wrap overflow-x-auto">
            {previewCommand}
          </pre>
        </div>
      )}

      {/* Status messages */}
      {status === 'done' && (
        <div className="p-3 bg-status-completed/10 border border-status-completed/30 rounded-lg">
          <div className="flex items-center gap-2 text-status-completed text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Command sent to agent successfully!
          </div>
          <p className="text-xs text-text-muted mt-2">
            A terminal window has opened showing the agent's progress. 
            You can close this dialog and check the Processes or Agent Sessions tabs.
          </p>
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
        </div>
      )}
    </div>
  )
}
