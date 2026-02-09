import { useMemo } from 'react'
import type { ProcessTemplate } from '../../types'
import { filterByCategory, searchTemplates, formatCategoryName } from '../../services/templatesService'

interface ProcessTemplateListProps {
  templates: ProcessTemplate[]
  selectedCategory: string | null
  searchQuery: string
  selectedTemplate: ProcessTemplate | null
  onSelectTemplate: (template: ProcessTemplate) => void
  isFavorite: (name: string) => boolean
  onToggleFavorite: (name: string) => void
}

export function ProcessTemplateList({
  templates,
  selectedCategory,
  searchQuery,
  selectedTemplate,
  onSelectTemplate,
  isFavorite,
  onToggleFavorite
}: ProcessTemplateListProps) {
  // Filter and search templates
  const filteredTemplates = useMemo(() => {
    let result = filterByCategory(templates, selectedCategory)
    if (searchQuery) {
      result = searchTemplates(result, searchQuery)
    }
    // Sort: favorites first, then alphabetically within each group
    return result.sort((a, b) => {
      const aFav = isFavorite(a.name) ? 0 : 1
      const bFav = isFavorite(b.name) ? 0 : 1
      if (aFav !== bFav) return aFav - bFav
      return a.metadata.title.localeCompare(b.metadata.title)
    })
  }, [templates, selectedCategory, searchQuery, isFavorite])

  if (filteredTemplates.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-text-muted">
            {searchQuery 
              ? 'No templates match your search'
              : 'No process templates found'
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="grid gap-3">
        {filteredTemplates.map(template => (
          <TemplateCard
            key={template.name}
            template={template}
            isSelected={selectedTemplate?.name === template.name}
            isFavorite={isFavorite(template.name)}
            onToggleFavorite={() => onToggleFavorite(template.name)}
            onClick={() => onSelectTemplate(template)}
          />
        ))}
      </div>
    </div>
  )
}

interface TemplateCardProps {
  template: ProcessTemplate
  isSelected: boolean
  isFavorite: boolean
  onToggleFavorite: () => void
  onClick: () => void
}

function TemplateCard({ template, isSelected, isFavorite, onToggleFavorite, onClick }: TemplateCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-lg border transition-all
        ${isSelected 
          ? 'bg-accent/10 border-accent' 
          : 'bg-surface border-border hover:border-accent/50 hover:bg-surface-elevated'
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-sm font-medium truncate ${isSelected ? 'text-accent' : 'text-text-primary'}`}>
              {template.metadata.title}
            </h3>
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-surface-elevated text-text-muted flex-shrink-0">
              {formatCategoryName(template.category)}
            </span>
          </div>
          <p className="text-xs text-text-muted line-clamp-2 mb-2">
            {template.metadata.purposeAndUsage}
          </p>
          <div className="flex items-center gap-4 text-[10px] text-text-muted">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {template.steps.length} steps
            </span>
            {template.parameters.required.length > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {template.parameters.required.length} params
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {template.metadata.lastUpdated}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite() }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onToggleFavorite() } }}
            className="p-1 rounded hover:bg-surface-elevated transition-colors cursor-pointer"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? (
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
          <div className={`p-2 rounded-lg ${isSelected ? 'bg-accent/20' : 'bg-surface-elevated'}`}>
            <svg className={`w-4 h-4 ${isSelected ? 'text-accent' : 'text-text-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  )
}
