import { useState, useEffect, useCallback } from 'react'
import { Toggle } from './index'
import { ConfirmationModal } from '../ConfirmationModal'
import type { TemplateSourceInfo } from '../../types'

interface AddFormState {
  name: string
  url: string
  branch: string
  priority: string
}

const EMPTY_FORM: AddFormState = { name: '', url: '', branch: 'main', priority: '100' }

export function TemplateSourcesSection() {
  const [sources, setSources] = useState<TemplateSourceInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [syncing, setSyncing] = useState<string | null>(null)
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<AddFormState>(EMPTY_FORM)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const [removeTarget, setRemoveTarget] = useState<string | null>(null)
  const [removeLoading, setRemoveLoading] = useState(false)

  const loadSources = useCallback(async () => {
    if (!window.electronAPI?.templateSourcesList) return
    const result = await window.electronAPI.templateSourcesList()
    if (result.success && result.data) {
      const data = result.data as { sources: TemplateSourceInfo[] }
      setSources(data.sources || [])
      setError(null)
    } else {
      setError(result.error || 'Failed to load template sources')
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadSources() }, [loadSources])

  const handleSync = async (sourceName?: string) => {
    if (!window.electronAPI?.templateSourcesSync) return
    setSyncing(sourceName || '__all__')
    setSyncFeedback(null)
    const result = await window.electronAPI.templateSourcesSync(sourceName)
    if (result.success) {
      const data = result.data as { totalProcessTemplates: number; totalStepTemplates: number }
      setSyncFeedback({
        type: 'success',
        message: `Synced successfully. ${data.totalProcessTemplates} process templates, ${data.totalStepTemplates} step templates available.`
      })
      await loadSources()
    } else {
      setSyncFeedback({ type: 'error', message: result.error || 'Sync failed' })
    }
    setSyncing(null)
  }

  const handleToggle = async (name: string) => {
    if (!window.electronAPI?.templateSourcesToggle) return
    const result = await window.electronAPI.templateSourcesToggle(name)
    if (result.success) {
      await loadSources()
    }
  }

  const handleAdd = async () => {
    setAddError(null)
    const trimmedName = addForm.name.trim()
    const trimmedUrl = addForm.url.trim()
    if (!trimmedName) { setAddError('Name is required'); return }
    if (!trimmedUrl) { setAddError('URL is required'); return }
    if (sources.some(s => s.name === trimmedName)) { setAddError('A source with this name already exists'); return }
    const priority = parseInt(addForm.priority, 10)
    if (isNaN(priority) || priority < 1) { setAddError('Priority must be a positive number'); return }

    if (!window.electronAPI?.templateSourcesAdd) return
    setAddLoading(true)
    const result = await window.electronAPI.templateSourcesAdd(
      trimmedName, trimmedUrl, addForm.branch.trim() || 'main', priority
    )
    if (result.success) {
      setShowAddForm(false)
      setAddForm(EMPTY_FORM)
      await loadSources()
    } else {
      setAddError(result.error || 'Failed to add source')
    }
    setAddLoading(false)
  }

  const handleRemove = async () => {
    if (!removeTarget || !window.electronAPI?.templateSourcesRemove) return
    setRemoveLoading(true)
    const result = await window.electronAPI.templateSourcesRemove(removeTarget)
    if (result.success) {
      setRemoveTarget(null)
      await loadSources()
    }
    setRemoveLoading(false)
  }

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
      <div className="p-4 border-b border-border bg-surface-elevated">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Template Sources</h2>
              <p className="text-xs text-text-muted">Manage git repositories for process and step templates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSync()}
              disabled={syncing !== null}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                syncing ? 'opacity-50 cursor-not-allowed text-text-muted' : 'text-accent hover:bg-accent/10'
              }`}
            >
              <svg className={`w-3.5 h-3.5 ${syncing === '__all__' ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {syncing === '__all__' ? 'Syncing...' : 'Sync All'}
            </button>
            <button
              onClick={() => { setShowAddForm(!showAddForm); setAddError(null) }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-accent hover:bg-accent/10 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Source
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Sync feedback */}
        {syncFeedback && (
          <div className={`px-3 py-2 text-xs rounded-lg border ${
            syncFeedback.type === 'success'
              ? 'text-status-completed bg-status-completed/10 border-status-completed/20'
              : 'text-status-failed bg-status-failed/10 border-status-failed/20'
          }`}>
            {syncFeedback.message}
          </div>
        )}

        {/* Add Source Form */}
        {showAddForm && (
          <div className="p-4 rounded-lg border border-accent/30 bg-accent/5 space-y-3">
            <h3 className="text-sm font-medium text-text-primary">Add Template Source</h3>
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
                {addLoading ? 'Adding...' : 'Add Source'}
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-8 text-text-muted">
            <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Loading sources...</span>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="px-3 py-2 text-xs text-status-failed bg-status-failed/10 border border-status-failed/20 rounded-lg">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && sources.length === 0 && (
          <div className="px-3 py-8 text-sm text-center text-text-muted bg-background border border-border rounded-lg">
            No template sources configured. Add a git repository to get started.
          </div>
        )}

        {/* Source list */}
        {!loading && sources.map(source => (
          <div key={source.name} className="p-3 rounded-lg border border-border bg-background">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-text-primary">{source.name}</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-surface-elevated text-text-muted border border-border">
                    {source.branch}
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-surface-elevated text-text-muted border border-border">
                    p:{source.priority}
                  </span>
                  {source.cached && (
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-status-completed/10 text-status-completed border border-status-completed/20">
                      cached
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted font-mono truncate" title={source.url}>
                  {source.url}
                </p>
                <p className="text-[10px] text-text-muted mt-1">
                  Last synced: {formatLastSynced(source.lastSynced)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Toggle
                  id={`source-toggle-${source.name}`}
                  checked={source.enabled}
                  onChange={() => handleToggle(source.name)}
                />
                <button
                  onClick={() => handleSync(source.name)}
                  disabled={syncing !== null}
                  title="Sync this source"
                  className={`p-1.5 rounded-md transition-colors ${
                    syncing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface text-text-muted hover:text-accent'
                  }`}
                >
                  <svg className={`w-4 h-4 ${syncing === source.name ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => setRemoveTarget(source.name)}
                  title="Remove this source"
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
        ))}
      </div>

      <ConfirmationModal
        isOpen={removeTarget !== null}
        title="Remove Template Source"
        message={`Are you sure you want to remove "${removeTarget}"? This will also delete its cached files. Installed templates from this source will remain until the next sync.`}
        confirmLabel="Remove"
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
        variant="danger"
        loading={removeLoading}
      />
    </section>
  )
}
