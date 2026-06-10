import { useState, useEffect, useCallback } from 'react'
import type { ProcessFile, ProcessFileType, FileChange } from '../../types'
import { FileContentModal } from '../FileContentModal'

function fileChangeToProcessFile(fc: FileChange): ProcessFile {
  const basename = fc.path.split(/[/\\]/).pop() || fc.path
  const ext = basename.split('.').pop()?.toLowerCase()
  const type: ProcessFileType = ext === 'md' || ext === 'markdown' ? 'markdown' : 'json'
  return { name: basename, path: fc.path, type, size: 0, modifiedAt: fc.timestamp }
}

interface FilesViewProps {
  processPath: string
  loading?: boolean
  filesChanged?: FileChange[]
}

// Check if we're running in Electron
const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined
}

const FRAMEWORK_FILES = new Set([
  'process.json',
  'log.json',
  'memory.json',
  'pending-interaction.json',
])

export function FilesView({ processPath, loading, filesChanged }: FilesViewProps) {
  const [files, setFiles] = useState<ProcessFile[]>([])
  const [filesLoading, setFilesLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<ProcessFile | null>(null)
  const [frameworkExpanded, setFrameworkExpanded] = useState(false)

  // Load files list
  const loadFiles = useCallback(async () => {
    if (!isElectron() || !processPath) {
      setFilesLoading(false)
      return
    }

    setFilesLoading(true)
    try {
      const filesList = await window.electronAPI.listProcessFiles(processPath)
      setFiles(filesList)
    } catch (error) {
      console.error('Error loading files:', error)
      setFiles([])
    } finally {
      setFilesLoading(false)
    }
  }, [processPath])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  if (loading || filesLoading) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading files...</span>
        </div>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <p>No files found</p>
        </div>
      </div>
    )
  }

  const userFiles = files.filter(f => !FRAMEWORK_FILES.has(f.name))
  const frameworkFiles = files.filter(f => FRAMEWORK_FILES.has(f.name))

  return (
    <>
      <div className="h-full overflow-auto p-4">
        {/* Step File Activity (tracked by PostToolUse hook) */}
        {filesChanged && filesChanged.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 px-1 pb-2">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Step File Activity ({filesChanged.length})
              </span>
            </div>
            <div className="space-y-1.5">
              {filesChanged.map((fc) => (
                <FileChangeCard
                  key={fc.path}
                  fileChange={fc}
                  onClick={fc.operation === 'edited' ? () => setSelectedFile(fileChangeToProcessFile(fc)) : undefined}
                />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {userFiles.length === 0 && frameworkFiles.length > 0 && (
            <p className="px-1 pb-1 text-xs text-text-muted italic">No output files yet</p>
          )}
          {userFiles.map((file) => (
            <FileCard
              key={file.path}
              file={file}
              onClick={() => setSelectedFile(file)}
            />
          ))}
        </div>

        {frameworkFiles.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setFrameworkExpanded(e => !e)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-secondary select-none w-full"
            >
              <svg
                className={`w-3 h-3 transition-transform ${frameworkExpanded ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Framework Files ({frameworkFiles.length})
            </button>
            {frameworkExpanded && (
              <div className="space-y-2 mt-1">
                {frameworkFiles.map((file) => (
                  <FileCard
                    key={file.path}
                    file={file}
                    onClick={() => setSelectedFile(file)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedFile && (
        <FileContentModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </>
  )
}

function FileCard({ file, onClick }: { file: ProcessFile; onClick: () => void }) {
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (isoString: string): string => {
    try {
      const date = new Date(isoString)
      if (isNaN(date.getTime())) return ''
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return ''
    }
  }

  const isMarkdown = file.type === 'markdown'

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg bg-surface border border-border hover:border-accent/50 hover:bg-surface-elevated transition-colors text-left group"
    >
      {/* File icon */}
      <div className={`p-2 rounded-lg ${
        isMarkdown 
          ? 'bg-blue-500/10 text-blue-400' 
          : 'bg-amber-500/10 text-amber-400'
      }`}>
        {isMarkdown ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01" />
          </svg>
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-text-primary truncate group-hover:text-accent transition-colors">
            {file.name}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-medium ${
            isMarkdown 
              ? 'bg-blue-500/10 text-blue-400' 
              : 'bg-amber-500/10 text-amber-400'
          }`}>
            {isMarkdown ? 'MD' : 'JSON'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
          <span>{formatSize(file.size)}</span>
          {file.modifiedAt && (
            <>
              <span>•</span>
              <span>{formatDate(file.modifiedAt)}</span>
            </>
          )}
        </div>
      </div>

      {/* Arrow */}
      <svg className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}

function FileChangeCard({ fileChange, onClick }: { fileChange: FileChange; onClick?: () => void }) {
  const basename = fileChange.path.split(/[/\\]/).pop() || fileChange.path

  const formatTimestamp = (isoString: string): string => {
    try {
      const date = new Date(isoString)
      if (isNaN(date.getTime())) return ''
      return date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const operationConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
    created: { label: 'Created', bgColor: 'bg-green-500/10', textColor: 'text-green-400' },
    edited: { label: 'Edited', bgColor: 'bg-blue-500/10', textColor: 'text-blue-400' },
    deleted: { label: 'Deleted', bgColor: 'bg-red-500/10', textColor: 'text-red-400' },
  }

  const config = operationConfig[fileChange.operation] || operationConfig.edited
  const isClickable = !!onClick

  const Tag = isClickable ? 'button' : 'div'

  return (
    <Tag
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border text-left w-full ${
        isClickable
          ? 'cursor-pointer hover:border-accent/50 hover:bg-surface-elevated transition-colors group'
          : ''
      }`}
      title={fileChange.path}
    >
      {/* Operation badge */}
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap ${config.bgColor} ${config.textColor}`}>
        {config.label}
      </span>

      {/* File name + path */}
      <div className="flex-1 min-w-0">
        <span className={`text-sm font-mono text-text-primary truncate block ${isClickable ? 'group-hover:text-accent transition-colors' : ''}`}>
          {basename}
        </span>
        <span className="text-[11px] text-text-muted truncate block">
          {fileChange.path}
        </span>
      </div>

      {/* Tool + timestamp */}
      <div className="flex flex-col items-end flex-shrink-0">
        <span className="text-[10px] text-text-muted">{fileChange.tool}</span>
        <span className="text-[10px] text-text-muted">{formatTimestamp(fileChange.timestamp)}</span>
      </div>

      {/* View arrow for clickable items */}
      {isClickable && (
        <svg className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </Tag>
  )
}

