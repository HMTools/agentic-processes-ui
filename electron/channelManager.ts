import { EventEmitter } from 'events'
import { join } from 'path'
import { homedir } from 'os'
import { readFileSync, readdirSync, unlinkSync, existsSync, mkdirSync } from 'fs'
import { watch, type FSWatcher } from 'chokidar'
import { request } from 'http'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChannelEndpoint {
  port: number
  parentPid: number
  mcpConnected?: boolean
  startedAt: string
}

export interface ChannelHealthResponse {
  ok: boolean
  port: number
  parentPid: number
  mcpConnected: boolean
}

export interface ChannelReply {
  correlationId: string
  type: 'ack' | 'result' | 'error'
  message: string
  timestamp: string
}

export interface ChannelAvailableEvent {
  parentPid: number
  port: number
}

export interface ChannelRemovedEvent {
  parentPid: number
}

// ---------------------------------------------------------------------------
// Channel Manager
// ---------------------------------------------------------------------------

const DISCOVERY_DIR = join(homedir(), '.claude', 'agentic-processes', 'channels')

class ChannelManager extends EventEmitter {
  private channels = new Map<number, ChannelEndpoint>() // parentPid → endpoint
  private watcher: FSWatcher | null = null
  private sseAbortControllers = new Map<number, AbortController>() // parentPid → SSE abort

  constructor() {
    super()
  }

  start(): void {
    mkdirSync(DISCOVERY_DIR, { recursive: true })
    this.loadExisting()
    this.startWatcher()
  }

  stop(): void {
    if (this.watcher) {
      this.watcher.close()
      this.watcher = null
    }
    for (const [, controller] of this.sseAbortControllers) {
      controller.abort()
    }
    this.sseAbortControllers.clear()
    this.channels.clear()
  }

  // -- Public API -----------------------------------------------------------

  getChannelForPid(claudeCodePid: number): ChannelEndpoint | null {
    return this.channels.get(claudeCodePid) ?? null
  }

  listChannels(): ChannelEndpoint[] {
    return Array.from(this.channels.values())
  }

  async checkHealth(port: number): Promise<ChannelHealthResponse | null> {
    return new Promise((resolve) => {
      const req = request(
        {
          hostname: '127.0.0.1',
          port,
          path: '/health',
          method: 'GET',
          timeout: 3000,
        },
        (res) => {
          const chunks: Buffer[] = []
          res.on('data', (c: Buffer) => chunks.push(c))
          res.on('end', () => {
            try {
              resolve(JSON.parse(Buffer.concat(chunks).toString('utf-8')))
            } catch {
              resolve(null)
            }
          })
        }
      )
      req.on('error', () => resolve(null))
      req.on('timeout', () => { req.destroy(); resolve(null) })
      req.end()
    })
  }

  async sendPrompt(
    port: number,
    prompt: string,
    meta?: Record<string, string>
  ): Promise<{ ok: boolean; correlationId?: string; error?: string }> {
    return new Promise((resolve) => {
      const body = JSON.stringify({ prompt, meta })
      const req = request(
        {
          hostname: '127.0.0.1',
          port,
          path: '/prompt',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000,
        },
        (res) => {
          const chunks: Buffer[] = []
          res.on('data', (c: Buffer) => chunks.push(c))
          res.on('end', () => {
            try {
              const result = JSON.parse(Buffer.concat(chunks).toString('utf-8'))
              resolve(result)
            } catch {
              resolve({ ok: false, error: 'Invalid response from channel server' })
            }
          })
        }
      )
      req.on('error', (err) => resolve({ ok: false, error: err.message }))
      req.on('timeout', () => {
        req.destroy()
        resolve({ ok: false, error: 'Request timed out' })
      })
      req.write(body)
      req.end()
    })
  }

  subscribeReplies(parentPid: number): void {
    const endpoint = this.channels.get(parentPid)
    if (!endpoint) return

    // Don't double-subscribe
    if (this.sseAbortControllers.has(parentPid)) return

    const controller = new AbortController()
    this.sseAbortControllers.set(parentPid, controller)

    const connectSSE = () => {
      if (controller.signal.aborted) return

      const req = request(
        {
          hostname: '127.0.0.1',
          port: endpoint.port,
          path: '/events',
          method: 'GET',
          headers: { Accept: 'text/event-stream' },
        },
        (res) => {
          let buffer = ''
          res.on('data', (chunk: Buffer) => {
            buffer += chunk.toString()
            const events = buffer.split('\n\n')
            buffer = events.pop() ?? '' // keep incomplete event
            for (const raw of events) {
              const dataLine = raw
                .split('\n')
                .find((l) => l.startsWith('data: '))
              if (!dataLine) continue
              try {
                const reply = JSON.parse(dataLine.slice(6)) as ChannelReply
                this.emit('channel-reply', { parentPid, ...reply })
              } catch {
                // skip malformed events
              }
            }
          })
          res.on('end', () => {
            // Reconnect after a short delay if not aborted
            if (!controller.signal.aborted) {
              setTimeout(connectSSE, 2000)
            }
          })
        }
      )

      req.on('error', () => {
        if (!controller.signal.aborted) {
          setTimeout(connectSSE, 5000)
        }
      })

      controller.signal.addEventListener('abort', () => req.destroy())
      req.end()
    }

    connectSSE()
  }

  unsubscribeReplies(parentPid: number): void {
    const controller = this.sseAbortControllers.get(parentPid)
    if (controller) {
      controller.abort()
      this.sseAbortControllers.delete(parentPid)
    }
  }

  // -- Discovery watcher ----------------------------------------------------

  private loadExisting(): void {
    if (!existsSync(DISCOVERY_DIR)) return

    for (const file of readdirSync(DISCOVERY_DIR)) {
      if (!file.endsWith('.json')) continue
      this.handleDiscoveryFile(join(DISCOVERY_DIR, file))
    }
  }

  private startWatcher(): void {
    this.watcher = watch(DISCOVERY_DIR, {
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 200 },
    })

    this.watcher.on('add', (filePath) => this.handleDiscoveryFile(filePath))
    this.watcher.on('change', (filePath) => this.handleDiscoveryFile(filePath))
    this.watcher.on('unlink', (filePath) => this.handleDiscoveryRemoval(filePath))
  }

  private handleDiscoveryFile(filePath: string): void {
    try {
      const content = readFileSync(filePath, 'utf-8')
      const data = JSON.parse(content) as ChannelEndpoint

      if (!data.port || !data.parentPid) return

      // Check if the parent process is still alive
      if (!this.isProcessAlive(data.parentPid)) {
        try { unlinkSync(filePath) } catch { /* ignore */ }
        return
      }

      const isNew = !this.channels.has(data.parentPid)
      this.channels.set(data.parentPid, data)

      if (isNew) {
        this.emit('channel-available', {
          parentPid: data.parentPid,
          port: data.port,
        } as ChannelAvailableEvent)
        this.subscribeReplies(data.parentPid)
      }
    } catch {
      // skip malformed files
    }
  }

  private handleDiscoveryRemoval(filePath: string): void {
    const fileName = filePath.split(/[/\\]/).pop()?.replace('.json', '')
    if (!fileName) return

    const parentPid = parseInt(fileName, 10)
    if (isNaN(parentPid)) return

    if (this.channels.has(parentPid)) {
      this.channels.delete(parentPid)
      this.unsubscribeReplies(parentPid)
      this.emit('channel-removed', { parentPid } as ChannelRemovedEvent)
    }
  }

  private isProcessAlive(pid: number): boolean {
    try {
      process.kill(pid, 0) // signal 0 just checks existence
      return true
    } catch {
      return false
    }
  }
}

// Singleton
let channelManager: ChannelManager | null = null

export function getChannelManager(): ChannelManager {
  if (!channelManager) {
    channelManager = new ChannelManager()
  }
  return channelManager
}

export function startChannelManager(): void {
  getChannelManager().start()
}

export function stopChannelManager(): void {
  if (channelManager) {
    channelManager.stop()
    channelManager = null
  }
}
