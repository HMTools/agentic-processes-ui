import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { TemplateCard } from './TemplateCard'
import type { MarketplaceTemplate, MarketplaceInfo } from '../../types'

interface TemplateCatalogProps {
  catalog: MarketplaceTemplate[]
  marketplaces: MarketplaceInfo[]
  loading: boolean
  installingTemplate: string | null
  onInstall: (template: MarketplaceTemplate) => void
  onUninstall: (template: MarketplaceTemplate) => void
}

export function TemplateCatalog({
  catalog,
  marketplaces,
  loading,
  installingTemplate,
  onInstall,
  onUninstall
}: TemplateCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'process' | 'step'>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null)

  const filteredCatalog = useMemo(() => {
    return catalog.filter(t => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchesSearch =
          t.name.toLowerCase().includes(q) ||
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q))
        if (!matchesSearch) return false
      }
      // Type filter
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      // Source filter
      if (sourceFilter !== 'all' && t.marketplace !== sourceFilter) return false
      return true
    })
  }, [catalog, searchQuery, typeFilter, sourceFilter])

  const resetFilters = useCallback(() => {
    setSearchQuery('')
    setTypeFilter('all')
    setSourceFilter('all')
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedTemplate(null)
  }, [])

  const hasFilters = searchQuery || typeFilter !== 'all' || sourceFilter !== 'all'

  return (
    <div>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as 'all' | 'process' | 'step')}
          className="px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
        >
          <option value="all">All Types</option>
          <option value="process">Process</option>
          <option value="step">Step</option>
        </select>

        {/* Source filter */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
        >
          <option value="all">All Sources</option>
          {marketplaces.map(m => (
            <option key={m.name} value={m.name}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Loading state */}
      {loading && catalog.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-text-muted">
          <svg className="w-8 h-8 animate-spin mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading templates from marketplaces...</span>
        </div>
      )}

      {/* Template grid */}
      {(!loading || catalog.length > 0) && (
        <>
          {filteredCatalog.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-muted">
              {hasFilters ? (
                <>
                  <svg className="w-8 h-8 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <p className="text-sm mb-3">No templates match your filters</p>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-xs font-medium text-accent hover:bg-accent/10 rounded-lg transition-colors"
                  >
                    Reset Filters
                  </button>
                </>
              ) : (
                <>
                  <svg className="w-8 h-8 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-sm">No templates found. Try refreshing your marketplaces.</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCatalog.map(template => {
                const templateKey = `${template.marketplace}/${template.category}/${template.name}`
                return (
                  <TemplateCard
                    key={templateKey}
                    template={template}
                    onInstall={onInstall}
                    onUninstall={onUninstall}
                    installing={installingTemplate === templateKey}
                    onClick={setSelectedTemplate}
                  />
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedTemplate && (
        <TemplateDetailModal
          template={selectedTemplate}
          onClose={handleCloseModal}
          onInstall={onInstall}
          onUninstall={onUninstall}
          installing={installingTemplate === `${selectedTemplate.marketplace}/${selectedTemplate.category}/${selectedTemplate.name}`}
        />
      )}
    </div>
  )
}

// Template Detail Modal
interface TemplateDetailModalProps {
  template: MarketplaceTemplate
  onClose: () => void
  onInstall: (template: MarketplaceTemplate) => void
  onUninstall: (template: MarketplaceTemplate) => void
  installing: boolean
}

function TemplateDetailModal({ template, onClose, onInstall, onUninstall, installing }: TemplateDetailModalProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
    >
      <div className="w-full max-w-lg mx-4 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-surface-elevated flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-text-primary truncate">
              {template.title || template.name}
            </h2>
            <p className="text-xs text-text-muted mt-0.5 font-mono">{template.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-surface transition-colors text-text-muted hover:text-text-primary ml-3 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {/* Description */}
          {template.description && (
            <div>
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Description</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{template.description}</p>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Type</h3>
              <span className="px-2 py-1 text-xs font-medium rounded bg-accent/10 text-accent border border-accent/20">
                {template.type}
              </span>
            </div>
            <div>
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Category</h3>
              <span className="px-2 py-1 text-xs rounded bg-surface-elevated text-text-primary border border-border">
                {template.category}
              </span>
            </div>
            <div>
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Marketplace</h3>
              <span className="text-sm text-text-secondary">{template.marketplace}</span>
            </div>
            <div>
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Status</h3>
              {template.installed ? (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs rounded bg-status-completed/10 text-status-completed border border-status-completed/20">
                    Installed
                  </span>
                  {template.updateAvailable && (
                    <span className="px-2 py-1 text-xs rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Update Available
                    </span>
                  )}
                </div>
              ) : (
                <span className="px-2 py-1 text-xs rounded bg-surface-elevated text-text-muted border border-border">
                  Not Installed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-border bg-surface-elevated flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-surface hover:bg-surface-elevated border border-border text-text-primary transition-colors"
          >
            Close
          </button>
          {template.installed ? (
            <>
              {template.updateAvailable && (
                <button
                  onClick={() => onInstall(template)}
                  disabled={installing}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    installing ? 'opacity-50 cursor-not-allowed' : 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
                  }`}
                >
                  {installing ? 'Updating...' : 'Update'}
                </button>
              )}
              <button
                onClick={() => onUninstall(template)}
                disabled={installing}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  installing ? 'opacity-50 cursor-not-allowed' : 'text-status-failed bg-status-failed/10 hover:bg-status-failed/20 border border-status-failed/30'
                }`}
              >
                {installing && !template.updateAvailable ? 'Removing...' : 'Uninstall'}
              </button>
            </>
          ) : (
            <button
              onClick={() => onInstall(template)}
              disabled={installing}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                installing ? 'opacity-50 cursor-not-allowed' : 'text-white bg-accent hover:bg-accent/90'
              }`}
            >
              {installing ? 'Installing...' : 'Install'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
