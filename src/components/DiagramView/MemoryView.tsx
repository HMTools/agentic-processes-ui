import { useState, useCallback } from 'react'
import type { ProcessMemory, MemoryTopicFile, MemoryTopicEntry, ProcessFile } from '../../types'
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

  const topics = memory.topics || {}
  const crossRefs = memory.crossReferences
  const topicEntries = Object.entries(topics).sort((a, b) => a[0].localeCompare(b[0]))

  return (
    <div className="h-full overflow-auto p-4">
      <div className="space-y-6">
        {/* Cross References - Key Decisions */}
        {crossRefs?.keyDecisions?.length > 0 && (
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
                {crossRefs.keyDecisions.map((decision, i) => {
                  const decisionText = typeof decision === 'string'
                    ? decision
                    : (decision as any)?.decision ?? JSON.stringify(decision)
                  return (
                    <li key={i} className="flex gap-2 text-xs">
                      <span className="text-status-completed shrink-0">-</span>
                      <span className="text-text-secondary">{decisionText}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        )}

        {/* Files Modified */}
        {crossRefs?.filesModified && crossRefs.filesModified.length > 0 && (
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
                {crossRefs.filesModified.map((file, i) => {
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

        {/* Topic Files */}
        {topicEntries.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Memory Topics
            </h3>
            <div className="space-y-3">
              {topicEntries.map(([topicName, topicFile]) => (
                <TopicCard key={topicName} topicName={topicName} topicFile={topicFile as MemoryTopicFile} onFileClick={handleFileClick} />
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

function TopicCard({ topicName, topicFile, onFileClick }: { topicName: string; topicFile: MemoryTopicFile; onFileClick: (file: string) => void }) {
  const [collapsed, setCollapsed] = useState(false)
  const entries = Object.entries(topicFile.entries || {})

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      <button
        className="w-full px-3 py-2 bg-surface-elevated border-b border-border flex items-center justify-between cursor-pointer hover:bg-surface transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <svg className={`w-3 h-3 text-text-muted transition-transform ${collapsed ? '' : 'rotate-90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-xs font-mono text-accent">{topicName}.json</span>
          <span className="text-xs text-text-muted">({entries.length} {entries.length === 1 ? 'entry' : 'entries'})</span>
        </div>
        {topicFile.lastUpdated && (
          <span className="text-xs text-text-muted">{new Date(topicFile.lastUpdated).toLocaleString()}</span>
        )}
      </button>

      {!collapsed && (
        <div className="p-3 space-y-3">
          {entries.map(([stepId, entry]) => (
            <TopicEntryCard key={stepId} stepId={stepId} entry={entry as MemoryTopicEntry} onFileClick={onFileClick} />
          ))}
        </div>
      )}
    </div>
  )
}

function TopicEntryCard({ stepId, entry, onFileClick }: { stepId: string; entry: MemoryTopicEntry; onFileClick: (file: string) => void }) {
  return (
    <div className="border border-border/50 rounded p-2 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-primary font-medium">{entry.stepName}</span>
        <span className="text-xs text-text-muted font-mono">{stepId.slice(0, 8)}...</span>
      </div>

      {/* Decisions Made */}
      {entry.decisionsMade && entry.decisionsMade.length > 0 && (
        <div>
          <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Decisions</label>
          <ul className="space-y-0.5">
            {entry.decisionsMade.map((decision, i) => (
              <li key={i} className="flex gap-2 text-xs">
                <span className="text-accent shrink-0">-</span>
                <span className="text-text-secondary">{typeof decision === 'string' ? decision : JSON.stringify(decision)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Files Modified */}
      {entry.filesModifiedCreated && entry.filesModifiedCreated.length > 0 && (
        <div>
          <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Files</label>
          <ul className="space-y-0.5">
            {entry.filesModifiedCreated.map((file, i) => {
              const { filePath, description } = parseFileEntry(file)
              return (
                <li key={i}>
                  <button
                    onClick={() => onFileClick(file)}
                    className="text-xs font-mono text-accent break-all text-left hover:text-accent-hover hover:underline transition-colors cursor-pointer"
                  >
                    {filePath}
                  </button>
                  {description && <span className="text-xs text-text-muted ml-1">({description})</span>}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Information Produced Preview */}
      {entry.informationProduced && Object.keys(entry.informationProduced).length > 0 && (
        <div>
          <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Information</label>
          <div className="text-xs text-text-muted bg-background rounded p-2 font-mono overflow-x-auto">
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(entry.informationProduced, null, 2).slice(0, 500)}
              {JSON.stringify(entry.informationProduced, null, 2).length > 500 && '...'}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
