import { useState, useEffect, useCallback, useMemo } from 'react'
import type { ProcessInstance, ProcessSummary } from '../../types'
import { toProcessSummary, normalizeProcessInstance } from '../../services/processService'
import { ProcessesOverview } from '../ProcessesOverview'

export function OverviewWindowApp() {
  const [processes, setProcesses] = useState<Record<string, ProcessInstance>>({})

  // Load initial process snapshot, then subscribe to live updates
  useEffect(() => {
    let mounted = true

    window.electronAPI.getCurrentProcesses().then((snapshot) => {
      if (!mounted) return
      const normalized: Record<string, ProcessInstance> = {}
      for (const [path, proc] of Object.entries(snapshot)) {
        try {
          const p = proc as ProcessInstance
          if (p.id && p.name && p.currentState && p.steps) {
            normalized[path] = normalizeProcessInstance(p)
          }
        } catch { /* skip invalid */ }
      }
      setProcesses(normalized)
    })

    const unsubProcess = window.electronAPI.onProcessUpdate(({ event, data }) => {
      if (event === 'added' || event === 'changed') {
        if (data.process) {
          try {
            const p = data.process as ProcessInstance
            if (p.id && p.name && p.currentState && p.steps) {
              setProcesses(prev => ({ ...prev, [data.path]: normalizeProcessInstance(p) }))
            }
          } catch { /* skip */ }
        }
      } else if (event === 'removed') {
        setProcesses(prev => {
          const next = { ...prev }
          delete next[data.path]
          return next
        })
      }
    })

    const unsubError = window.electronAPI.onWatcherError(() => {
      // Watcher died — clear processes
      setProcesses({})
    })

    return () => {
      mounted = false
      unsubProcess()
      unsubError()
    }
  }, [])

  const processList: ProcessSummary[] = useMemo(() => {
    const summaries: ProcessSummary[] = []
    for (const [path, process] of Object.entries(processes)) {
      try {
        summaries.push(toProcessSummary(process, path))
      } catch { /* skip */ }
    }
    return summaries
  }, [processes])

  const getProcess = useCallback((path: string): ProcessInstance | undefined => {
    return processes[path]
  }, [processes])

  const handleNavigateToProcess = useCallback((path: string) => {
    window.electronAPI.navigateToProcessInMain(path)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background text-text-primary">
      <ProcessesOverview
        processes={processList}
        getProcess={getProcess}
        onNavigateToProcess={handleNavigateToProcess}
      />
    </div>
  )
}
