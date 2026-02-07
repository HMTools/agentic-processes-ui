import { useState, useCallback } from 'react'
import type { ProcessMemory, MemoryStepEntry, ProcessFile } from '../../types'
import { FileContentModal } from '../FileContentModal'

interface MemoryViewProps {
  memory: ProcessMemory | null
  loading?: boolean
  processPath?: string
}

/**
 * Parse a file entry string like "step-design.md (rewritten for generic design)"
 * into a file path and optional description.
 */
function parseFileEntry(entry: string): { filePath: string; description?: string } {
  // Match pattern: "filename (description)" or just "filename"
  const match = entry.match(/^(.+?)\s*\(([^)]+)\)\s*$/)
  if (match) {
    return { filePath: match[1].trim(), description: match[2].trim() }
  }
  return { filePath: entry.trim() }
}

/**
 * Determine the file type from extension.
 */
function getFileType(fileName: string): 'markdown' | 'json' {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'md' || ext === 'markdown') return 'markdown'
  return 'json' // default to json for non-markdown files
}

/**
 * Get the directory of a path (like path.dirname but without Node dependency).
 */
function getParentDir(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/')
  const lastSlash = normalized.lastIndexOf('/')
  if (lastSlash === -1) return '.'
  return normalized.substring(0, lastSlash)
}

/**
 * Resolve a file path relative to the process directory.
 */
function resolveFilePath(filePath: string, processPath: string): string {
  // If the path is already absolute, return as-is
  if (filePath.match(/^[a-zA-Z]:\\/) || filePath.startsWith('/')) {
    return filePath
  }
  // Resolve relative to the process directory (processPath points to process.json)
  const processDir = getParentDir(processPath)
  // Normalize separators and join
  const sep = processPath.includes('\\') ? '\\' : '/'
  const normalizedFile = filePath.replace(/[/\\]/g, sep)
  return `${processDir.replace(/[/\\]/g, sep)}${sep}${normalizedFile}`
}

/**
 * Get just the file name from a path.
 */
function getFileName(filePath: string): string {
  const parts = filePath.replace(/\\/g, '/').split('/')
  return parts[parts.length - 1] || filePath
}

export function MemoryView({ memory, loading, processPath }: MemoryViewProps) {
  const [selectedFile, setSelectedFile] = useState<ProcessFile | null>(null)

  const handleFileClick = useCallback((fileEntry: string) => {
    if (!processPath) return

    const { filePath } = parseFileEntry(fileEntry)
    const resolvedPath = resolveFilePath(filePath, processPath)
    const fileName = getFileName(filePath)

    const processFile: ProcessFile = {
      name: fileName,
      path: resolvedPath,
      type: getFileType(fileName),
      size: 0,
      modifiedAt: new Date().toISOString()
    }

    setSelectedFile(processFile)
  }, [processPath])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading memory...</span>
        </div>
      </div>
    )
  }

  if (!memory) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No memory data available</p>
        </div>
      </div>
    )
  }

  // Handle both old and new memory formats - steps might be undefined or null
  const steps = (memory as any).steps || {}
  const stepEntries = Object.entries(steps).sort((a, b) => {
    const numA = parseInt(a[0].replace(/\D/g, '')) || 0
    const numB = parseInt(b[0].replace(/\D/g, '')) || 0
    return numB - numA
  })

  // Handle old format that had parameters at top level
  const parameters = (memory as any).parameters || {}

  return (
    <div className="h-full overflow-auto p-4">
      <div className="space-y-6">
        {/* Parameters Section (old format compatibility) */}
        {Object.keys(parameters).length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Parameters
            </h3>
            <div className="bg-surface rounded-lg border border-border p-3">
              <div className="space-y-2">
                {Object.entries(parameters).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="text-xs font-mono text-accent shrink-0">{key}:</span>
                    <span className="text-xs text-text-secondary break-all">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Cross References - Key Decisions */}
        {memory.crossReferences?.keyDecisions?.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Key Decisions
            </h3>
            <div className="bg-surface rounded-lg border border-border p-3">
              <ul className="space-y-1.5">
                {memory.crossReferences.keyDecisions.map((decision, i) => (
                  <li key={i} className="flex gap-2 text-xs">
                    <span className="text-status-completed shrink-0">•</span>
                    <span className="text-text-secondary">{decision}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Files Modified */}
        {memory.crossReferences?.filesModified?.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Files Modified
            </h3>
            <div className="bg-surface rounded-lg border border-border p-3">
              <ul className="space-y-1">
                {memory.crossReferences.filesModified.map((file, i) => {
                  const { filePath, description } = parseFileEntry(file)
                  return (
                    <li key={i}>
                      <button
                        onClick={() => handleFileClick(file)}
                        className="text-xs font-mono text-accent break-all text-left hover:text-accent-hover hover:underline transition-colors cursor-pointer"
                        title={`Click to view ${filePath}`}
                      >
                        {filePath}
                      </button>
                      {description && (
                        <span className="text-xs text-text-muted ml-1">({description})</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        )}

        {/* Sub-Process State */}
        {memory.subProcessState?.childSubProcesses?.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              Child Sub-Processes
            </h3>
            <div className="space-y-2">
              {memory.subProcessState.childSubProcesses.map((child, i) => (
                <div key={i} className="bg-surface rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-text-primary truncate">{child.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      child.status === 'completed' ? 'bg-status-completed/20 text-status-completed' :
                      child.status === 'paused' ? 'bg-status-paused/20 text-status-paused' :
                      child.status === 'running' ? 'bg-status-active/20 text-status-active' :
                      'bg-status-pending/20 text-status-pending'
                    }`}>
                      {child.status}
                    </span>
                  </div>
                  <div className="text-xs text-text-muted">
                    <span className="text-text-secondary font-mono">{child.processPath}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Steps Memory */}
        {stepEntries.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Step Details
            </h3>
            <div className="space-y-3">
              {stepEntries.map(([stepKey, step]) => (
                <StepMemoryCard key={stepKey} stepKey={stepKey} step={step} onFileClick={handleFileClick} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* File Content Modal */}
      {selectedFile && (
        <FileContentModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  )
}

function StepMemoryCard({ stepKey, step, onFileClick }: { stepKey: string; step: MemoryStepEntry; onFileClick: (file: string) => void }) {
  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      <div className="px-3 py-2 bg-surface-elevated border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-accent">{stepKey}</span>
          <span className="text-xs text-text-primary font-medium">{step.name}</span>
        </div>
        {step.status && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            step.status === 'completed' ? 'bg-status-completed/20 text-status-completed' :
            step.status === 'in_progress' ? 'bg-status-active/20 text-status-active' :
            step.status === 'awaiting_approval' ? 'bg-status-paused/20 text-status-paused' :
            'bg-status-pending/20 text-status-pending'
          }`}>
            {step.status.replace('_', ' ')}
          </span>
        )}
      </div>
      
      <div className="p-3 space-y-3">
        {/* Decisions Made */}
        {step.decisionsMade && step.decisionsMade.length > 0 && (
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider block mb-1.5">
              Decisions Made
            </label>
            <ul className="space-y-1">
              {step.decisionsMade.map((decision, i) => (
                <li key={i} className="flex gap-2 text-xs">
                  <span className="text-accent shrink-0">→</span>
                  <span className="text-text-secondary">{decision}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Files Modified */}
        {step.filesModifiedCreated && step.filesModifiedCreated.length > 0 && (
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider block mb-1.5">
              Files Created/Modified
            </label>
            <ul className="space-y-0.5">
              {step.filesModifiedCreated.map((file, i) => {
                const { filePath, description } = parseFileEntry(file)
                return (
                  <li key={i}>
                    <button
                      onClick={() => onFileClick(file)}
                      className="text-xs font-mono text-accent break-all text-left hover:text-accent-hover hover:underline transition-colors cursor-pointer"
                      title={`Click to view ${filePath}`}
                    >
                      {filePath}
                    </button>
                    {description && (
                      <span className="text-xs text-text-muted ml-1">({description})</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Notes */}
        {step.notes && (
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider block mb-1.5">
              Notes
            </label>
            <p className="text-xs text-text-secondary">{step.notes}</p>
          </div>
        )}

        {/* Information Produced Preview */}
        {step.informationProduced && typeof step.informationProduced === 'object' && Object.keys(step.informationProduced).length > 0 && (
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider block mb-1.5">
              Information Produced
            </label>
            <div className="text-xs text-text-muted bg-background rounded p-2 font-mono overflow-x-auto">
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(step.informationProduced, null, 2).slice(0, 500)}
                {JSON.stringify(step.informationProduced, null, 2).length > 500 && '...'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
