import { spawn, type IPty } from 'node-pty'
import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'
import { platform } from 'os'
import { execSync, exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
import { existsSync, readFileSync } from 'fs'
import { dirname, join } from 'path'

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
 * Escape special regex characters in a string for literal matching
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ============================================================================
// Cross-platform process discovery
// ============================================================================

interface OsProcess {
  pid: number
  parentPid: number
  commandLine: string
}

/**
 * Find running Claude Code processes across platforms.
 * Windows: uses wmic (with PowerShell fallback).
 * macOS/Linux: uses ps -eo pid,ppid,args.
 * Async to avoid blocking the Electron main process.
 */
async function findClaudeProcesses(): Promise<OsProcess[]> {
  const isWindows = platform() === 'win32'

  try {
    if (isWindows) {
      return await findClaudeProcessesWindows()
    } else {
      return await findClaudeProcessesUnix()
    }
  } catch {
    return []
  }
}

async function findClaudeProcessesWindows(): Promise<OsProcess[]> {
  let output: string

  try {
    // Primary: wmic
    const result = await execAsync(
      'wmic process where "name like \'%claude%\'" get ProcessId,ParentProcessId,CommandLine /format:csv',
      { encoding: 'utf8', windowsHide: true, timeout: 10000 }
    )
    output = result.stdout
  } catch {
    try {
      // Fallback: PowerShell Get-CimInstance
      const result = await execAsync(
        'powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"name like \'%claude%\'\\" | Select-Object ProcessId,ParentProcessId,CommandLine | ConvertTo-Csv -NoTypeInformation"',
        { encoding: 'utf8', windowsHide: true, timeout: 15000 }
      )
      output = result.stdout
    } catch {
      return []
    }
  }

  const processes: OsProcess[] = []
  const lines = output.trim().split('\n').filter(l => l.trim())

  for (const line of lines) {
    // wmic CSV format: Node,CommandLine,ParentProcessId,ProcessId
    // PowerShell CSV format: "ProcessId","ParentProcessId","CommandLine"
    const parts = line.split(',')
    if (parts.length < 3) continue

    // Try to extract numeric PID and ParentPID
    const numbers = parts.map(p => parseInt(p.replace(/"/g, '').trim(), 10)).filter(n => !isNaN(n))
    if (numbers.length < 2) continue

    // For wmic CSV: last two numbers are ParentProcessId, ProcessId
    // For PowerShell CSV: first two numbers are ProcessId, ParentProcessId
    // We detect format by checking if the line starts with a node name (wmic) or a number (PowerShell)
    const firstField = parts[0].replace(/"/g, '').trim()
    const isWmicFormat = isNaN(parseInt(firstField, 10))

    let pid: number, parentPid: number, commandLine: string
    if (isWmicFormat) {
      // wmic: Node,CommandLine,ParentProcessId,ProcessId
      pid = numbers[numbers.length - 1]
      parentPid = numbers[numbers.length - 2]
      commandLine = parts.slice(1, -2).join(',').replace(/"/g, '').trim()
    } else {
      // PowerShell: "ProcessId","ParentProcessId","CommandLine"
      pid = numbers[0]
      parentPid = numbers[1]
      commandLine = parts.slice(2).join(',').replace(/"/g, '').trim()
    }

    if (pid > 0) {
      processes.push({ pid, parentPid, commandLine })
    }
  }

  return processes
}

async function findClaudeProcessesUnix(): Promise<OsProcess[]> {
  const result = await execAsync('ps -eo pid,ppid,args', {
    encoding: 'utf8',
    timeout: 5000
  })

  const processes: OsProcess[] = []
  const lines = result.stdout.trim().split('\n').slice(1) // Skip header

  for (const line of lines) {
    const trimmed = line.trim()
    const match = trimmed.match(/^(\d+)\s+(\d+)\s+(.+)$/)
    if (!match) continue

    const commandLine = match[3]
    // Match processes with 'claude' in the command, excluding grep itself
    if (/claude/i.test(commandLine) && !/grep/i.test(commandLine)) {
      processes.push({
        pid: parseInt(match[1], 10),
        parentPid: parseInt(match[2], 10),
        commandLine
      })
    }
  }

  return processes
}

/**
 * Check if a PID is a descendant of any of the given ancestor PIDs.
 * Used to determine if a claude process is managed by this app.
 */
function isDescendantOf(pid: number, ancestorPids: Set<number>, allProcesses: OsProcess[]): boolean {
  const processMap = new Map(allProcesses.map(p => [p.pid, p]))
  let current = pid
  const visited = new Set<number>()

  while (current > 1 && !visited.has(current)) {
    visited.add(current)
    if (ancestorPids.has(current)) return true
    const proc = processMap.get(current)
    if (!proc) break
    current = proc.parentPid
  }

  return false
}

/**
 * Kill a process by PID, cross-platform.
 * On Windows, kills the entire process tree.
 */
function killProcessByPid(pid: number): void {
  const isWindows = platform() === 'win32'

  if (isWindows) {
    try {
      execSync(`taskkill /PID ${pid} /T /F`, { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] })
    } catch {
      // Process may have already exited
    }
  } else {
    try {
      process.kill(pid, 'SIGTERM')
    } catch {
      // Process may have already exited
    }
    // Force kill after a short delay if still alive
    setTimeout(() => {
      try {
        process.kill(pid, 0) // Check if alive
        process.kill(pid, 'SIGKILL')
      } catch {
        // Already dead
      }
    }, 1000)
  }
}

export interface ExternalSession {
  pid: number
  commandLine: string
  claudeSessionId: string
  processPath: string
  workingDirectory?: string
}

export interface ActiveProcessInfo {
  path: string
  sessionId?: string
  projectPaths?: string[]
}

// ============================================================================
// Agent Configurations
// ============================================================================

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  'cursor': {
    command: 'agent',
    args: [],
    processAttachCommand: (path: string) => `/process-continue ${path}`,
    available: false,
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
    processAttachCommand: (path: string) => `/process-continue ${path}`,
    available: true,
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
    processPath?: string,
    options?: { resumeSessionId?: string; permissionMode?: 'regular' | 'allow-all' }
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
      // On Windows, get fresh environment from registry to pick up newly installed CLIs
      const baseEnv = isWindows ? getFreshWindowsEnv() : process.env
      const envOptions = isWindows
        ? baseEnv
        : { ...baseEnv, TERM: 'xterm-256color', COLORTERM: 'truecolor' }

      // Resolve working directory - auto-fix if metadata.projectPaths[0] is stale (e.g. from another machine)
      let resolvedCwd = workingDirectory
      if (!existsSync(resolvedCwd)) {
        // Try to read projectPaths from process.json for CWD derivation
        if (processPath) {
          try {
            const processDir = dirname(processPath)
            const processJsonPath = join(processDir, 'process.json')
            if (existsSync(processJsonPath)) {
              const processContent = JSON.parse(readFileSync(processJsonPath, 'utf-8'))
              // Try new projectPaths (array) first, then legacy projectPath (string)
              const projectPaths = processContent.metadata?.projectPaths
              const legacyProjectPath = processContent.metadata?.projectPath
              const derivedPath = Array.isArray(projectPaths) && projectPaths.length > 0
                ? projectPaths[0]
                : (typeof legacyProjectPath === 'string' ? legacyProjectPath : null)
              if (derivedPath && existsSync(derivedPath)) {
                resolvedCwd = derivedPath
              }
            }
          } catch {
            // Failed to read process.json - fall through to error
          }
        }
        if (!existsSync(resolvedCwd)) {
          throw new Error(
            `Working directory does not exist: "${workingDirectory}". ` +
            `The process may have been created on a different machine. ` +
            `Please update the projectPaths in the process.json file.`
          )
        }
      }

      // Spawn the PTY process
      const pty = spawn(this.shell, [], {
        name: 'xterm-256color',
        cols: 120,
        rows: 30,
        cwd: resolvedCwd,
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
          // If already stopped (killed intentionally), just clean up the pty ref
          if (currentSession.status === 'stopped') {
            currentSession.pty = null
            return
          }
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
      let agentCommand = config.args?.length
        ? `${config.command} ${config.args.join(' ')}`
        : config.command

      // If allow-all permission mode, add --dangerously-skip-permissions flag
      if (options?.permissionMode === 'allow-all' && agentType === 'claude-code') {
        agentCommand = `${agentCommand} --dangerously-skip-permissions`
      }

      // If resuming an existing Claude Code session, add --resume flag
      if (options?.resumeSessionId && agentType === 'claude-code') {
        agentCommand = `${agentCommand} --resume ${options.resumeSessionId}`
      }

      // Use \r for shell command (cmd.exe/bash expects \r as Enter)
      pty.write(`${agentCommand}\r`)

      // Wait for agent to be ready by detecting its output
      // Claude Code shows "? for shortcuts" when ready for input
      // Use a generous timeout (30s) since first launch can be slow
      const readyPattern = /[?>]\s*(for shortcuts|$)/
      await this.waitForOutput(sessionId, readyPattern, 30000)

      // Small additional delay to ensure the input is truly ready
      await new Promise(resolve => setTimeout(resolve, 500))

      session.status = 'running'
      this.emit('status', {
        sessionId,
        status: 'running'
      } as AgentStatusEvent)

      // If a process path was provided, attach to it after agent starts
      if (processPath) {
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
    // \r (carriage return) submits the prompt
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
   * Discover external Claude Code sessions attached to active processes.
   * Detection is purely file-based: if a .session file exists in the process
   * folder and this app doesn't have a managed session for it, it's external.
   * The OS process scan is deferred to migration time.
   */
  async discoverExternalSessions(
    activeProcesses: ActiveProcessInfo[]
  ): Promise<Map<string, ExternalSession>> {
    const result = new Map<string, ExternalSession>()

    for (const activeProc of activeProcesses) {
      // Read .session file from the process folder (sibling of process.json)
      const processDir = dirname(activeProc.path)
      const sessionFilePath = join(processDir, '.session')
      let realSessionId: string | null = null

      try {
        if (existsSync(sessionFilePath)) {
          realSessionId = readFileSync(sessionFilePath, 'utf-8').trim()
        }
      } catch {
        // .session file missing or unreadable — skip
      }

      if (!realSessionId) continue

      // Skip if this process already has a session managed by our app
      const managedSessions = this.getSessionsForProcess(activeProc.path)
      if (managedSessions.some(s => s.status === 'running' || s.status === 'starting')) continue

      // .session file exists and no managed session — this is an external session
      result.set(activeProc.path, {
        pid: 0,
        commandLine: '',
        claudeSessionId: realSessionId,
        processPath: activeProc.path,
        workingDirectory: activeProc.projectPaths?.[0]
      })
    }

    // Enrich with real PIDs from OS process scan (best-effort, non-blocking)
    if (result.size > 0) {
      try {
        const allOsProcesses = await findClaudeProcesses()
        if (allOsProcesses.length > 0) {
          // Exclude processes managed by this app
          const managedPtyPids = new Set<number>()
          for (const session of this.sessions.values()) {
            if (session.pty) managedPtyPids.add(session.pty.pid)
          }
          const externalOsProcesses = allOsProcesses.filter(
            proc => !isDescendantOf(proc.pid, managedPtyPids, allOsProcesses)
          )

          // Try to match external OS processes to discovered sessions
          for (const [path, extSession] of result) {
            for (const osProc of externalOsProcesses) {
              // Match by session ID in command line, or by project path
              const sessionMatch = osProc.commandLine.includes(extSession.claudeSessionId)
              const cwdMatch = extSession.workingDirectory
                && osProc.commandLine.replace(/\\/g, '/').includes(extSession.workingDirectory.replace(/\\/g, '/'))

              if (sessionMatch || cwdMatch) {
                extSession.pid = osProc.pid
                extSession.commandLine = osProc.commandLine
                break
              }
            }

            // No fallback guessing — only show PID when strictly matched
          }
        }
      } catch {
        // OS scan failed — PID stays 0, detection still works
      }
    }

    return result
  }

  /**
   * Migrate an external Claude Code session into this app.
   * Finds and kills the external process, then resumes the session in a new PTY.
   */
  async migrateExternalSession(
    externalSession: ExternalSession,
    workingDirectory: string,
    options?: { permissionMode?: 'regular' | 'allow-all' }
  ): Promise<AgentSession> {
    // Find and kill external claude processes at migration time
    const allOsProcesses = await findClaudeProcesses()
    if (allOsProcesses.length > 0) {
      // Collect managed PTY PIDs to exclude
      const managedPtyPids = new Set<number>()
      for (const session of this.sessions.values()) {
        if (session.pty) {
          managedPtyPids.add(session.pty.pid)
        }
      }

      // Kill external (unmanaged) claude processes
      for (const proc of allOsProcesses) {
        if (!isDescendantOf(proc.pid, managedPtyPids, allOsProcesses)) {
          killProcessByPid(proc.pid)
        }
      }
    }

    // Wait for the process to fully terminate
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Resume the session inside a new PTY managed by this app
    return this.createSession(
      'claude-code',
      workingDirectory,
      externalSession.processPath,
      { resumeSessionId: externalSession.claudeSessionId, permissionMode: options?.permissionMode }
    )
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
