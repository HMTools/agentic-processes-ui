import { useState, useMemo, useCallback } from 'react'
import type { ProcessSummary, ProcessInstance, ExternalSession } from '../../types'
import { ProcessCard } from './ProcessCard'
import { buildProcessTree, type ProcessTreeNode } from '../../utils/processTree'
import { useChannels } from '../../hooks/useChannels'
import logo from '../../assets/logo.png'

type FilterStatus = 'all' | 'active' | 'completed' | 'failed'
type ViewMode = 'flat' | 'tree'

interface ProcessError {
  path: string
  error: string
}

interface DashboardProps {
  processes: ProcessSummary[]
  activeProcesses: ProcessSummary[]
  completedProcesses: ProcessSummary[]
  failedProcesses: ProcessSummary[]
  selectedProcess: string | null
  onSelectProcess: (path: string) => void
  getProcess: (path: string) => ProcessInstance | undefined
  processErrors?: ProcessError[]
  onNewProcess?: () => void
  externalSessions?: Record<string, ExternalSession>
  onMigrateSession?: (processPath: string) => void
}

function matchesFilter(process: ProcessSummary, filter: FilterStatus): boolean {
  if (filter === 'all') return true
  return process.folderStatus === filter
}

export function Dashboard({
  processes,
  activeProcesses,
  completedProcesses,
  failedProcesses,
  selectedProcess,
  onSelectProcess,
  getProcess,
  processErrors = [],
  onNewProcess,
  externalSessions = {},
  onMigrateSession
}: DashboardProps) {
  const [filter, setFilter] = useState<FilterStatus>('active')
  const [showErrors, setShowErrors] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('tree')
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const { channelCount } = useChannels()

  const filteredProcesses = filter === 'all'
    ? processes
    : filter === 'active'
    ? activeProcesses
    : filter === 'completed'
    ? completedProcesses
    : failedProcesses

  const counts = {
    all: processes.length,
    active: activeProcesses.length,
    completed: completedProcesses.length,
    failed: failedProcesses.length
  }

  const { tree } = useMemo(
    () => buildProcessTree(processes, getProcess),
    [processes, getProcess]
  )

  const filteredTree = useMemo(() => {
    const filterNode = (node: ProcessTreeNode): ProcessTreeNode | null => {
      const filteredChildren = node.children
        .map(filterNode)
        .filter(Boolean) as ProcessTreeNode[]

      const selfMatches = matchesFilter(node.process, filter)

      if (selfMatches || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren }
      }
      return null
    }

    return tree.map(filterNode).filter(Boolean) as ProcessTreeNode[]
  }, [tree, filter])

  const toggleExpand = useCallback((path: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedPaths(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  const renderTreeNode = (node: ProcessTreeNode, depth: number) => {
    const isExpanded = expandedPaths.has(node.process.path)
    const hasChildren = node.children.length > 0

    return (
      <div key={node.process.path}>
        <div className={depth > 0 ? 'ml-6 border-l-2 border-accent/30 pl-3' : ''}>
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <ProcessCard
                process={node.process}
                fullProcess={getProcess(node.process.path)}
                onClick={() => onSelectProcess(node.process.path)}
                isSelected={selectedProcess === node.process.path}
                externalSession={externalSessions[node.process.path] || null}
                onMigrateSession={externalSessions[node.process.path] && onMigrateSession
                  ? () => onMigrateSession(node.process.path)
                  : undefined
                }
                channelCount={channelCount}
              />
            </div>
            {hasChildren && (
              <button
                onClick={(e) => toggleExpand(node.process.path, e)}
                className="mt-4 flex-shrink-0 p-1 rounded hover:bg-surface-elevated transition-colors text-text-muted hover:text-text-primary"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-3">
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-background" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr' }}>
      {/* Left: Process list */}
      <div className="flex flex-col min-w-0 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-text-primary">Processes</h2>
          {onNewProcess && (
            <button
              onClick={onNewProcess}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-background hover:bg-accent/90 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Process
            </button>
          )}
        </div>

        {/* Filter tabs + view toggle */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {(['all', 'active', 'completed', 'failed'] as FilterStatus[]).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                  ${filter === status
                    ? 'bg-accent text-background'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  }
                `}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="ml-1.5 opacity-70">({counts[status]})</span>
              </button>
            ))}
          </div>

          {/* View mode toggle */}
          <div className="flex gap-0.5 p-0.5 rounded-md bg-surface border border-border">
            <button
              onClick={() => setViewMode('tree')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'tree'
                  ? 'bg-accent text-background'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Hierarchy view"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M8 12h12M12 18h8" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'flat'
                  ? 'bg-accent text-background'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Flat list"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Error display */}
      {processErrors.length > 0 && showErrors && (
        <div className="mx-4 mt-4 p-3 bg-status-failed/10 border border-status-failed/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-status-failed">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wider">
                {processErrors.length} Process Error{processErrors.length > 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={() => setShowErrors(false)}
              className="text-text-muted hover:text-text-secondary p-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {processErrors.map((err, i) => {
              const pathParts = err.path.split(/[/\\]/)
              const fileName = pathParts.pop()
              const processFolder = pathParts.pop()

              return (
                <div key={i} className="text-xs">
                  <div className="text-status-failed font-mono break-all">
                    {processFolder}/{fileName}
                  </div>
                  <div className="text-text-muted mt-0.5 pl-2">{err.error}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Process list */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'flat' ? (
          // Flat view (original)
          filteredProcesses.length === 0 && processErrors.length === 0 ? (
            <EmptyState filter={filter} />
          ) : filteredProcesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-text-secondary text-sm">
                No valid processes loaded
              </p>
              <p className="text-text-muted text-xs mt-1">
                Check the errors above for details
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProcesses.map(process => (
                <ProcessCard
                  key={process.path}
                  process={process}
                  fullProcess={getProcess(process.path)}
                  onClick={() => onSelectProcess(process.path)}
                  isSelected={selectedProcess === process.path}
                  externalSession={externalSessions[process.path] || null}
                  onMigrateSession={externalSessions[process.path] && onMigrateSession
                    ? () => onMigrateSession(process.path)
                    : undefined
                  }
                  channelCount={channelCount}
                />
              ))}
            </div>
          )
        ) : (
          // Tree view
          filteredTree.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <div className="space-y-3">
              {filteredTree.map(node => renderTreeNode(node, 0))}
            </div>
          )
        )}
      </div>
      </div>

      {/* Right: Panda panel */}
      <div className="flex flex-col items-center justify-center border-l border-border p-8">
        <div className="w-full max-w-[400px] aspect-square p-[2px] rounded-2xl bg-gradient-to-br from-accent/60 via-accent/20 to-transparent shadow-glow-cyan">
          <div className="w-full h-full rounded-2xl bg-surface overflow-hidden">
            <img src={logo} alt="Agentic Processes" className="w-full h-full object-contain" />
          </div>
        </div>
        <p className="text-text-secondary text-sm mt-6 text-center">
          Visual process viewer for the Agentic Process System
        </p>
      </div>
    </div>
  )
}

function EmptyState({ filter }: { filter: FilterStatus }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-surface flex items-center justify-center">
        <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p className="text-text-secondary text-sm">
        {filter === 'all'
          ? 'No processes found'
          : `No ${filter} processes`}
      </p>
      <p className="text-text-muted text-xs mt-1">
        Processes will appear here when process.json files are detected
      </p>
    </div>
  )
}
