import { useState, useEffect, useCallback } from 'react'
import type { ChannelEndpoint, ChannelStatus } from '../types'

interface UseChannelsReturn extends ChannelStatus {
  isLoading: boolean
  error: string | null
  install: () => Promise<{ success: boolean; error?: string }>
  uninstall: () => Promise<{ success: boolean; error?: string }>
  refresh: () => Promise<void>
  installedPath: string | null
}

/**
 * Centralized hook for channel state management.
 * Subscribes to channel IPC events and provides reactive state
 * for install status, active channels, and install/uninstall actions.
 */
export function useChannels(): UseChannelsReturn {
  const [isInstalled, setIsInstalled] = useState(false)
  const [installedPath, setInstalledPath] = useState<string | null>(null)
  const [channels, setChannels] = useState<ChannelEndpoint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refresh install status
  const refreshInstallStatus = useCallback(async () => {
    if (!window.electronAPI?.channelIsInstalled) return
    try {
      const installed = await window.electronAPI.channelIsInstalled()
      setIsInstalled(installed)
      if (installed && window.electronAPI?.channelGetInstalledPath) {
        const path = await window.electronAPI.channelGetInstalledPath()
        setInstalledPath(path)
      } else {
        setInstalledPath(null)
      }
    } catch {
      // Silently handle -- API may not be available
    }
  }, [])

  // Refresh channel list
  const refreshChannelList = useCallback(async () => {
    if (!window.electronAPI?.channelList) return
    try {
      const list = await window.electronAPI.channelList()
      setChannels(list ?? [])
    } catch {
      setChannels([])
    }
  }, [])

  // Combined refresh
  const refresh = useCallback(async () => {
    await Promise.all([refreshInstallStatus(), refreshChannelList()])
  }, [refreshInstallStatus, refreshChannelList])

  // Install channel server
  const install = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    setError(null)
    try {
      if (!window.electronAPI?.channelInstall) {
        const errMsg = 'Channel API not available. Restart the app to load the updated bridge.'
        setError(errMsg)
        return { success: false, error: errMsg }
      }
      const result = await window.electronAPI.channelInstall()
      if (!result.success) {
        setError(result.error || 'Installation failed')
        return result
      }
      await refreshInstallStatus()
      return { success: true }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unexpected error during installation'
      setError(errMsg)
      return { success: false, error: errMsg }
    } finally {
      setIsLoading(false)
    }
  }, [refreshInstallStatus])

  // Uninstall channel server
  const uninstall = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    setError(null)
    try {
      if (!window.electronAPI?.channelUninstall) {
        const errMsg = 'Channel API not available. Restart the app to load the updated bridge.'
        setError(errMsg)
        return { success: false, error: errMsg }
      }
      const result = await window.electronAPI.channelUninstall()
      if (!result.success) {
        setError(result.error || 'Uninstallation failed')
        return result
      }
      await refreshInstallStatus()
      return { success: true }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unexpected error during uninstallation'
      setError(errMsg)
      return { success: false, error: errMsg }
    } finally {
      setIsLoading(false)
    }
  }, [refreshInstallStatus])

  // Initial load
  useEffect(() => {
    refreshInstallStatus()
    refreshChannelList()
  }, [refreshInstallStatus, refreshChannelList])

  // Subscribe to channel events
  useEffect(() => {
    if (!window.electronAPI) return

    const unsubAvailable = window.electronAPI.onChannelAvailable?.(() => {
      refreshChannelList()
    })
    const unsubRemoved = window.electronAPI.onChannelRemoved?.(() => {
      refreshChannelList()
    })

    return () => {
      unsubAvailable?.()
      unsubRemoved?.()
    }
  }, [refreshChannelList])

  return {
    isInstalled,
    channels,
    hasChannels: channels.length > 0,
    channelCount: channels.length,
    isLoading,
    error,
    install,
    uninstall,
    refresh,
    installedPath,
  }
}
