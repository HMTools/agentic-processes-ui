import { useState, useEffect, useCallback } from 'react'

interface UseHerdrStatusReturn {
  isConnected: boolean
  socketPath: string | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Centralized hook for Herdr connection status.
 * Backed by window.electronAPI.herdrGetStatus / onHerdrStatusChange.
 */
export function useHerdrStatus(): UseHerdrStatusReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [socketPath, setSocketPath] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!window.electronAPI?.herdrGetStatus) return
    setIsLoading(true)
    try {
      const status = await window.electronAPI.herdrGetStatus()
      setIsConnected(status.status === 'connected')
      setSocketPath(status.socketPath ?? null)
      setError(status.error ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read Herdr status')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!window.electronAPI?.onHerdrStatusChange) return
    const unsubscribe = window.electronAPI.onHerdrStatusChange((event) => {
      setIsConnected(event.status === 'connected')
      setError(event.error ?? null)
    })
    return unsubscribe
  }, [])

  return { isConnected, socketPath, isLoading, error, refresh }
}
