import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import type { AppSettings, LazyPromptsSettings, AgentSettings, WorkspaceConfig } from '../types'

const SETTINGS_STORAGE_KEY = 'agentic-processes-settings'

const DEFAULT_SETTINGS: AppSettings = {
  lazyPrompts: {
    enabled: true,
    defaultAction: 'clipboard'
  },
  agent: {
    defaultAgentType: 'cursor',
    autoAttach: false,
    terminalFontSize: 14
  },
  workspace: {
    frameworkPath: null,
    projectPaths: []
  }
}

// Load settings from localStorage
function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Merge with defaults to ensure all fields exist
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        lazyPrompts: {
          ...DEFAULT_SETTINGS.lazyPrompts,
          ...parsed.lazyPrompts
        },
        agent: {
          ...DEFAULT_SETTINGS.agent,
          ...parsed.agent
        },
        workspace: {
          ...DEFAULT_SETTINGS.workspace,
          ...parsed.workspace
        }
      }
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
  return DEFAULT_SETTINGS
}

// Save settings to localStorage
function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

// Settings context for global access
interface SettingsContextValue {
  settings: AppSettings
  updateLazyPromptsSettings: (updates: Partial<LazyPromptsSettings>) => void
  updateAgentSettings: (updates: Partial<AgentSettings>) => void
  updateWorkspaceSettings: (updates: Partial<WorkspaceConfig>) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

// Hook to use settings
export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

// Hook to create settings state (for the provider)
export function useSettingsState() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings)

  // Persist settings when they change
  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const updateLazyPromptsSettings = useCallback((updates: Partial<LazyPromptsSettings>) => {
    setSettings(prev => ({
      ...prev,
      lazyPrompts: {
        ...prev.lazyPrompts,
        ...updates
      }
    }))
  }, [])

  const updateAgentSettings = useCallback((updates: Partial<AgentSettings>) => {
    setSettings(prev => ({
      ...prev,
      agent: {
        ...prev.agent,
        ...updates
      }
    }))
  }, [])

  const updateWorkspaceSettings = useCallback((updates: Partial<WorkspaceConfig>) => {
    setSettings(prev => ({
      ...prev,
      workspace: {
        ...prev.workspace,
        ...updates
      }
    }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  return {
    settings,
    updateLazyPromptsSettings,
    updateAgentSettings,
    updateWorkspaceSettings,
    resetSettings
  }
}

// Export context provider component
export { SettingsContext }



