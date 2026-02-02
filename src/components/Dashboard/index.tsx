import { useState } from 'react'
import type { ProcessSummary, ProcessInstance } from '../../types'
import { ProcessCard } from './ProcessCard'

type FilterStatus = 'all' | 'active' | 'completed' | 'failed'

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
}

export function Dashboard({
  processes,
  activeProcesses,
  completedProcesses,
  failedProcesses,
  selectedProcess,
  onSelectProcess,
  getProcess,
  processErrors = []
}: DashboardProps) {
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [showErrors, setShowErrors] = useState(true)

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
              // Extract process folder name (parent of process.json)
              const pathParts = err.path.split(/[/\\]/)
              const fileName = pathParts.pop() // process.json
              const processFolder = pathParts.pop() // e.g., process-completion-migration-20260129
              
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
        {filteredProcesses.length === 0 && processErrors.length === 0 ? (
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

