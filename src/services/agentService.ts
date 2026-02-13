import type { AgentType, AgentSession, AgentConfig } from '../types'

// ============================================================================
// Agent Configurations
// ============================================================================

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  'cursor': {
    command: 'agent',
    processAttachCommand: (path: string) => `/process-continue ${path}`,
    available: true,
    displayName: 'Cursor Agent'
  },
  'github-copilot': {
    command: 'gh copilot',
    processAttachCommand: (_path: string) => '', // Future implementation
    available: false,
    displayName: 'GitHub Copilot'
  },
  'claude-code': {
    command: 'claude',
    processAttachCommand: (path: string) => `/process-continue ${path}`,
    available: true,
    displayName: 'Claude Code'
  }
}

// ============================================================================
// Agent Service Functions
// ============================================================================

/**
 * Get all available agent types
 */
export async function getAvailableAgents(): Promise<Array<{ type: AgentType; displayName: string; available: boolean }>> {
  return window.electronAPI.agentGetAvailable()
}

/**
 * Create a new agent session
 */
export async function createAgentSession(
  agentType: AgentType,
  workingDirectory: string,
  processPath?: string
): Promise<{ success: boolean; session?: AgentSession; error?: string }> {
  const result = await window.electronAPI.agentCreate(agentType, workingDirectory, processPath)
  return result
}

/**
 * Attach an existing session to a process
 */
export async function attachToProcess(
  sessionId: string,
  processPath: string
): Promise<{ success: boolean; error?: string }> {
  return window.electronAPI.agentAttach(sessionId, processPath)
}

/**
 * Send a prompt to the agent
 */
export async function sendPrompt(
  sessionId: string,
  prompt: string
): Promise<{ success: boolean; error?: string }> {
  return window.electronAPI.agentSendPrompt(sessionId, prompt)
}

/**
 * Send raw input to the agent (keyboard events)
 */
export async function sendInput(
  sessionId: string,
  data: string
): Promise<{ success: boolean; error?: string }> {
  return window.electronAPI.agentInput(sessionId, data)
}

/**
 * Resize the terminal
 */
export async function resizeTerminal(
  sessionId: string,
  cols: number,
  rows: number
): Promise<{ success: boolean; error?: string }> {
  return window.electronAPI.agentResize(sessionId, cols, rows)
}

/**
 * Kill an agent session
 */
export async function killSession(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  return window.electronAPI.agentKill(sessionId)
}

/**
 * List all active sessions
 */
export async function listSessions(): Promise<AgentSession[]> {
  const result = await window.electronAPI.agentList()
  return result.sessions || []
}

/**
 * Get a specific session
 */
export async function getSession(sessionId: string): Promise<AgentSession | null> {
  const result = await window.electronAPI.agentGet(sessionId)
  return result.session || null
}

/**
 * Get sessions for a specific process
 */
export async function getSessionsForProcess(processPath: string): Promise<AgentSession[]> {
  const result = await window.electronAPI.agentGetForProcess(processPath)
  return result.sessions || []
}

/**
 * Get the active (running) session for a process, if any
 */
export async function getActiveSessionForProcess(processPath: string): Promise<AgentSession | null> {
  const sessions = await getSessionsForProcess(processPath)
  return sessions.find(s => s.status === 'running') || null
}

/**
 * Check if there's an active session for a process
 */
export async function hasActiveSession(processPath: string): Promise<boolean> {
  const session = await getActiveSessionForProcess(processPath)
  return session !== null
}

/**
 * Send a lazy prompt to the active session for a process
 * Returns false if no active session exists
 */
export async function sendLazyPromptToProcess(
  processPath: string,
  prompt: string
): Promise<{ success: boolean; error?: string; noSession?: boolean }> {
  const session = await getActiveSessionForProcess(processPath)
  
  if (!session) {
    return { success: false, noSession: true, error: 'No active agent session for this process' }
  }
  
  return sendPrompt(session.id, prompt)
}

// ============================================================================
// Event Subscriptions
// ============================================================================

/**
 * Subscribe to agent output events
 */
export function onAgentOutput(
  callback: (event: { sessionId: string; data: string }) => void
): () => void {
  return window.electronAPI.onAgentOutput(callback)
}

/**
 * Subscribe to agent status events
 */
export function onAgentStatus(
  callback: (event: { sessionId: string; status: string; error?: string }) => void
): () => void {
  return window.electronAPI.onAgentStatus(callback)
}
