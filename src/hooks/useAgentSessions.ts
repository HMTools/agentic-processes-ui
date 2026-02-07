import { useState, useEffect, useCallback, useMemo } from 'react'
import type { AgentSession, AgentType } from '../types'
import * as agentService from '../services/agentService'

interface UseAgentSessionsOptions {
  /** If provided, will filter/focus on sessions for this process */
  processPath?: string
  /** If true, will automatically refresh session list on mount */
  autoRefresh?: boolean
}

interface UseAgentSessionsReturn {
  /** All sessions (or filtered by processPath if provided) */
  sessions: AgentSession[]
  /** The active (running) session for the process (if processPath provided) */
  activeSession: AgentSession | null
  /** Whether any session is currently loading/starting */
  isLoading: boolean
  /** Any error that occurred */
  error: string | null
  /** Create a new session */
  createSession: (agentType: AgentType, workingDirectory: string, processPath?: string) => Promise<AgentSession | null>
  /** Kill a session */
  killSession: (sessionId: string) => Promise<boolean>
  /** Send a prompt to a session */
  sendPrompt: (sessionId: string, prompt: string) => Promise<boolean>
  /** Send a prompt to the active session for the current process */
  sendPromptToActiveSession: (prompt: string) => Promise<boolean>
  /** Refresh the session list */
  refresh: () => Promise<void>
  /** Check if there's an active session */
  hasActiveSession: boolean
}

export function useAgentSessions(options: UseAgentSessionsOptions = {}): UseAgentSessionsReturn {
  const { processPath, autoRefresh = true } = options
  
  const [sessions, setSessions] = useState<AgentSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch sessions
  const refresh = useCallback(async () => {
    try {
      if (processPath) {
        const result = await agentService.getSessionsForProcess(processPath)
        setSessions(result)
      } else {
        const result = await agentService.listSessions()
        setSessions(result)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions')
    }
  }, [processPath])

  // Initial fetch
  useEffect(() => {
    if (autoRefresh) {
      refresh()
    }
  }, [autoRefresh, refresh])

  // Subscribe to status changes
  useEffect(() => {
    const unsubscribe = agentService.onAgentStatus((event) => {
      setSessions(prev => prev.map(s => 
        s.id === event.sessionId 
          ? { ...s, status: event.status as AgentSession['status'] }
          : s
      ))
      
      // If a session stopped or errored, refresh to get accurate state
      if (event.status === 'stopped' || event.status === 'error') {
        refresh()
      }
    })

    return unsubscribe
  }, [refresh])

  // Create a new session
  const createSession = useCallback(async (
    agentType: AgentType,
    workingDirectory: string,
    attachProcessPath?: string
  ): Promise<AgentSession | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await agentService.createAgentSession(
        agentType, 
        workingDirectory, 
        attachProcessPath || processPath
      )
      
      if (result.success && result.session) {
        setSessions(prev => [...prev, result.session!])
        return result.session
      } else {
        setError(result.error || 'Failed to create session')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [processPath])

  // Kill a session
  const killSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const result = await agentService.killSession(sessionId)
      
      if (result.success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId))
        return true
      } else {
        setError(result.error || 'Failed to kill session')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to kill session')
      return false
    }
  }, [])

  // Send a prompt to a specific session
  const sendPrompt = useCallback(async (sessionId: string, prompt: string): Promise<boolean> => {
    try {
      const result = await agentService.sendPrompt(sessionId, prompt)
      
      if (!result.success) {
        setError(result.error || 'Failed to send prompt')
        return false
      }
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send prompt')
      return false
    }
  }, [])

  // Get the active session for the current process
  const activeSession = useMemo(() => {
    return sessions.find(s => s.status === 'running') || null
  }, [sessions])

  // Send a prompt to the active session
  const sendPromptToActiveSession = useCallback(async (prompt: string): Promise<boolean> => {
    if (!activeSession) {
      setError('No active session available')
      return false
    }
    
    return sendPrompt(activeSession.id, prompt)
  }, [activeSession, sendPrompt])

  // Check if there's an active session
  const hasActiveSession = useMemo(() => activeSession !== null, [activeSession])

  return {
    sessions,
    activeSession,
    isLoading,
    error,
    createSession,
    killSession,
    sendPrompt,
    sendPromptToActiveSession,
    refresh,
    hasActiveSession
  }
}
