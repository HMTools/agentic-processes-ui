import { useState, useEffect, useCallback, useMemo } from 'react'
import type { ProcessInstance, ProcessSummary, WorkspaceConfig } from '../types'
import { toProcessSummary, normalizeProcessInstance } from '../services/processService'

interface ProcessMap {
  [path: string]: ProcessInstance
}

interface ProcessError {
  path: string
  error: string
}

// Check if we're running in Electron
const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined
}

interface UseProcessesOptions {
  /** Initial workspace config from persisted settings */
  initialWorkspace?: WorkspaceConfig
  /** Callback to persist workspace changes */
  onWorkspaceChange?: (workspace: WorkspaceConfig) => void
}

export function useProcesses(options: UseProcessesOptions = {}) {
  const { initialWorkspace, onWorkspaceChange } = options
  
  const [processes, setProcesses] = useState<ProcessMap>({})
  // Multi-workspace state
  const [frameworkPath, setFrameworkPathState] = useState<string | null>(
    initialWorkspace?.frameworkPath ?? null
  )
  const [watchingPaths, setWatchingPaths] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [processErrors, setProcessErrors] = useState<ProcessError[]>([])

  // Computed: is watching at least one project
  const isWatching = watchingPaths.size > 0

  // Persist workspace changes
  useEffect(() => {
    if (onWorkspaceChange) {
      onWorkspaceChange({ frameworkPath })
    }
  }, [frameworkPath, onWorkspaceChange])

  // Set framework path (wrapper to allow external setting)
  const setFrameworkPath = useCallback((path: string | null) => {
    setFrameworkPathState(path)
  }, [])

  // Select a folder and detect its type
  const selectFolder = useCallback(async () => {
    if (!isElectron()) {
      setError('This app requires Electron to select folders. Please run the app as a desktop application.')
      return null
    }
    try {
      const path = await window.electronAPI.selectProjectFolder()
      if (path) {
        setError(null)
        return path
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to select folder: ${errorMessage}`)
      console.error('Select folder error:', err)
    }
    return null
  }, [])

  // Start watching for changes (additive - doesn't stop other watchers)
  const startWatching = useCallback(async (path: string) => {
    if (!isElectron()) return false
    try {
      const result = await window.electronAPI.startWatching(path)
      if (result.success) {
        setWatchingPaths(prev => new Set([...prev, path]))
        setError(null)
        return true
      } else {
        setError(result.error || `Failed to start file watcher for "${path}".`)
        console.error('File watcher error:', result.error)
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to start file watcher for "${path}". ${errorMessage}`)
      console.error('File watcher error:', err)
      return false
    }
  }, [])

  // Stop watching a specific project (or all if no path provided)
  const stopWatching = useCallback(async (path?: string) => {
    if (!isElectron()) return
    try {
      if (path) {
        await window.electronAPI.stopWatching(path)
        setWatchingPaths(prev => {
          const next = new Set(prev)
          next.delete(path)
          return next
        })
      } else {
        await window.electronAPI.stopAllWatching()
        setWatchingPaths(new Set())
      }
    } catch (err) {
      console.error('Stop watching error:', err)
    }
  }, [])

  // Handle process updates from file watcher
  useEffect(() => {
    if (!isElectron()) return

    const unsubscribeProcess = window.electronAPI.onProcessUpdate(({ event, data }) => {
      console.log('[useProcesses] Process update:', event, data.path)
      
      if (event === 'added' || event === 'changed') {
        if (data.process) {
          try {
            // Validate the process has required fields
            const process = data.process as ProcessInstance
            if (!process.id || !process.name || !process.currentState || !process.steps) {
              throw new Error(`Invalid process structure: missing required fields (id: ${!!process.id}, name: ${!!process.name}, currentState: ${!!process.currentState}, steps: ${!!process.steps})`)
            }
            
            // Check currentState structure
            if (!process.currentState.activeStep?.id) {
              console.warn(`[useProcesses] Process ${data.path} missing activeStep.id`)
            }
            
            setProcesses(prev => ({
              ...prev,
              [data.path]: normalizeProcessInstance(process)
            }))
            
            // Clear any previous error for this path
            setProcessErrors(prev => prev.filter(e => e.path !== data.path))
            console.log('[useProcesses] Process added/updated:', data.path)
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err)
            console.error('[useProcesses] Error processing:', data.path, errorMsg)
            setProcessErrors(prev => {
              const filtered = prev.filter(e => e.path !== data.path)
              return [...filtered, { path: data.path, error: errorMsg }]
            })
          }
        }
      } else if (event === 'removed') {
        setProcesses(prev => {
          const next = { ...prev }
          delete next[data.path]
          return next
        })
        setProcessErrors(prev => prev.filter(e => e.path !== data.path))
        console.log('[useProcesses] Process removed:', data.path)
      }
    })

    // Handle watcher errors
    const unsubscribeError = window.electronAPI.onWatcherError(({ error }) => {
      console.error('[useProcesses] Watcher error:', error)
      setError(error)
      // Clear watching paths on error - watchers have stopped
      setWatchingPaths(new Set())
    })

    return () => {
      unsubscribeProcess()
      unsubscribeError()
    }
  }, [])

  // Auto-start global watcher on mount
  useEffect(() => {
    const initWatchers = async () => {
      if (!isElectron()) return

      if (watchingPaths.size === 0) {
        console.log('[useProcesses] Auto-starting global watcher')
        await startWatching('__global__')
      }
    }

    initWatchers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Get all processes as summaries with error handling
  const { processList, summaryErrors } = useMemo(() => {
    const summaries: ProcessSummary[] = []
    const errors: ProcessError[] = []
    
    for (const [path, process] of Object.entries(processes)) {
      try {
        const summary = toProcessSummary(process, path)
        summaries.push(summary)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        console.error('[useProcesses] Error creating summary for:', path, errorMsg)
        errors.push({ path, error: `Failed to create summary: ${errorMsg}` })
      }
    }
    
    return { processList: summaries, summaryErrors: errors }
  }, [processes])

  // Combine all errors
  const allErrors = useMemo(() => {
    return [...processErrors, ...summaryErrors]
  }, [processErrors, summaryErrors])

  // Get processes by status
  const activeProcesses = processList.filter(p => p.folderStatus === 'active')
  const completedProcesses = processList.filter(p => p.folderStatus === 'completed')
  const failedProcesses = processList.filter(p => p.folderStatus === 'failed')

  // Get a specific process by path
  const getProcess = useCallback((path: string): ProcessInstance | undefined => {
    return processes[path]
  }, [processes])

  // Clear error state
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Retry watching (restart global watcher)
  const retryWatching = useCallback(async () => {
    setError(null)
    await stopWatching()
    await startWatching('__global__')
  }, [startWatching, stopWatching])

  return {
    // Multi-workspace state
    frameworkPath,
    watchingPaths: Array.from(watchingPaths),
    isWatching,

    // Error state
    error,
    processErrors: allErrors,

    // Process data
    processes: processList,
    activeProcesses,
    completedProcesses,
    failedProcesses,

    // Actions
    selectFolder,
    setFrameworkPath,
    startWatching,
    stopWatching,
    getProcess,
    clearError,
    retryWatching
  }
}

