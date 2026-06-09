import { useState, useEffect, useCallback, useRef } from 'react'

interface UsePendingInteractionsResult {
  hasPendingInteraction: (processPath: string) => boolean
  pendingPaths: Set<string>
}

export function usePendingInteractions(activeProcessPaths: string[]): UsePendingInteractionsResult {
  const [pendingPaths, setPendingPaths] = useState<Set<string>>(new Set())
  const pathsRef = useRef(activeProcessPaths)
  pathsRef.current = activeProcessPaths

  // Initial load: check pending-interaction.json for all active processes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.electronAPI?.readProcessFile) return

    let cancelled = false
    const checkAll = async () => {
      const found = new Set<string>()
      for (const path of pathsRef.current) {
        try {
          const data = await window.electronAPI.readProcessFile(path, 'pending-interaction.json')
          if (data) found.add(path)
        } catch {
          // ignore
        }
      }
      if (!cancelled) setPendingPaths(found)
    }
    checkAll()
    return () => { cancelled = true }
  }, [activeProcessPaths])

  // Subscribe to real-time pending-interaction.json changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.electronAPI?.onPendingInteractionUpdate) return

    const unsubscribe = window.electronAPI.onPendingInteractionUpdate(({ event, processPath }) => {
      setPendingPaths(prev => {
        if (event === 'removed') {
          if (!prev.has(processPath)) return prev
          const next = new Set(prev)
          next.delete(processPath)
          return next
        } else {
          if (prev.has(processPath)) return prev
          const next = new Set(prev)
          next.add(processPath)
          return next
        }
      })
    })

    return unsubscribe
  }, [])

  const hasPendingInteraction = useCallback(
    (processPath: string) => pendingPaths.has(processPath),
    [pendingPaths]
  )

  return { hasPendingInteraction, pendingPaths }
}
