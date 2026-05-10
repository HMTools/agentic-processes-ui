import { useState, useCallback, useMemo } from 'react'
import { useTemplates } from '../../hooks/useTemplates'
import { useFavoriteTemplates } from '../../hooks/useFavoriteTemplates'
import type { ProcessTemplate, StepTemplate } from '../../types'
import { ProcessTemplateList } from './ProcessTemplateList'
import { StepTemplateList } from './StepTemplateList'
import { TemplateDetail } from './TemplateDetail'

const FAVORITES_FILTER = '__favorites__'

interface TemplatesProps {
  /** @deprecated No longer used -- templates load from ~/.claude/agentic-processes/ */
  frameworkPath: string | null
  /** Project folder paths (kept for API compat) */
  projectPaths: string[]
  onBack: () => void
  onUseTemplate?: (template: ProcessTemplate) => void
}

type TabType = 'process' | 'step'

export function Templates({ frameworkPath, projectPaths, onBack, onUseTemplate }: TemplatesProps) {
  const {
    processTemplates,
    stepTemplates,
    processCategories,
    stepCategories,
    isLoading,
    error,
    loadTemplates
  } = useTemplates(frameworkPath, projectPaths)

  const { isFavorite, toggleFavorite, countFavorites } = useFavoriteTemplates()

  const [activeTab, setActiveTab] = useState<TabType>('process')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessTemplate | StepTemplate | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab)
    setSelectedCategory(null)
    setSelectedTemplate(null)
    setSearchQuery('')
  }, [])

  const handleSelectTemplate = useCallback((template: ProcessTemplate | StepTemplate) => {
    setSelectedTemplate(template)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setSelectedTemplate(null)
  }, [])

  // Wrap isFavorite / toggleFavorite for the active tab type
  const isTemplateFavorite = useCallback((name: string) => {
    return isFavorite(activeTab, name)
  }, [isFavorite, activeTab])

  const handleToggleFavorite = useCallback((name: string) => {
    toggleFavorite(activeTab, name)
  }, [toggleFavorite, activeTab])

  const categories = activeTab === 'process' ? processCategories : stepCategories
  const templateCount = activeTab === 'process' ? processTemplates.length : stepTemplates.length
  const favoritesCount = countFavorites(activeTab)

  // When the favorites filter is active, pre-filter templates to only favorites
  const showingFavorites = selectedCategory === FAVORITES_FILTER

  const displayedProcessTemplates = useMemo(() => {
    if (!showingFavorites) return processTemplates
    return processTemplates.filter(t => isFavorite('process', t.name))
  }, [processTemplates, showingFavorites, isFavorite])

  const displayedStepTemplates = useMemo(() => {
    if (!showingFavorites) return stepTemplates
    return stepTemplates.filter(t => isFavorite('step', t.name))
  }, [stepTemplates, showingFavorites, isFavorite])

  // Pass null as category to list components when showing favorites (already pre-filtered)
  const listCategory = showingFavorites ? null : selectedCategory

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-md hover:bg-surface transition-colors"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-text-primary">Templates</h1>
              <p className="text-xs text-text-muted">
                Browse and manage process and step templates
              </p>
            </div>
          </div>
          
          {/* Refresh button */}
          <button
            onClick={loadTemplates}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-surface transition-colors disabled:opacity-50"
            title="Refresh templates"
          >
            <svg 
              className={`w-5 h-5 text-text-secondary ${isLoading ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 bg-surface rounded-lg p-1">
          <TabButton
            active={activeTab === 'process'}
            onClick={() => handleTabChange('process')}
            count={processTemplates.length}
          >
            Process Templates
          </TabButton>
          <TabButton
            active={activeTab === 'step'}
            onClick={() => handleTabChange('step')}
            count={stepTemplates.length}
          >
            Step Templates
          </TabButton>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {error ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-12 h-12 rounded-full bg-status-failed/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-status-failed" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-text-primary mb-2">Error Loading Templates</h3>
              <p className="text-xs text-text-muted mb-4">{error}</p>
              <button
                onClick={loadTemplates}
                className="px-4 py-2 text-sm bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : templateCount === 0 && !isLoading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-text-primary mb-2">No Templates Found</h3>
              <p className="text-xs text-text-muted">
                Run the install script to copy templates to ~/.claude/agentic-processes/
              </p>
            </div>
          </div>
        ) : isLoading && templateCount === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3 text-text-muted">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm">Loading templates...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Sidebar with categories */}
            <div className="w-48 flex-shrink-0 border-r border-border overflow-y-auto">
              <div className="p-3">
                {/* Search */}
                <div className="relative mb-3">
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                  />
                </div>

                {/* Categories */}
                <div className="space-y-1">
                  {favoritesCount > 0 && (
                    <CategoryButton
                      active={selectedCategory === FAVORITES_FILTER}
                      onClick={() => setSelectedCategory(FAVORITES_FILTER)}
                      icon={
                        <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      }
                    >
                      Favorites ({favoritesCount})
                    </CategoryButton>
                  )}
                  <CategoryButton
                    active={selectedCategory === null}
                    onClick={() => setSelectedCategory(null)}
                  >
                    All ({templateCount})
                  </CategoryButton>
                  {categories.map(category => (
                    <CategoryButton
                      key={category}
                      active={selectedCategory === category}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {formatCategoryName(category)}
                    </CategoryButton>
                  ))}
                </div>
              </div>
            </div>

            {/* Template list */}
            <div className="flex-1 overflow-hidden flex">
              <div className={`flex-1 overflow-y-auto ${selectedTemplate ? 'w-1/2' : 'w-full'}`}>
                {activeTab === 'process' ? (
                  <ProcessTemplateList
                    templates={displayedProcessTemplates}
                    selectedCategory={listCategory}
                    searchQuery={searchQuery}
                    selectedTemplate={selectedTemplate as ProcessTemplate | null}
                    onSelectTemplate={handleSelectTemplate}
                    isFavorite={isTemplateFavorite}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ) : (
                  <StepTemplateList
                    templates={displayedStepTemplates}
                    selectedCategory={listCategory}
                    searchQuery={searchQuery}
                    selectedTemplate={selectedTemplate as StepTemplate | null}
                    onSelectTemplate={handleSelectTemplate}
                    isFavorite={isTemplateFavorite}
                    onToggleFavorite={handleToggleFavorite}
                  />
                )}
              </div>

              {/* Detail panel */}
              {selectedTemplate && (
                <div className="w-1/2 border-l border-border overflow-hidden">
                  <TemplateDetail
                    template={selectedTemplate}
                    templateType={activeTab}
                    onClose={handleCloseDetail}
                    onUseTemplate={onUseTemplate}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Tab button component
interface TabButtonProps {
  active: boolean
  onClick: () => void
  count: number
  children: React.ReactNode
}

function TabButton({ active, onClick, count, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors
        ${active 
          ? 'bg-accent text-background' 
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
        }
      `}
    >
      {children}
      <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
        active ? 'bg-background/20' : 'bg-surface-elevated'
      }`}>
        {count}
      </span>
    </button>
  )
}

// Category button component
interface CategoryButtonProps {
  active: boolean
  onClick: () => void
  icon?: React.ReactNode
  children: React.ReactNode
}

function CategoryButton({ active, onClick, icon, children }: CategoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full px-3 py-1.5 text-xs text-left rounded-md transition-colors flex items-center gap-1.5
        ${active 
          ? 'bg-accent/20 text-accent font-medium' 
          : 'text-text-secondary hover:text-text-primary hover:bg-surface'
        }
      `}
    >
      {icon}
      {children}
    </button>
  )
}

// Helper function to format category names
function formatCategoryName(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
