import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { getHerdrClient } from './herdrClient'

// ============================================================================
// Types
// ============================================================================

export type AgentType = 'claude-code'

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
  herdrPaneId: string | null
  herdrWorkspaceId: string | null
  herdrTabId: string | null
  herdrAgentId: string | null
  outputBuffer: string // last known full pane snapshot, used to diff-emit new output
  pollTimer: NodeJS.Timeout | null
  resizeDebounce: NodeJS.Timeout | null
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
  'claude-code': {
    command: 'claude',
    args: [],
    processAttachCommand: (path: string) => `/process-continue ${path}`,
    available: true,
    displayName: 'Claude Code'
  }
}

// Escape special regex characters in a string for literal matching (used to
// build pane.wait_for_output patterns from literal echoed text).
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ponytail: no Herdr push event streams raw pane output (events.subscribe's
// documented event list only has lifecycle/status events, e.g.
// pane.agent_status_changed, pane.output_matched-on-pattern-match). Forwarding
// live output to the renderer therefore polls `pane.read` and diff-emits new
// bytes. Ceiling: up to POLL_INTERVAL_MS latency per output chunk; upgrade to
// a push-based stream if/when Herdr exposes one.
const POLL_INTERVAL_MS = 200

// ============================================================================
// Agent Session Manager
// ============================================================================

class AgentSessionManager extends EventEmitter {
  private sessions: Map<string, AgentSessionInternal> = new Map()

  constructor() {
    super()
    // On Herdr reconnect, pane ids from before the drop are no longer valid —
    // mark all sessions as errored rather than trying to remap them.
    getHerdrClient().on('connection-status', ({ status }: { status: string }) => {
      if (status !== 'disconnected') return
      for (const session of this.sessions.values()) {
        if (session.status === 'running' || session.status === 'starting') {
          this.stopPolling(session)
          session.status = 'error'
          this.emit('status', {
            sessionId: session.id,
            status: 'error',
            error: 'Herdr disconnected'
          } as AgentStatusEvent)
        }
      }
    })
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
      herdrPaneId: null,
      herdrWorkspaceId: null,
      herdrTabId: null,
      herdrAgentId: null,
      outputBuffer: '',
      pollTimer: null,
      resizeDebounce: null
    }

    this.sessions.set(sessionId, session)

    try {
      const client = getHerdrClient()

      // Resolve working directory - auto-fix if metadata.projectPaths[0] is stale (e.g. from another machine)
      let resolvedCwd = workingDirectory
      if (!existsSync(resolvedCwd)) {
        if (processPath) {
          try {
            const processDir = dirname(processPath)
            const processJsonPath = join(processDir, 'process.json')
            if (existsSync(processJsonPath)) {
              const processContent = JSON.parse(readFileSync(processJsonPath, 'utf-8'))
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

      // Create an isolated workspace for this session via Herdr. workspace.create
      // returns { workspace: {workspace_id}, tab: {tab_id}, root_pane: {pane_id} }
      // (a blank starter pane) - agent.start below spawns its own dedicated pane
      // for the agent process, so the blank root pane is closed right after.
      const workspace = await client.call<{
        workspace: { workspace_id: string }
        tab: { tab_id: string }
        root_pane: { pane_id: string }
      }>('workspace.create', { cwd: resolvedCwd, label: config.displayName })
      session.herdrWorkspaceId = workspace.workspace.workspace_id
      session.herdrTabId = workspace.tab.tab_id

      // Build the agent CLI argv
      const argv = [config.command, ...(config.args ?? [])]

      if (options?.permissionMode === 'allow-all' && agentType === 'claude-code') {
        argv.push('--dangerously-skip-permissions')
      }

      if (options?.resumeSessionId && agentType === 'claude-code') {
        argv.push('--resume', options.resumeSessionId)
      }

      // agent.start spawns argv in a fresh pane inside the tab and, when argv[0]
      // matches a known agent binary (claude), registers
      // it as a target queryable by name via agent.get/agent.send.
      const agentStart = await client.call<{ agent: { pane_id: string; name: string } }>('agent.start', {
        name: sessionId,
        tab_id: workspace.tab.tab_id,
        argv,
        focus: false
      })
      session.herdrPaneId = agentStart.agent.pane_id
      session.herdrAgentId = agentStart.agent.name

      await client.call('pane.close', { pane_id: workspace.root_pane.pane_id }).catch(() => {})

      // Wait for the agent to be ready (idle) before considering it running.
      // Herdr's socket API has no blocking agent-wait RPC (confirmed against the
      // live server - agent.wait/agent.prompt from the public docs don't exist in
      // this protocol version); poll agent.get instead, same pattern as startPolling.
      await this.pollAgentStatus(session.herdrAgentId, 30000).catch(() => {})

      // Guard against killSession() racing this in-flight createSession()
      if (session.status === 'stopped') {
        return this.getSessionPublic(session)
      }

      this.startPolling(session)

      session.status = 'running'
      this.emit('status', { sessionId, status: 'running' } as AgentStatusEvent)

      if (processPath) {
        await this.attachToProcess(sessionId, processPath)
      }

      return this.getSessionPublic(session)
    } catch (error) {
      if (session.status !== 'stopped') {
        session.status = 'error'
        this.emit('status', {
          sessionId,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        } as AgentStatusEvent)
      }
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

    if (!session.herdrPaneId) {
      throw new Error(`Session '${sessionId}' has no active Herdr pane`)
    }

    const config = AGENT_CONFIGS[session.agentType]
    const attachCommand = config.processAttachCommand(processPath)

    if (!attachCommand) {
      throw new Error(`Agent type '${session.agentType}' does not support process attachment`)
    }

    const client = getHerdrClient()
    await client.call('pane.send_text', { pane_id: session.herdrPaneId, text: attachCommand })

    // Wait for the command to be echoed back before submitting (best-effort;
    // proceeds regardless of timeout, same as the old PTY heuristic).
    const commandEnd = attachCommand.slice(-20)
    await client.call('pane.wait_for_output', {
      pane_id: session.herdrPaneId,
      pattern: escapeRegex(commandEnd),
      timeout_ms: 5000
    }).catch(() => {})

    await client.call('pane.send_keys', { pane_id: session.herdrPaneId, keys: ['Enter'] })
    session.attachedProcessPath = processPath

    this.emit('status', { sessionId, status: session.status } as AgentStatusEvent)
  }

  /**
   * Send a prompt/command to the agent session
   */
  async sendPrompt(sessionId: string, prompt: string): Promise<void> {
    const session = this.sessions.get(sessionId)

    if (!session) {
      throw new Error(`Session '${sessionId}' not found`)
    }

    if (!session.herdrPaneId) {
      throw new Error(`Session '${sessionId}' has no active Herdr pane`)
    }

    if (session.status !== 'running') {
      throw new Error(`Session '${sessionId}' is not running (status: ${session.status})`)
    }

    const client = getHerdrClient()

    if (session.herdrAgentId) {
      // agent.send writes literal text only (no inline wait, no Enter — confirmed
      // against the live server; `agent.prompt` from the public docs doesn't
      // exist in this protocol version). Submit, then poll for idle like createSession.
      await client.call('agent.send', { target: session.herdrAgentId, text: prompt })
      await client.call('pane.send_keys', { pane_id: session.herdrPaneId, keys: ['Enter'] })
      await this.pollAgentStatus(session.herdrAgentId, 15000).catch(() => {})
      return
    }

    // Fallback: pane-level send + wait_for_output for the echo, then submit.
    await client.call('pane.send_text', { pane_id: session.herdrPaneId, text: prompt })
    const promptEnd = prompt.slice(-20)
    await client.call('pane.wait_for_output', {
      pane_id: session.herdrPaneId,
      pattern: escapeRegex(promptEnd),
      timeout_ms: 5000
    }).catch(() => {})
    await client.call('pane.send_keys', { pane_id: session.herdrPaneId, keys: ['Enter'] })
  }

  /**
   * Resize the terminal.
   * ponytail: Herdr's `pane.resize` takes a split direction + ratio (0-1), not
   * a terminal character grid (cols/rows) like node-pty's resize did — the two
   * concepts don't map. There is no known Herdr call for "set this pane's PTY
   * to N cols by M rows" (Herdr owns pane sizing via its own layout). This is
   * therefore a no-op kept debounced/trailing-edge per the approved plan so
   * the call site doesn't need to change; upgrade if Herdr adds a real
   * grid-resize method.
   */
  resizeTerminal(sessionId: string, _cols: number, _rows: number): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    if (session.resizeDebounce) clearTimeout(session.resizeDebounce)
    session.resizeDebounce = setTimeout(() => {
      session.resizeDebounce = null
      // Intentionally a no-op against Herdr (see doc comment above).
    }, 150)
  }

  /**
   * Send raw input to the pane (for keyboard events)
   */
  sendInput(sessionId: string, data: string): void {
    const session = this.sessions.get(sessionId)
    if (!session?.herdrPaneId) return

    getHerdrClient().call('pane.send_input', { pane_id: session.herdrPaneId, text: data }).catch(() => {
      // Best-effort; matches old sendInput's fire-and-forget semantics.
    })
  }

  /**
   * Kill an agent session
   */
  killSession(sessionId: string): void {
    const session = this.sessions.get(sessionId)

    if (!session) {
      return
    }

    this.stopPolling(session)

    const paneId = session.herdrPaneId
    const tabId = session.herdrTabId
    session.herdrPaneId = null

    if (paneId) {
      const client = getHerdrClient()
      client.call('pane.close', { pane_id: paneId }).catch(() => {})
      if (tabId) client.call('tab.close', { tab_id: tabId }).catch(() => {})
    }

    session.status = 'stopped'
    this.emit('status', { sessionId, status: 'stopped' } as AgentStatusEvent)
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
   * Detection is file-based (.session file in the process folder); PIDs are
   * enriched, best-effort, via Herdr's own pane/process bookkeeping
   * (pane.list + pane.process_info) instead of OS-level ps/registry scanning.
   */
  async discoverExternalSessions(
    activeProcesses: ActiveProcessInfo[]
  ): Promise<Map<string, ExternalSession>> {
    const result = new Map<string, ExternalSession>()

    for (const activeProc of activeProcesses) {
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

      const managedSessions = this.getSessionsForProcess(activeProc.path)
      if (managedSessions.some(s => s.status === 'running' || s.status === 'starting')) continue

      result.set(activeProc.path, {
        pid: 0,
        commandLine: '',
        claudeSessionId: realSessionId,
        processPath: activeProc.path,
        workingDirectory: activeProc.projectPaths?.[0]
      })
    }

    // Enrich with real PIDs via Herdr's pane bookkeeping (best-effort, non-blocking)
    if (result.size > 0) {
      try {
        const managedPaneIds = new Set(
          Array.from(this.sessions.values()).map(s => s.herdrPaneId).filter(Boolean) as string[]
        )
        const client = getHerdrClient()
        const paneList = await client.call<{ panes: Array<{ pane_id: string; foreground_cwd?: string }> }>('pane.list', {})
        const externalPanes = (paneList.panes ?? []).filter(p => !managedPaneIds.has(p.pane_id))

        for (const [, extSession] of result) {
          for (const pane of externalPanes) {
            try {
              const info = await client.call<{ pid?: number; foreground_processes?: Array<{ pid: number; cmdline?: string }> }>(
                'pane.process_info',
                { pane_id: pane.pane_id }
              )
              const cwdMatch = extSession.workingDirectory && pane.foreground_cwd
                && pane.foreground_cwd.replace(/\\/g, '/').includes(extSession.workingDirectory.replace(/\\/g, '/'))
              const fg = info.foreground_processes?.[0]
              const cmdlineMatch = fg?.cmdline?.includes(extSession.claudeSessionId)

              if (cwdMatch || cmdlineMatch) {
                extSession.pid = fg?.pid ?? info.pid ?? 0
                extSession.commandLine = fg?.cmdline ?? ''
                break
              }
            } catch {
              // Pane closed mid-poll or process_info unsupported — skip this pane.
            }
          }
        }
      } catch {
        // Herdr scan failed — PID stays 0, detection still works via .session file
      }
    }

    return result
  }

  /**
   * Migrate an external Claude Code session into this app.
   * Finds (via Herdr pane bookkeeping) and closes the external pane, then
   * resumes the session in a freshly created pane.
   */
  async migrateExternalSession(
    externalSession: ExternalSession,
    workingDirectory: string,
    options?: { permissionMode?: 'regular' | 'allow-all' }
  ): Promise<AgentSession> {
    try {
      const client = getHerdrClient()
      const managedPaneIds = new Set(
        Array.from(this.sessions.values()).map(s => s.herdrPaneId).filter(Boolean) as string[]
      )
      const paneList = await client.call<{ panes: Array<{ pane_id: string; foreground_cwd?: string }> }>('pane.list', {})
      const externalPanes = (paneList.panes ?? []).filter(p => !managedPaneIds.has(p.pane_id))

      for (const pane of externalPanes) {
        try {
          const info = await client.call<{ foreground_processes?: Array<{ pid: number; cmdline?: string }> }>(
            'pane.process_info',
            { pane_id: pane.pane_id }
          )
          const fg = info.foreground_processes?.[0]
          const matches = (fg?.pid && fg.pid === externalSession.pid)
            || fg?.cmdline?.includes(externalSession.claudeSessionId)
            || (externalSession.workingDirectory && pane.foreground_cwd
              && pane.foreground_cwd.replace(/\\/g, '/').includes(externalSession.workingDirectory.replace(/\\/g, '/')))

          if (matches) {
            await client.call('pane.close', { pane_id: pane.pane_id }).catch(() => {})
            break
          }
        } catch {
          // process_info failed for this pane — skip it
        }
      }
    } catch {
      // Discovery/close best-effort only — proceed to resume regardless
    }

    // Wait for the external process to fully terminate
    await new Promise(resolve => setTimeout(resolve, 1500))

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

  // -- Agent status waiting ----------------------------------------------
  // No blocking agent-wait RPC exists in this protocol version (confirmed
  // against the live server's method list and by observing the `herdr agent
  // wait` CLI itself poll `agent.get` in a loop). Mirrors that behavior.
  private async pollAgentStatus(agentTarget: string, timeoutMs: number): Promise<void> {
    const client = getHerdrClient()
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      let status: string | undefined
      try {
        const info = await client.call<{ agent: { agent_status: string } }>('agent.get', { target: agentTarget })
        status = info.agent?.agent_status
      } catch {
        // Agent target not found (process exited, or never got recognized as a
        // known agent binary) - nothing further to wait for.
        return
      }
      if (status === 'idle' || status === 'done') return
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
    }
    throw new Error(`Agent "${agentTarget}" did not reach idle within ${timeoutMs}ms`)
  }

  // -- Output polling (see POLL_INTERVAL_MS doc comment) ---------------------

  private startPolling(session: AgentSessionInternal): void {
    if (session.pollTimer) return
    const client = getHerdrClient()

    session.pollTimer = setInterval(async () => {
      if (!session.herdrPaneId) return
      try {
        const read = await client.call<{ read?: { text?: string } }>('pane.read', {
          pane_id: session.herdrPaneId,
          source: 'recent_unwrapped'
        })
        const snapshot = read.read?.text ?? ''
        if (snapshot && snapshot !== session.outputBuffer) {
          const newSuffix = snapshot.startsWith(session.outputBuffer)
            ? snapshot.slice(session.outputBuffer.length)
            : snapshot // buffer rotated/truncated upstream — emit the whole snapshot
          session.outputBuffer = snapshot.length > 10240 ? snapshot.slice(-10240) : snapshot
          if (newSuffix) {
            this.emit('output', { sessionId: session.id, data: newSuffix } as AgentOutputEvent)
          }
        }
      } catch {
        // Pane may have closed between polls — the status listener handles cleanup.
      }
    }, POLL_INTERVAL_MS)
  }

  private stopPolling(session: AgentSessionInternal): void {
    if (session.pollTimer) {
      clearInterval(session.pollTimer)
      session.pollTimer = null
    }
    if (session.resizeDebounce) {
      clearTimeout(session.resizeDebounce)
      session.resizeDebounce = null
    }
  }

  /**
   * Convert internal session to public session (without Herdr internals)
   */
  private getSessionPublic(session: AgentSessionInternal): AgentSession {
    const {
      herdrPaneId: _paneId,
      herdrWorkspaceId: _wsId,
      herdrTabId: _tabId,
      herdrAgentId: _agentId,
      outputBuffer: _buffer,
      pollTimer: _pollTimer,
      resizeDebounce: _resizeDebounce,
      ...publicSession
    } = session
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
