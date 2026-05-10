import { useState, useMemo } from 'react'
import type { ProcessSummary, ProcessInstance } from '../../types'
import { ProcessTreeItem } from './ProcessTreeItem'

type TreeFilter = 'all' | 'running' | 'attention'

interface ProcessTreeNode {
  process: ProcessSummary
  children: ProcessTreeNode[]
}

interface ProcessTreeProps {
  processes: ProcessSummary[]
  getProcess: (path: string) => ProcessInstance | undefined
  selectedPaths: Set<string>
  onSelectProcess: (path: string, ctrlKey: boolean) => void
  onContextMenu: (e: React.MouseEvent, path: string) => void
  attentionCount: number
}

function needsAttention(process: ProcessSummary, fullProcess?: ProcessInstance): boolean {
  if (process.status === 'failed' || process.status === 'paused') return true
  if (fullProcess?.steps.some(s => s.status === 'awaiting_approval')) return true
  // Fallback: catch steps stuck in in_progress with approvalRequired (agent failed to set awaiting_approval)
  if (fullProcess?.steps.some(s => s.status === 'in_progress' && s.approvalRequired)) return true
  // Stale check: no update in 5+ minutes for running processes
  if (process.status === 'running' && process.lastUpdated) {
    const lastUpdate = new Date(process.lastUpdated).getTime()
    const fiveMinAgo = Date.now() - 5 * 60 * 1000
    if (lastUpdate < fiveMinAgo) return true
  }
  return false
}

export function ProcessTree({
  processes,
  getProcess,
  selectedPaths,
  onSelectProcess,
  onContextMenu,
  attentionCount
}: ProcessTreeProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<TreeFilter>('all')
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())

  // Build tree from flat process list using subProcessState
  const { tree, childPathSet } = useMemo(() => {
    const childPaths = new Set<string>()

    // First pass: identify all child process paths
    for (const proc of processes) {
      const full = getProcess(proc.path)
      if (full?.subProcessState?.childProcesses) {
        for (const child of full.subProcessState.childProcesses) {
          // Find matching process by name or id
          const childProc = processes.find(p => {
            const childFull = getProcess(p.path)
            return childFull?.id === child.id
          })
          if (childProc) {
            childPaths.add(childProc.path)
          }
        }
      }
    }

    // Build tree nodes
    const nodeMap = new Map<string, ProcessTreeNode>()
    for (const proc of processes) {
      nodeMap.set(proc.path, { process: proc, children: [] })
    }

    // Attach children to parents
    for (const proc of processes) {
      const full = getProcess(proc.path)
      if (full?.subProcessState?.childProcesses) {
        const parentNode = nodeMap.get(proc.path)
        if (parentNode) {
          for (const child of full.subProcessState.childProcesses) {
            const childProc = processes.find(p => {
              const childFull = getProcess(p.path)
              return childFull?.id === child.id
            })
            if (childProc) {
              const childNode = nodeMap.get(childProc.path)
              if (childNode) {
                parentNode.children.push(childNode)
              }
            }
          }
        }
      }
    }

    // Root nodes = processes that are not children
    const roots = processes
      .filter(p => !childPaths.has(p.path))
      .map(p => nodeMap.get(p.path)!)
      .filter(Boolean)

    return { tree: roots, childPathSet: childPaths }
  }, [processes, getProcess])

  // Filter tree
  const filteredTree = useMemo(() => {
    const matchesSearch = (node: ProcessTreeNode): boolean => {
      if (!search) return true
      const q = search.toLowerCase()
      return node.process.name.toLowerCase().includes(q) ||
        node.process.template.toLowerCase().includes(q)
    }

    const matchesFilter = (node: ProcessTreeNode): boolean => {
      if (filter === 'all') return true
      if (filter === 'running') return node.process.status === 'running'
      if (filter === 'attention') {
        const full = getProcess(node.process.path)
        return needsAttention(node.process, full)
      }
      return true
    }

    const filterNode = (node: ProcessTreeNode): ProcessTreeNode | null => {
      const filteredChildren = node.children
        .map(filterNode)
        .filter(Boolean) as ProcessTreeNode[]

      const selfMatches = matchesSearch(node) && matchesFilter(node)

      if (selfMatches || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren }
      }
      return null
    }

    return tree.map(filterNode).filter(Boolean) as ProcessTreeNode[]
  }, [tree, search, filter, getProcess])

  const toggleExpand = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const renderNode = (node: ProcessTreeNode, depth: number): React.ReactNode[] => {
    const full = getProcess(node.process.path)
    const isExpanded = expandedPaths.has(node.process.path)
    const hasChildren = node.children.length > 0
    const items: React.ReactNode[] = []

    items.push(
      <ProcessTreeItem
        key={node.process.path}
        process={node.process}
        fullProcess={full}
        depth={depth}
        isSelected={selectedPaths.has(node.process.path)}
        needsAttention={needsAttention(node.process, full)}
        isExpanded={isExpanded}
        hasChildren={hasChildren}
        onSelect={onSelectProcess}
        onToggleExpand={toggleExpand}
        onContextMenu={onContextMenu}
      />
    )

    if (hasChildren && isExpanded) {
      for (const child of node.children) {
        items.push(...renderNode(child, depth + 1))
      }
    }

    return items
  }

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border" style={{ width: 240, minWidth: 240 }}>
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-2">
          Processes
        </h3>
        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-2 py-1 text-xs bg-background border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
        {/* Filter tabs */}
        <div className="flex gap-1 mt-2">
          {([
            { id: 'all' as TreeFilter, label: 'All' },
            { id: 'running' as TreeFilter, label: 'Running' },
            { id: 'attention' as TreeFilter, label: `Attention${attentionCount > 0 ? ` (${attentionCount})` : ''}` }
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`
                px-2 py-1 text-[10px] font-medium rounded transition-colors
                ${filter === tab.id
                  ? 'bg-accent text-background'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {filteredTree.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <p className="text-text-muted text-xs">No processes found</p>
          </div>
        ) : (
          filteredTree.map(node => renderNode(node, 0))
        )}
      </div>
    </div>
  )
}

export { needsAttention }
