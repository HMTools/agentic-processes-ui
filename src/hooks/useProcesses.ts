import { useState, useEffect, useCallback, useMemo } from 'react'
import type { ProcessInstance, ProcessSummary } from '../types'
import { toProcessSummary } from '../services/processService'

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

export function useProcesses() {
  const [processes, setProcesses] = useState<ProcessMap>({})
  const [projectPath, setProjectPath] = useState<string | null>(null)
  const [isWatching, setIsWatching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processErrors, setProcessErrors] = useState<ProcessError[]>([])

  // Select project folder
  const selectProject = useCallback(async () => {
    if (!isElectron()) {
      setError('This app requires Electron to select folders. Please run the app as a desktop application.')
      return null
    }
    try {
      const path = await window.electronAPI.selectProjectFolder()
      if (path) {
        setProjectPath(path)
        setError(null)
        return path
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to select project folder: ${errorMessage}`)
      console.error('Select project error:', err)
    }
    return null
  }, [])

  // Start watching for changes
  const startWatching = useCallback(async (path: string) => {
    if (!isElectron()) return
    try {
      const result = await window.electronAPI.startWatching(path)
      if (result.success) {
        setIsWatching(true)
        setError(null)
      } else {
        setError(result.error || `Failed to start file watcher for "${path}". Please ensure the folder contains a ".user-processes" directory.`)
        console.error('File watcher error:', result.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to start file watcher for "${path}". ${errorMessage}\n\nPlease ensure the folder contains a ".user-processes" directory with process.json files.`)
      console.error('File watcher error:', err)
    }
  }, [])

  // Stop watching
  const stopWatching = useCallback(async () => {
    if (!isElectron()) return
    try {
      await window.electronAPI.stopWatching()
      setIsWatching(false)
    } catch (err) {
      console.error(err)
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
            if (!process.currentState.activeStepId && !process.currentState.activeStepNumber) {
              console.warn(`[useProcesses] Process ${data.path} missing activeStepId, may have old format`)
            }
            
            setProcesses(prev => ({
              ...prev,
              [data.path]: process
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
      setIsWatching(false)
    })

    return () => {
      unsubscribeProcess()
      unsubscribeError()
    }
  }, [])

  // Auto-start watching when project is set
  useEffect(() => {
    if (projectPath && !isWatching) {
      startWatching(projectPath)
    }
  }, [projectPath, isWatching, startWatching])

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

  // Retry watching the current project
  const retryWatching = useCallback(async () => {
    if (projectPath) {
      setError(null)
      setIsWatching(false)
      await startWatching(projectPath)
    }
  }, [projectPath, startWatching])

  return {
    projectPath,
    isWatching,
    error,
    processErrors: allErrors,
    processes: processList,
    activeProcesses,
    completedProcesses,
    failedProcesses,
    selectProject,
    startWatching,
    stopWatching,
    getProcess,
    setProjectPath,
    clearError,
    retryWatching
  }
}

