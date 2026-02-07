import { spawn, type IPty } from 'node-pty'
import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'
import { platform } from 'os'
import { execSync } from 'child_process'

// ============================================================================
// Types
// ============================================================================

export type AgentType = 'cursor' | 'github-copilot' | 'claude-code'

export type AgentSessionStatus = 'starting' | 'running' | 'stopped' | 'error'

export interface AgentConfig {
  command: string
  args?: string[]
  processAttachCommand: (processPath: string) => string
  available: boolean
  displayName: string
}

export interface AgentSession {
  id: string
  agentType: AgentType
  attachedProcessId: string | null
  attachedProcessPath: string | null
  status: AgentSessionStatus
  createdAt: string
  workingDirectory: string
}

export interface AgentSessionInternal extends AgentSession {
  pty: IPty | null
  outputBuffer: string  // Buffer to track recent PTY output for pattern matching
}

export interface AgentOutputEvent {
  sessionId: string
  data: string
}

export interface AgentStatusEvent {
  sessionId: string
  status: AgentSessionStatus
  error?: string
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Read a registry value using reg query command
 */
function readRegistryValue(key: string, valueName: string): string | null {
  try {
    const output = execSync(`reg query "${key}" /v "${valueName}"`, { 
      encoding: 'utf8', 
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe']
    })
    // Parse the output - format is: "    ValueName    REG_SZ    Value"
    const match = output.match(/REG_(?:SZ|EXPAND_SZ)\s+(.+)$/m)
    return match ? match[1].trim() : null
  } catch {
    return null
  }
}

/**
 * Get fresh PATH from Windows Registry (User + System paths)
 * This reads the actual current PATH, not the stale one from process.env
 */
function getFreshWindowsPath(): string {
  try {
    // Read system PATH
    const systemPath = readRegistryValue(
      'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment',
      'Path'
    ) || ''
    
    // Read user PATH
    const userPath = readRegistryValue(
      'HKEY_CURRENT_USER\\Environment',
      'Path'
    ) || ''
    
    // Combine them (user paths typically come first)
    const combinedPath = userPath && systemPath 
      ? `${userPath};${systemPath}`
      : userPath || systemPath
    
    return combinedPath
  } catch {
    // Fall back to process.env PATH
    return process.env.PATH || process.env.Path || ''
  }
}

/**
 * Get fresh environment variables on Windows with updated PATH from registry
 */
function getFreshWindowsEnv(): NodeJS.ProcessEnv {
  // Start with process.env as base
  const env = { ...process.env }
  
  // Override PATH with fresh value from registry
  const freshPath = getFreshWindowsPath()
  if (freshPath) {
    env.PATH = freshPath
    env.Path = freshPath  // Windows uses both
  }
  
  return env
}

/**
 * Get the Cursor CLI directory path on Windows
 */
function getCursorCliDir(): string {
  const localAppData = process.env.LOCALAPPDATA || ''
  return `${localAppData}\\cursor-agent`
}

/**
 * Get environment with Cursor CLI in PATH for Windows
 * This ensures 'agent' command works without full path
 */
function getWindowsEnvWithCursorPath(baseEnv: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const cursorCliDir = getCursorCliDir()
  const currentPath = baseEnv.PATH || baseEnv.Path || ''
  
  // Add cursor-agent dir to PATH if not already present
  if (!currentPath.toLowerCase().includes(cursorCliDir.toLowerCase())) {
    return {
      ...baseEnv,
      PATH: `${cursorCliDir};${currentPath}`
    }
  }
  return baseEnv
}

/**
 * Escape special regex characters in a string for literal matching
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ============================================================================
// Agent Configurations
// ============================================================================

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  'cursor': {
    command: 'agent',  // Works because we add cursor-agent dir to PATH
    args: [],
    processAttachCommand: (path: string) => `/process-continue ${path}`,
    available: true,
    displayName: 'Cursor Agent'
  },
  'github-copilot': {
    command: 'gh',
    args: ['copilot'],
    processAttachCommand: (_path: string) => '', // Future implementation
    available: false,
    displayName: 'GitHub Copilot'
  },
  'claude-code': {
    command: 'claude',
    args: [],
    processAttachCommand: (_path: string) => '', // Future implementation
    available: false,
    displayName: 'Claude Code'
  }
}

// ============================================================================
// Agent Session Manager
// ============================================================================

class AgentSessionManager extends EventEmitter {
  private sessions: Map<string, AgentSessionInternal> = new Map()
  private shell: string

  constructor() {
    super()
    // Determine shell based on platform
    this.shell = platform() === 'win32' 
      ? 'cmd.exe' 
      : process.env.SHELL || '/bin/bash'
  }

  /**
   * Get all available agent types with their configurations
   */
  getAvailableAgents(): Array<{ type: AgentType; config: AgentConfig }> {
    return Object.entries(AGENT_CONFIGS)
      .filter(([, config]) => config.available)
      .map(([type, config]) => ({ type: type as AgentType, config }))
  }

  /**
   * Create a new agent session
   */
  async createSession(
    agentType: AgentType,
    workingDirectory: string,
    processPath?: string
  ): Promise<AgentSession> {
    const config = AGENT_CONFIGS[agentType]
    
    if (!config.available) {
      throw new Error(`Agent type '${agentType}' is not available yet`)
    }

    const sessionId = randomUUID()
    const session: AgentSessionInternal = {
      id: sessionId,
      agentType,
      attachedProcessId: null,
      attachedProcessPath: processPath || null,
      status: 'starting',
      createdAt: new Date().toISOString(),
      workingDirectory,
      pty: null,
      outputBuffer: ''
    }

    this.sessions.set(sessionId, session)

    try {
      // Build spawn options based on platform
      const isWindows = platform() === 'win32'
      // On Windows, get fresh environment and ensure Cursor CLI is in PATH
      const baseEnv = isWindows ? getFreshWindowsEnv() : process.env
      const envOptions = isWindows
        ? getWindowsEnvWithCursorPath(baseEnv)  // Add cursor-agent to PATH
        : { ...baseEnv, TERM: 'xterm-256color', COLORTERM: 'truecolor' }

      // Spawn the PTY process
      const pty = spawn(this.shell, [], {
        name: 'xterm-256color',
        cols: 120,
        rows: 30,
        cwd: workingDirectory,
        env: envOptions,
        useConpty: isWindows  // Use Windows ConPTY for better compatibility
      })

      session.pty = pty

      // Handle PTY output
      pty.onData((data: string) => {
        // Append to output buffer (keep last 10KB to prevent memory issues)
        session.outputBuffer += data
        if (session.outputBuffer.length > 10240) {
          session.outputBuffer = session.outputBuffer.slice(-10240)
        }
        
        this.emit('output', {
          sessionId,
          data
        } as AgentOutputEvent)
      })

      // Handle PTY exit
      pty.onExit(({ exitCode }) => {
        const currentSession = this.sessions.get(sessionId)
        if (currentSession) {
          currentSession.status = exitCode === 0 ? 'stopped' : 'error'
          currentSession.pty = null
          this.emit('status', {
            sessionId,
            status: currentSession.status,
            error: exitCode !== 0 ? `Process exited with code ${exitCode}` : undefined
          } as AgentStatusEvent)
        }
      })

      // Give the shell a moment to initialize, then start the agent
      await new Promise(resolve => setTimeout(resolve, 500))

      // Start the agent CLI
      const agentCommand = config.args?.length 
        ? `${config.command} ${config.args.join(' ')}`
        : config.command
      
      // Use \r for shell command (cmd.exe/bash expects \r as Enter)
      pty.write(`${agentCommand}\r`)

      session.status = 'running'
      this.emit('status', {
        sessionId,
        status: 'running'
      } as AgentStatusEvent)

      // If a process path was provided, attach to it after agent starts
      if (processPath) {
        // Wait for agent to be ready (simple delay - could be improved with output detection)
        await new Promise(resolve => setTimeout(resolve, 2000))
        await this.attachToProcess(sessionId, processPath)
      }

      return this.getSessionPublic(session)
    } catch (error) {
      session.status = 'error'
      this.emit('status', {
        sessionId,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as AgentStatusEvent)
      throw error
    }
  }

  /**
   * Attach an existing session to an agentic process
   */
  async attachToProcess(sessionId: string, processPath: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    
    if (!session) {
      throw new Error(`Session '${sessionId}' not found`)
    }

    if (!session.pty) {
      throw new Error(`Session '${sessionId}' has no active PTY`)
    }

    const config = AGENT_CONFIGS[session.agentType]
    const attachCommand = config.processAttachCommand(processPath)
    
    if (!attachCommand) {
      throw new Error(`Agent type '${session.agentType}' does not support process attachment`)
    }

    // Clear the output buffer before writing so we can detect the echo
    this.clearOutputBuffer(sessionId)

    // Write the attach command text first
    session.pty.write(attachCommand)
    
    // Wait for the command to appear in output (agent echoes input)
    // Use a pattern that matches the end of the command
    const commandEnd = attachCommand.slice(-20)  // Last 20 chars should be enough
    const echoPattern = new RegExp(escapeRegex(commandEnd))
    
    // Wait for echo with 5 second timeout, then send Enter regardless
    await this.waitForOutput(sessionId, echoPattern, 5000)
    
    // Small additional delay to ensure the agent is ready
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Send Enter key (carriage return) to submit
    session.pty.write('\r')
    session.attachedProcessPath = processPath

    this.emit('status', {
      sessionId,
      status: session.status
    } as AgentStatusEvent)
  }

  /**
   * Send a prompt/command to the agent session
   */
  async sendPrompt(sessionId: string, prompt: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    
    if (!session) {
      throw new Error(`Session '${sessionId}' not found`)
    }

    if (!session.pty) {
      throw new Error(`Session '${sessionId}' has no active PTY`)
    }

    if (session.status !== 'running') {
      throw new Error(`Session '${sessionId}' is not running (status: ${session.status})`)
    }

    // Clear the output buffer before writing so we can detect the echo
    this.clearOutputBuffer(sessionId)

    // Write the prompt text first
    session.pty.write(prompt)
    
    // Wait for the prompt text to appear in output (agent echoes input)
    // Use a pattern that matches the last part of the prompt to handle partial echoes
    const promptEnd = prompt.slice(-20)  // Last 20 chars should be enough
    const echoPattern = new RegExp(escapeRegex(promptEnd))
    
    // Wait for echo with 5 second timeout, then send Enter regardless
    await this.waitForOutput(sessionId, echoPattern, 5000)
    
    // Small additional delay to ensure the agent is ready
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Send Enter key (carriage return) to submit
    // Note: \n (Ctrl+J) inserts newline WITHOUT submitting in Cursor CLI
    // \r is the actual Enter key that submits the prompt
    session.pty.write('\r')
  }

  /**
   * Resize the PTY terminal
   */
  resizeTerminal(sessionId: string, cols: number, rows: number): void {
    const session = this.sessions.get(sessionId)
    
    if (session?.pty) {
      session.pty.resize(cols, rows)
    }
  }

  /**
   * Send raw input to the PTY (for keyboard events)
   */
  sendInput(sessionId: string, data: string): void {
    const session = this.sessions.get(sessionId)
    
    if (session?.pty) {
      session.pty.write(data)
    }
  }

  /**
   * Kill an agent session
   */
  killSession(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    
    if (!session) {
      return
    }

    if (session.pty) {
      session.pty.kill()
      session.pty = null
    }

    session.status = 'stopped'
    this.emit('status', {
      sessionId,
      status: 'stopped'
    } as AgentStatusEvent)
  }

  /**
   * Get a session by ID
   */
  getSession(sessionId: string): AgentSession | null {
    const session = this.sessions.get(sessionId)
    return session ? this.getSessionPublic(session) : null
  }

  /**
   * Get all active sessions
   */
  listSessions(): AgentSession[] {
    return Array.from(this.sessions.values()).map(s => this.getSessionPublic(s))
  }

  /**
   * Get sessions attached to a specific process
   */
  getSessionsForProcess(processPath: string): AgentSession[] {
    return Array.from(this.sessions.values())
      .filter(s => s.attachedProcessPath === processPath)
      .map(s => this.getSessionPublic(s))
  }

  /**
   * Clean up all sessions
   */
  cleanup(): void {
    for (const [sessionId] of this.sessions) {
      this.killSession(sessionId)
    }
    this.sessions.clear()
  }

  /**
   * Wait for a pattern to appear in the PTY output
   * Returns true if pattern found, false if timeout
   */
  private waitForOutput(
    sessionId: string, 
    pattern: RegExp, 
    timeoutMs: number = 5000
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const session = this.sessions.get(sessionId)
      if (!session) {
        resolve(false)
        return
      }

      // Check if pattern is already in the buffer
      if (pattern.test(session.outputBuffer)) {
        resolve(true)
        return
      }

      // Set up listener for new output
      const checkOutput = (event: AgentOutputEvent) => {
        if (event.sessionId !== sessionId) return
        
        const currentSession = this.sessions.get(sessionId)
        if (currentSession && pattern.test(currentSession.outputBuffer)) {
          cleanup()
          resolve(true)
        }
      }

      // Set up timeout
      const timeoutId = setTimeout(() => {
        cleanup()
        resolve(false)
      }, timeoutMs)

      // Cleanup function
      const cleanup = () => {
        clearTimeout(timeoutId)
        this.off('output', checkOutput)
      }

      this.on('output', checkOutput)
    })
  }

  /**
   * Clear the output buffer for a session
   */
  private clearOutputBuffer(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.outputBuffer = ''
    }
  }

  /**
   * Convert internal session to public session (without PTY reference)
   */
  private getSessionPublic(session: AgentSessionInternal): AgentSession {
    const { pty: _pty, outputBuffer: _buffer, ...publicSession } = session
    return publicSession
  }
}

// Singleton instance
let agentManager: AgentSessionManager | null = null

export function getAgentManager(): AgentSessionManager {
  if (!agentManager) {
    agentManager = new AgentSessionManager()
  }
  return agentManager
}

export function cleanupAgentManager(): void {
  if (agentManager) {
    agentManager.cleanup()
    agentManager = null
  }
}
