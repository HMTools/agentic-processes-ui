import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'
import { connect as netConnect, type Socket } from 'net'
import { homedir } from 'os'
import { join } from 'path'
import { platform } from 'os'

// ============================================================================
// Herdr local socket API client.
// Docs: https://herdr.dev/docs/socket-api/
// Newline-delimited JSON over a unix socket (or Windows named pipe).
// Every other module talks to Herdr only through this file.
// ============================================================================

export type HerdrConnectionStatus = 'connected' | 'disconnected' | 'connecting'

interface PendingCall {
  resolve: (value: any) => void
  reject: (err: Error) => void
  timeout: NodeJS.Timeout
}

// ponytail: events.subscribe's documented event list has no raw output-stream
// event (pane.output_matched fires only on a matched wait pattern, not a
// continuous stream). There is no known push method for "pane produced bytes X".
// Callers that need live output (agentSessionManager) must poll `pane.read`
// themselves; this client only demuxes whatever push messages the server does
// send (status/lifecycle events) into 'pane-output' / 'agent-status' shaped
// events when they carry recognizable fields, plus always emits 'connection-status'.
export function resolveSocketPath(): string {
  if (process.env.HERDR_SOCKET_PATH) return process.env.HERDR_SOCKET_PATH
  if (process.env.HERDR_SESSION) {
    return join(homedir(), '.config', 'herdr', 'sessions', process.env.HERDR_SESSION, 'herdr.sock')
  }
  if (platform() === 'win32') {
    // Windows named pipe convention; Herdr docs only document the unix default,
    // best-effort mirror of it as a named pipe.
    return '\\\\.\\pipe\\herdr'
  }
  return join(homedir(), '.config', 'herdr', 'herdr.sock')
}

class HerdrClient extends EventEmitter {
  private socket: Socket | null = null
  private buffer = ''
  private pending = new Map<string, PendingCall>()
  private status: HerdrConnectionStatus = 'disconnected'
  private lastError: string | null = null
  private reconnectAttempt = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private manuallyDisconnected = false

  connect(): void {
    this.manuallyDisconnected = false
    if (this.socket || this.status === 'connecting') return
    this.setStatus('connecting')

    const socketPath = resolveSocketPath()
    const socket = netConnect(socketPath)
    this.socket = socket

    socket.on('connect', () => {
      this.reconnectAttempt = 0
      this.lastError = null
      this.setStatus('connected')
    })

    socket.on('data', (chunk: Buffer) => {
      this.buffer += chunk.toString('utf-8')
      let idx: number
      while ((idx = this.buffer.indexOf('\n')) >= 0) {
        const line = this.buffer.slice(0, idx)
        this.buffer = this.buffer.slice(idx + 1)
        if (line.trim()) this.handleLine(line)
      }
    })

    const onFailure = (err?: Error) => {
      this.lastError = err?.message || 'Herdr socket disconnected'
      this.socket = null
      // On reconnect, callers must not assume pane ids survived: reject in-flight
      // calls and let agentSessionManager mark its own sessions 'error'.
      for (const [id, call] of this.pending) {
        clearTimeout(call.timeout)
        call.reject(new Error(this.lastError!))
        this.pending.delete(id)
      }
      this.setStatus('disconnected')
      this.scheduleReconnect()
    }

    socket.on('error', onFailure)
    socket.on('close', () => onFailure())
  }

  disconnect(): void {
    this.manuallyDisconnected = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.socket?.destroy()
    this.socket = null
    this.setStatus('disconnected')
  }

  private scheduleReconnect(): void {
    if (this.manuallyDisconnected || this.reconnectTimer) return
    // Mirrors channelManager's SSE reconnect backoff pattern (fixed short delay,
    // capped) rather than the HTTP transport itself.
    const delay = Math.min(1000 * 2 ** this.reconnectAttempt, 15000)
    this.reconnectAttempt++
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }

  private setStatus(status: HerdrConnectionStatus): void {
    this.status = status
    this.emit('connection-status', { status, error: this.lastError })
  }

  getStatus(): { status: HerdrConnectionStatus; error: string | null; socketPath: string } {
    return { status: this.status, error: this.lastError, socketPath: resolveSocketPath() }
  }

  private handleLine(line: string): void {
    let msg: any
    try {
      msg = JSON.parse(line)
    } catch {
      return // malformed line, skip
    }

    if (msg.id && this.pending.has(msg.id)) {
      const call = this.pending.get(msg.id)!
      clearTimeout(call.timeout)
      this.pending.delete(msg.id)
      if (msg.error) {
        call.reject(new Error(msg.error.message || msg.error.code || 'Herdr call failed'))
      } else {
        call.resolve(msg.result)
      }
      return
    }

    // Unsolicited push message (event). Demux by result.type / pane_id.
    const result = msg.result ?? msg
    const type = result?.type as string | undefined
    if (!type) return

    if (type.startsWith('pane.output') || type === 'output_matched') {
      this.emit('pane-output', { paneId: result.pane_id, data: result.data ?? result.text ?? '' })
    } else if (type.includes('agent_status') || type.startsWith('agent.')) {
      this.emit('agent-status', result)
    } else {
      this.emit('event', result)
    }
  }

  call<T = any>(method: string, params?: Record<string, unknown>, timeoutMs = 10000): Promise<T> {
    if (!this.socket || this.status !== 'connected') {
      return Promise.reject(new Error('Herdr socket is not connected'))
    }

    const id = randomUUID()
    const payload = JSON.stringify({ id, method, params: params ?? {} }) + '\n'

    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`Herdr call "${method}" timed out after ${timeoutMs}ms`))
      }, timeoutMs)

      this.pending.set(id, { resolve, reject, timeout })
      this.socket!.write(payload, (err) => {
        if (err) {
          clearTimeout(timeout)
          this.pending.delete(id)
          reject(err)
        }
      })
    })
  }

  /**
   * Wraps events.subscribe. Handler receives every push message whose type
   * matches one of eventTypes (or all of them if eventTypes is empty).
   */
  async subscribe(eventTypes: string[], handler: (event: any) => void): Promise<void> {
    await this.call('events.subscribe', {
      subscriptions: eventTypes.length ? eventTypes.map(type => ({ type })) : [{ type: '*' }]
    })
    const listener = (event: any) => {
      if (eventTypes.length === 0 || eventTypes.includes(event.type)) handler(event)
    }
    this.on('event', listener)
    this.on('pane-output', listener)
    this.on('agent-status', listener)
  }
}

// ============================================================================
// Singleton (mirrors getAgentManager()/getChannelManager() pattern)
// ============================================================================

let herdrClient: HerdrClient | null = null

export function getHerdrClient(): HerdrClient {
  if (!herdrClient) {
    herdrClient = new HerdrClient()
  }
  return herdrClient
}

export function disconnectHerdrClient(): void {
  if (herdrClient) {
    herdrClient.disconnect()
    herdrClient = null
  }
}

export type { HerdrClient }
