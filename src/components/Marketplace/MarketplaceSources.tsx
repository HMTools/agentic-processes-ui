import { useState, useCallback } from 'react'
import { Toggle } from '../ui/Toggle'
import { ConfirmationModal } from '../ConfirmationModal'
import type { MarketplaceInfo } from '../../types'

interface AddFormState {
  name: string
  url: string
  branch: string
  priority: string
}

const EMPTY_FORM: AddFormState = { name: '', url: '', branch: 'main', priority: '100' }

interface MarketplaceSourcesProps {
  marketplaces: MarketplaceInfo[]
  onMarketplacesChanged: () => void
  refreshing: string | null
  onRefresh: (name?: string) => void
}

export function MarketplaceSources({
  marketplaces,
  onMarketplacesChanged,
  refreshing,
  onRefresh
}: MarketplaceSourcesProps) {
  const [expanded, setExpanded] = useState(false)

  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<AddFormState>(EMPTY_FORM)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const [editingMarketplace, setEditingMarketplace] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<AddFormState>(EMPTY_FORM)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const [removeTarget, setRemoveTarget] = useState<string | null>(null)
  const [removeLoading, setRemoveLoading] = useState(false)

  const handleToggle = useCallback(async (name: string) => {
    if (!window.electronAPI?.marketplaceToggle) return
    const result = await window.electronAPI.marketplaceToggle(name)
    if (result.success) {
      onMarketplacesChanged()
    }
  }, [onMarketplacesChanged])

  const handleAdd = useCallback(async () => {
    setAddError(null)
    const trimmedName = addForm.name.trim()
    const trimmedUrl = addForm.url.trim()
    if (!trimmedName) { setAddError('Name is required'); return }
    if (!trimmedUrl) { setAddError('URL is required'); return }
    if (marketplaces.some(m => m.name === trimmedName)) { setAddError('A marketplace with this name already exists'); return }
    const priority = parseInt(addForm.priority, 10)
    if (isNaN(priority) || priority < 1) { setAddError('Priority must be a positive number'); return }

    if (!window.electronAPI?.marketplaceAdd) return
    setAddLoading(true)
    const result = await window.electronAPI.marketplaceAdd(
      trimmedName, trimmedUrl, addForm.branch.trim() || 'main', priority
    )
    if (result.success) {
      setShowAddForm(false)
      setAddForm(EMPTY_FORM)
      onMarketplacesChanged()
    } else {
      setAddError(result.error || 'Failed to add marketplace')
    }
    setAddLoading(false)
  }, [addForm, marketplaces, onMarketplacesChanged])

  const handleRemove = useCallback(async () => {
    if (!removeTarget || !window.electronAPI?.marketplaceRemove) return
    setRemoveLoading(true)
    const result = await window.electronAPI.marketplaceRemove(removeTarget)
    if (result.success) {
      setRemoveTarget(null)
      onMarketplacesChanged()
    }
    setRemoveLoading(false)
  }, [removeTarget, onMarketplacesChanged])

  const handleStartEdit = useCallback((marketplace: MarketplaceInfo) => {
    setShowAddForm(false)
    setAddError(null)
    setEditingMarketplace(marketplace.name)
    setEditForm({
      name: marketplace.name,
      url: marketplace.url,
      branch: marketplace.branch,
      priority: String(marketplace.priority),
    })
    setEditError(null)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingMarketplace(null)
    setEditForm(EMPTY_FORM)
    setEditError(null)
  }, [])

  const handleSaveEdit = useCallback(async () => {
    if (!editingMarketplace) return
    setEditError(null)

    const trimmedName = editForm.name.trim()
    const trimmedUrl = editForm.url.trim()
    if (!trimmedName) { setEditError('Name is required'); return }
    if (!trimmedUrl) { setEditError('URL is required'); return }
    if (trimmedName !== editingMarketplace && marketplaces.some(m => m.name === trimmedName)) {
      setEditError('A marketplace with this name already exists'); return
    }
    const priority = parseInt(editForm.priority, 10)
    if (isNaN(priority) || priority < 1) { setEditError('Priority must be a positive number'); return }

    if (!window.electronAPI?.marketplaceUpdate) return

    setEditLoading(true)
    const updates: { newName?: string; url?: string; branch?: string; priority?: number } = {}
    if (trimmedName !== editingMarketplace) updates.newName = trimmedName
    updates.url = trimmedUrl
    updates.branch = editForm.branch.trim() || 'main'
    updates.priority = priority

    const result = await window.electronAPI.marketplaceUpdate(editingMarketplace, updates)
    if (result.success) {
      setEditingMarketplace(null)
      setEditForm(EMPTY_FORM)
      onMarketplacesChanged()
    } else {
      setEditError(result.error || 'Failed to update marketplace')
    }
    setEditLoading(false)
  }, [editingMarketplace, editForm, marketplaces, onMarketplacesChanged])

  const formatLastSynced = (iso?: string) => {
    if (!iso) return 'Never'
    try {
      const d = new Date(iso)
      const now = new Date()
      const diffMs = now.getTime() - d.getTime()
      const diffMin = Math.floor(diffMs / 60000)
      if (diffMin < 1) return 'Just now'
      if (diffMin < 60) return `${diffMin}m ago`
      const diffHr = Math.floor(diffMin / 60)
      if (diffHr < 24) return `${diffHr}h ago`
      return d.toLocaleDateString()
    } catch { return 'Unknown' }
  }

  return (
    <section className="bg-surface rounded-lg border border-border overflow-hidden">
      {/* Collapsible Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-surface-elevated/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg className={`w-4 h-4 text-text-muted transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="p-2 rounded-lg bg-accent/20">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <div className="text-left">
            <h2 className="text-sm font-semibold text-text-primary">Marketplace Sources</h2>
            <p className="text-xs text-text-muted">{marketplaces.length} source{marketplaces.length !== 1 ? 's' : ''} configured</p>
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => { e.stopPropagation(); onRefresh() }}
            disabled={refreshing !== null}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              refreshing ? 'opacity-50 cursor-not-allowed text-text-muted' : 'text-accent hover:bg-accent/10'
            }`}
          >
            <svg className={`w-3.5 h-3.5 ${refreshing === '__all__' ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing === '__all__' ? 'Refreshing...' : 'Refresh All'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(true); setShowAddForm(!showAddForm); setAddError(null); setEditingMarketplace(null); setEditError(null) }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-accent hover:bg-accent/10 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add
          </button>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-border p-4 space-y-3">
          {/* Add Marketplace Form */}
          {showAddForm && (
            <div className="p-4 rounded-lg border border-accent/30 bg-accent/5 space-y-3">
              <h3 className="text-sm font-medium text-text-primary">Add Marketplace</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Name *</label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="my-templates"
                    className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Branch</label>
                  <input
                    type="text"
                    value={addForm.branch}
                    onChange={e => setAddForm(f => ({ ...f, branch: e.target.value }))}
                    placeholder="main"
                    className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-text-muted block mb-1">Git URL *</label>
                  <input
                    type="text"
                    value={addForm.url}
                    onChange={e => setAddForm(f => ({ ...f, url: e.target.value }))}
                    placeholder="https://github.com/org/templates.git"
                    className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg text-text-primary font-mono text-xs focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Priority</label>
                  <input
                    type="number"
                    value={addForm.priority}
                    onChange={e => setAddForm(f => ({ ...f, priority: e.target.value }))}
                    min="1"
                    className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  />
                  <p className="text-[10px] text-text-muted mt-0.5">Lower number = higher priority</p>
                </div>
              </div>
              {addError && (
                <div className="px-3 py-2 text-xs text-status-failed bg-status-failed/10 border border-status-failed/20 rounded-lg">
                  {addError}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setShowAddForm(false); setAddForm(EMPTY_FORM); setAddError(null) }}
                  className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={addLoading}
                  className={`px-4 py-1.5 text-xs font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors ${
                    addLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {addLoading ? 'Adding...' : 'Add Marketplace'}
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {marketplaces.length === 0 && (
            <div className="px-3 py-8 text-sm text-center text-text-muted bg-background border border-border rounded-lg">
              No marketplaces configured. Add a git repository to get started.
            </div>
          )}

          {/* Marketplace list */}
          {marketplaces.map(marketplace => (
            editingMarketplace === marketplace.name ? (
              <div key={marketplace.name} className="p-4 rounded-lg border border-accent/30 bg-accent/5 space-y-3">
                <h3 className="text-sm font-medium text-text-primary">Edit Marketplace</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Name *</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="my-templates"
                      className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Branch</label>
                    <input
                      type="text"
                      value={editForm.branch}
                      onChange={e => setEditForm(f => ({ ...f, branch: e.target.value }))}
                      placeholder="main"
                      className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-text-muted block mb-1">Git URL *</label>
                    <input
                      type="text"
                      value={editForm.url}
                      onChange={e => setEditForm(f => ({ ...f, url: e.target.value }))}
                      placeholder="https://github.com/org/templates.git"
                      className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg text-text-primary font-mono text-xs focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Priority</label>
                    <input
                      type="number"
                      value={editForm.priority}
                      onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))}
                      min="1"
                      className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
                    />
                    <p className="text-[10px] text-text-muted mt-0.5">Lower number = higher priority</p>
                  </div>
                </div>
                {editError && (
                  <div className="px-3 py-2 text-xs text-status-failed bg-status-failed/10 border border-status-failed/20 rounded-lg">
                    {editError}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={editLoading}
                    className={`px-4 py-1.5 text-xs font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors ${
                      editLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div key={marketplace.name} className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-text-primary">{marketplace.name}</span>
                      <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-surface-elevated text-text-muted border border-border">
                        {marketplace.branch}
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-surface-elevated text-text-muted border border-border">
                        p:{marketplace.priority}
                      </span>
                      {marketplace.cached && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-status-completed/10 text-status-completed border border-status-completed/20">
                          cached
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted font-mono truncate" title={marketplace.url}>
                      {marketplace.url}
                    </p>
                    <p className="text-[10px] text-text-muted mt-1">
                      Last refreshed: {formatLastSynced(marketplace.lastSynced)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Toggle
                      id={`marketplace-toggle-${marketplace.name}`}
                      checked={marketplace.enabled}
                      onChange={() => handleToggle(marketplace.name)}
                    />
                    <button
                      onClick={() => handleStartEdit(marketplace)}
                      disabled={refreshing !== null}
                      title="Edit"
                      className={`p-1.5 rounded-md transition-colors ${
                        refreshing ? 'opacity-50 cursor-not-allowed' : 'text-text-muted hover:text-accent hover:bg-accent/10'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onRefresh(marketplace.name)}
                      disabled={refreshing !== null}
                      title="Refresh"
                      className={`p-1.5 rounded-md transition-colors ${
                        refreshing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface text-text-muted hover:text-accent'
                      }`}
                    >
                      <svg className={`w-4 h-4 ${refreshing === marketplace.name ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setRemoveTarget(marketplace.name)}
                      title="Remove"
                      className="p-1.5 rounded-md text-text-muted hover:text-status-failed hover:bg-status-failed/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={removeTarget !== null}
        title="Remove Marketplace"
        message={`Are you sure you want to remove "${removeTarget}"? This will also delete its cached files. Installed templates from this marketplace will remain.`}
        confirmLabel="Remove"
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
        variant="danger"
        loading={removeLoading}
      />
    </section>
  )
}
