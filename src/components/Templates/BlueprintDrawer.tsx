import { useState, useCallback, useEffect } from 'react'
import type { StepTemplate } from '../../types'
import { StepTemplateList } from './StepTemplateList'
import { StepTemplateView } from './TemplateDetail'
import { formatCategoryName } from '../../services/templatesService'

interface BlueprintDrawerProps {
  open: boolean
  onClose: () => void
  stepTemplates: StepTemplate[]
  stepCategories: string[]
  isFavorite: (name: string) => boolean
  onToggleFavorite: (name: string) => void
}

export function BlueprintDrawer({ open, onClose, stepTemplates, stepCategories, isFavorite, onToggleFavorite }: BlueprintDrawerProps) {
  const [selectedStep, setSelectedStep] = useState<StepTemplate | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setSelectedStep(null)
      setSearchQuery('')
      setSelectedCategory(null)
    }
  }, [open])

  const handleSelectStep = useCallback((template: StepTemplate) => {
    setSelectedStep(prev => prev?.name === template.name ? null : template)
  }, [])

  const handleBack = useCallback(() => {
    setSelectedStep(null)
  }, [])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed right-0 top-0 h-full w-[520px] max-w-[90vw] bg-background border-l border-border z-50 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-accent/20">
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-text-primary">Step Blueprints</h2>
                <p className="text-xs text-text-muted">{stepTemplates.length} blueprints available</p>
              </div>
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

          {/* Search */}
          <div className="relative mb-3">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search blueprints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-2.5 py-1 text-xs rounded-full transition-colors ${
                selectedCategory === null
                  ? 'bg-accent text-background font-medium'
                  : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
              }`}
            >
              All
            </button>
            {stepCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-2.5 py-1 text-xs rounded-full transition-colors ${
                  selectedCategory === cat
                    ? 'bg-accent text-background font-medium'
                    : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                }`}
              >
                {formatCategoryName(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {selectedStep ? (
            <div className="flex-1 overflow-y-auto">
              {/* Back button */}
              <div className="sticky top-0 bg-background border-b border-border px-4 py-2 z-10">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to list
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm font-semibold text-text-primary">{selectedStep.metadata.title}</h3>
                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-surface-elevated text-text-muted">
                    {formatCategoryName(selectedStep.category)}
                  </span>
                </div>
                <StepTemplateView template={selectedStep} />
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <StepTemplateList
                templates={stepTemplates}
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
                selectedTemplate={null}
                onSelectTemplate={handleSelectStep}
                isFavorite={isFavorite}
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
