import { useState, useCallback, useMemo, useEffect } from 'react'
import type { ProcessSummary, ProcessInstance } from '../../types'
import { ProcessTree, needsAttention } from './ProcessTree'
import { TileManager } from './TileManager'
import { ConfirmationModal } from '../ConfirmationModal'
import { useToast } from '../Toast'

interface ProcessesOverviewProps {
  processes: ProcessSummary[]
  getProcess: (path: string) => ProcessInstance | undefined
  onNavigateToProcess: (path: string) => void
  onNewProcess?: () => void
  onPopOut?: () => void
  initialPaths?: string[] | null
  onInitialPathsConsumed?: () => void
  hasPendingInteraction?: (path: string) => boolean
}

interface OpenRequest {
  path: string
  addNew: boolean
}

export function ProcessesOverview({
  processes,
  getProcess,
  onNavigateToProcess,
  onNewProcess,
  onPopOut,
  initialPaths,
  onInitialPathsConsumed,
  hasPendingInteraction
}: ProcessesOverviewProps) {
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set())
  const [openRequests, setOpenRequests] = useState<OpenRequest[]>([])
  const { showToast } = useToast()

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ path: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Compute attention count
  const attentionCount = useMemo(() => {
    return processes.filter(p => {
      const full = getProcess(p.path)
      return needsAttention(p, full, hasPendingInteraction?.(p.path))
    }).length
  }, [processes, getProcess, hasPendingInteraction])

  useEffect(() => {
    if (!initialPaths || initialPaths.length === 0) return
    const requests: OpenRequest[] = initialPaths.map((path, i) => ({
      path,
      addNew: i > 0
    }))
    setOpenRequests(requests)
    setSelectedPaths(new Set(initialPaths))
    onInitialPathsConsumed?.()
  }, [initialPaths])

  const handleSelectProcess = useCallback((path: string, ctrlKey: boolean) => {
    setSelectedPaths(new Set([path]))
    setOpenRequests(prev => [...prev, { path, addNew: ctrlKey }])
  }, [])

  const handleRequestHandled = useCallback(() => {
    // Keep requests around briefly so TileManager can process them
    setOpenRequests([])
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent, path: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, path })
  }, [])

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  const handleContextAction = useCallback((action: string) => {
    if (!contextMenu) return
    const path = contextMenu.path

    switch (action) {
      case 'open':
        setSelectedPaths(new Set([path]))
        setOpenRequests(prev => [...prev, { path, addNew: false }])
        break
      case 'open-new':
        setOpenRequests(prev => [...prev, { path, addNew: true }])
        break
      case 'expand':
        onNavigateToProcess(path)
        break
      case 'delete': {
        const full = getProcess(path)
        setDeleteConfirm({ path, name: full?.name || 'this process' })
        break
      }
    }
    closeContextMenu()
  }, [contextMenu, getProcess, onNavigateToProcess, closeContextMenu])

  const handleDelete = useCallback(async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      const result = await window.electronAPI.deleteProcessInstance(deleteConfirm.path)
      if (result.success) {
        showToast('Process deleted successfully', 'success')
      } else {
        showToast(result.error || 'Failed to delete process', 'error')
      }
    } catch (err) {
      showToast('Failed to delete process', 'error')
    }
    setDeleting(false)
    setDeleteConfirm(null)
  }, [deleteConfirm, showToast])

  // Close context menu on click outside
  const handleBackgroundClick = useCallback(() => {
    if (contextMenu) closeContextMenu()
  }, [contextMenu, closeContextMenu])

  return (
    <div className="h-full w-full flex bg-background" onClick={handleBackgroundClick}>
      {/* Process Tree Sidebar */}
      <ProcessTree
        processes={processes}
        getProcess={getProcess}
        selectedPaths={selectedPaths}
        onSelectProcess={handleSelectProcess}
        onContextMenu={handleContextMenu}
        attentionCount={attentionCount}
        hasPendingInteraction={hasPendingInteraction}
      />

      {/* Tile Manager */}
      <TileManager
        getProcess={getProcess}
        onNavigateToProcess={onNavigateToProcess}
        openRequests={openRequests}
        onRequestHandled={handleRequestHandled}
        onPopOut={onPopOut}
        hasPendingInteraction={hasPendingInteraction}
      />

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-surface border border-border rounded-lg shadow-xl py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <ContextMenuItem label="Open" onClick={() => handleContextAction('open')} />
          <ContextMenuItem label="Open in New Tile" onClick={() => handleContextAction('open-new')} shortcut="Ctrl+Click" />
          <ContextMenuItem label="Open Full View" onClick={() => handleContextAction('expand')} />
          <div className="border-t border-border my-1" />
          <ContextMenuItem label="Delete" onClick={() => handleContextAction('delete')} variant="danger" />
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteConfirm}
        title="Delete Process"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This will permanently remove all process data and cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}

function ContextMenuItem({
  label,
  onClick,
  shortcut,
  variant
}: {
  label: string
  onClick: () => void
  shortcut?: string
  variant?: 'danger'
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors
        ${variant === 'danger'
          ? 'text-status-failed hover:bg-status-failed/10'
          : 'text-text-primary hover:bg-surface-elevated'
        }
      `}
    >
      <span>{label}</span>
      {shortcut && <span className="text-text-muted text-[10px] ml-4">{shortcut}</span>}
    </button>
  )
}
