import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'
import { connect as netConnect } from 'net'
import { homedir } from 'os'
import { join } from 'path'
import { platform } from 'os'

// ============================================================================
// Herdr local socket API client.
// Docs: https://herdr.dev/docs/socket-api/
// Newline-delimited JSON, one request/response per connection - the server
// closes the socket right after writing the response (confirmed empirically
// against a live server; earlier code assumed a persistent multiplexed
// connection, which fails with EPIPE on the second call). Every call below
// opens its own short-lived connection.
// Every other module talks to Herdr only through this file.
// ============================================================================

export type HerdrConnectionStatus = 'connected' | 'disconnected'

const PING_INTERVAL_MS = 5000

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
  private status: HerdrConnectionStatus = 'disconnected'
  private lastError: string | null = null
  private pingTimer: NodeJS.Timeout | null = null

  connect(): void {
    if (this.pingTimer) return
    this.pingTimer = setInterval(() => this.checkStatus(), PING_INTERVAL_MS)
    this.checkStatus()
  }

  disconnect(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
    this.setStatus('disconnected', null)
  }

  private async checkStatus(): Promise<void> {
    try {
      await this.call('ping', {}, 3000)
      this.setStatus('connected', null)
    } catch (err) {
      this.setStatus('disconnected', err instanceof Error ? err.message : 'Herdr socket unreachable')
    }
  }

  private setStatus(status: HerdrConnectionStatus, error: string | null): void {
    if (status === this.status && error === this.lastError) return
    this.status = status
    this.lastError = error
    this.emit('connection-status', { status, error })
  }

  getStatus(): { status: HerdrConnectionStatus; error: string | null; socketPath: string } {
    return { status: this.status, error: this.lastError, socketPath: resolveSocketPath() }
  }

  call<T = any>(method: string, params?: Record<string, unknown>, timeoutMs = 10000): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const socket = netConnect(resolveSocketPath())
      let buffer = ''
      let settled = false

      const finish = (fn: () => void) => {
        if (settled) return
        settled = true
        clearTimeout(timeout)
        socket.destroy()
        fn()
      }

      const timeout = setTimeout(() => {
        finish(() => reject(new Error(`Herdr call "${method}" timed out after ${timeoutMs}ms`)))
      }, timeoutMs)

      socket.once('connect', () => {
        const payload = JSON.stringify({ id: randomUUID(), method, params: params ?? {} }) + '\n'
        socket.write(payload, (err) => {
          if (err) finish(() => reject(err))
        })
      })

      socket.on('data', (chunk: Buffer) => {
        buffer += chunk.toString('utf-8')
        const idx = buffer.indexOf('\n')
        if (idx < 0) return
        const line = buffer.slice(0, idx)
        finish(() => {
          let msg: any
          try {
            msg = JSON.parse(line)
          } catch {
            reject(new Error(`Malformed response from Herdr for "${method}"`))
            return
          }
          if (msg.error) reject(new Error(msg.error.message || msg.error.code || 'Herdr call failed'))
          else resolve(msg.result)
        })
      })

      socket.on('error', (err) => finish(() => reject(err)))
    })
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
