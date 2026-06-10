import { useState, useEffect, useCallback } from 'react'

export interface UpdateState {
  status: 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error'
  currentVersion: string | null
  newVersion: string | null
  downloadPercent: number
  error: string | null
  dismissed: boolean
}

export interface UseAutoUpdateResult {
  updateState: UpdateState
  dismissUpdate: () => void
  restartToUpdate: () => void
}

const initialState: UpdateState = {
  status: 'idle',
  currentVersion: null,
  newVersion: null,
  downloadPercent: 0,
  error: null,
  dismissed: false,
}

export function useAutoUpdate(): UseAutoUpdateResult {
  const [updateState, setUpdateState] = useState<UpdateState>(initialState)

  useEffect(() => {
    if (!window.electronAPI?.updateGetCurrentVersion) return

    window.electronAPI.updateGetCurrentVersion().then((version) => {
      setUpdateState((prev) => ({ ...prev, currentVersion: version }))
    })
  }, [])

  useEffect(() => {
    if (!window.electronAPI?.onUpdateStatus) return

    const unsub = window.electronAPI.onUpdateStatus((event) => {
      setUpdateState((prev) => {
        switch (event.status) {
          case 'checking':
            return { ...prev, status: 'checking', dismissed: false }
          case 'available':
            return { ...prev, status: 'available', newVersion: event.version ?? null, dismissed: false }
          case 'not-available':
            return { ...prev, status: 'idle' }
          case 'downloading':
            return { ...prev, status: 'downloading', downloadPercent: event.percent ?? 0 }
          case 'downloaded':
            return {
              ...prev,
              status: 'downloaded',
              newVersion: event.version ?? prev.newVersion,
              downloadPercent: 100,
            }
          case 'error':
            return { ...prev, status: 'error', error: event.error ?? 'Unknown error' }
          default:
            return prev
        }
      })
    })

    return unsub
  }, [])

  const dismissUpdate = useCallback(() => {
    setUpdateState((prev) => ({ ...prev, dismissed: true }))
  }, [])

  const restartToUpdate = useCallback(() => {
    window.electronAPI?.updateQuitAndInstall()
  }, [])

  return { updateState, dismissUpdate, restartToUpdate }
}
