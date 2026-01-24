import { useState, useEffect, useCallback } from 'react'
import type { ProcessInstance, ProcessSummary } from '../types'
import { toProcessSummary } from '../services/processService'

interface ProcessMap {
  [path: string]: ProcessInstance
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

  // Select project folder
  const selectProject = useCallback(async () => {
    if (!isElectron()) {
      setError('This app requires Electron to select folders')
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
      setError('Failed to select project folder')
      console.error(err)
    }
    return null
  }, [])

  // Start watching for changes
  const startWatching = useCallback(async (path: string) => {
    if (!isElectron()) return
    try {
      await window.electronAPI.startWatching(path)
      setIsWatching(true)
      setError(null)
    } catch (err) {
      setError('Failed to start file watcher')
      console.error(err)
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

    const unsubscribe = window.electronAPI.onProcessUpdate(({ event, data }) => {
      setProcesses(prev => {
        const next = { ...prev }
        
        if (event === 'added' || event === 'changed') {
          if (data.process) {
            next[data.path] = data.process as ProcessInstance
          }
        } else if (event === 'removed') {
          delete next[data.path]
        }
        
        return next
      })
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Auto-start watching when project is set
  useEffect(() => {
    if (projectPath && !isWatching) {
      startWatching(projectPath)
    }
  }, [projectPath, isWatching, startWatching])

  // Get all processes as summaries
  const processList: ProcessSummary[] = Object.entries(processes).map(
    ([path, process]) => toProcessSummary(process, path)
  )

  // Get processes by status
  const activeProcesses = processList.filter(p => p.folderStatus === 'active')
  const completedProcesses = processList.filter(p => p.folderStatus === 'completed')
  const failedProcesses = processList.filter(p => p.folderStatus === 'failed')

  // Get a specific process by path
  const getProcess = useCallback((path: string): ProcessInstance | undefined => {
    return processes[path]
  }, [processes])

  return {
    projectPath,
    isWatching,
    error,
    processes: processList,
    activeProcesses,
    completedProcesses,
    failedProcesses,
    selectProject,
    startWatching,
    stopWatching,
    getProcess,
    setProjectPath
  }
}

