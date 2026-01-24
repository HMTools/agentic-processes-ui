import { useState } from 'react'
import type { ProcessSummary, ProcessInstance } from '../../types'
import { ProcessCard } from './ProcessCard'

type FilterStatus = 'all' | 'active' | 'completed' | 'failed'

interface DashboardProps {
  processes: ProcessSummary[]
  activeProcesses: ProcessSummary[]
  completedProcesses: ProcessSummary[]
  failedProcesses: ProcessSummary[]
  selectedProcess: string | null
  onSelectProcess: (path: string) => void
  getProcess: (path: string) => ProcessInstance | undefined
}

export function Dashboard({
  processes,
  activeProcesses,
  completedProcesses,
  failedProcesses,
  selectedProcess,
  onSelectProcess,
  getProcess
}: DashboardProps) {
  const [filter, setFilter] = useState<FilterStatus>('all')

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

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary mb-3">Processes</h2>
        
        {/* Filter tabs */}
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
      </div>

      {/* Process list */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredProcesses.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="space-y-3">
            {filteredProcesses.map(process => (
              <ProcessCard
                key={process.path}
                process={process}
                fullProcess={getProcess(process.path)}
                onClick={() => onSelectProcess(process.path)}
                isSelected={selectedProcess === process.path}
              />
            ))}
          </div>
        )}
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

