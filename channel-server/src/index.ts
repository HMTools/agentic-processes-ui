#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { mkdirSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { randomUUID } from 'node:crypto'

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

const DISCOVERY_DIR = join(
  homedir(),
  '.claude',
  'agentic-processes',
  'channels'
)
const PARENT_PID = process.ppid
const DISCOVERY_FILE = join(DISCOVERY_DIR, `${PARENT_PID}.json`)

function writeDiscovery(port: number, connected: boolean): void {
  mkdirSync(DISCOVERY_DIR, { recursive: true })
  writeFileSync(
    DISCOVERY_FILE,
    JSON.stringify({
      port,
      parentPid: PARENT_PID,
      mcpConnected: connected,
      startedAt: new Date().toISOString(),
    })
  )
}

function removeDiscovery(): void {
  try {
    if (existsSync(DISCOVERY_FILE)) unlinkSync(DISCOVERY_FILE)
  } catch {
    // best-effort cleanup
  }
}

process.on('exit', removeDiscovery)
process.on('SIGTERM', () => { removeDiscovery(); process.exit(0) })
process.on('SIGINT', () => { removeDiscovery(); process.exit(0) })

// ---------------------------------------------------------------------------
// SSE listeners (for reply tool → UI)
// ---------------------------------------------------------------------------

type SSEWriter = (chunk: string) => void
const sseListeners = new Set<SSEWriter>()

function broadcastSSE(event: string, data: unknown): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  for (const write of sseListeners) write(payload)
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------

const mcp = new Server(
  { name: 'agentic-processes', version: '1.0.0' },
  {
    capabilities: {
      experimental: { 'claude/channel': {} },
      tools: {},
    },
    instructions: [
      'Messages from the agentic-processes UI arrive as <channel source="agentic-processes" ...>.',
      'Each message has a correlationId attribute for tracking.',
      '',
      'How to handle incoming messages:',
      '- If the content starts with a slash command (e.g. /process-continue <path>), execute it as if the user typed it.',
      '- If the content matches an option label for a pending interaction, select that option.',
      '- For general text, treat it as a user instruction and act on it.',
      '',
      'After processing each message, call the channel_reply tool with:',
      '- correlationId: the correlationId from the <channel> tag attributes',
      '- type: "ack" for acknowledgement, "result" for completed work, "error" for failures',
      '- message: a brief description of what was done or what went wrong',
    ].join('\n'),
  }
)

// -- Reply tool --------------------------------------------------------------

mcp.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'channel_reply',
      description:
        'Send a reply back to the agentic-processes UI after processing a channel message.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          correlationId: {
            type: 'string',
            description: 'The correlationId from the incoming <channel> tag attributes.',
          },
          type: {
            type: 'string',
            enum: ['ack', 'result', 'error'],
            description: 'The type of reply.',
          },
          message: {
            type: 'string',
            description: 'A brief description of what was done or what went wrong.',
          },
        },
        required: ['correlationId', 'type', 'message'],
      },
    },
  ],
}))

mcp.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (req.params.name === 'channel_reply') {
    const { correlationId, type, message } = req.params.arguments as {
      correlationId: string
      type: string
      message: string
    }

    broadcastSSE('reply', {
      correlationId,
      type,
      message,
      timestamp: new Date().toISOString(),
    })

    return { content: [{ type: 'text', text: 'Reply sent to UI.' }] }
  }

  throw new Error(`Unknown tool: ${req.params.name}`)
})

// ---------------------------------------------------------------------------
// HTTP Server (for UI → channel)
// ---------------------------------------------------------------------------

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    req.on('error', reject)
  })
}

function sendJSON(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

let httpPort = 0
let mcpConnected = false

const httpServer = createServer(async (req, res) => {
  // CORS for Electron renderer
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url ?? '/', `http://localhost:${httpPort}`)

  // -- GET /health -----------------------------------------------------------
  if (req.method === 'GET' && url.pathname === '/health') {
    sendJSON(res, 200, {
      ok: true,
      port: httpPort,
      parentPid: PARENT_PID,
      mcpConnected,
    })
    return
  }

  // -- GET /events (SSE) -----------------------------------------------------
  if (req.method === 'GET' && url.pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })
    res.write(': connected\n\n')

    const write: SSEWriter = (chunk) => res.write(chunk)
    sseListeners.add(write)
    req.on('close', () => sseListeners.delete(write))
    return
  }

  // -- POST /prompt ----------------------------------------------------------
  if (req.method === 'POST' && url.pathname === '/prompt') {
    try {
      const raw = await readBody(req)
      const body = JSON.parse(raw) as {
        prompt: string
        correlationId?: string
        meta?: Record<string, string>
      }

      if (!body.prompt || typeof body.prompt !== 'string') {
        sendJSON(res, 400, { error: 'Missing or invalid "prompt" field.' })
        return
      }

      const correlationId = body.correlationId ?? randomUUID()
      const meta: Record<string, string> = {
        ...body.meta,
        correlationId,
      }

      await mcp.notification({
        method: 'notifications/claude/channel',
        params: { content: body.prompt, meta },
      })

      sendJSON(res, 200, { ok: true, correlationId })
    } catch (err) {
      sendJSON(res, 500, {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
    return
  }

  // -- 404 -------------------------------------------------------------------
  sendJSON(res, 404, { error: 'Not found' })
})

// ---------------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  // Connect to Claude Code over stdio
  await mcp.connect(new StdioServerTransport())
  mcpConnected = true

  // Start HTTP server on OS-assigned port (localhost only)
  await new Promise<void>((resolve) => {
    httpServer.listen(0, '127.0.0.1', () => {
      const addr = httpServer.address()
      if (addr && typeof addr === 'object') {
        httpPort = addr.port
      }
      resolve()
    })
  })

  // Write discovery file so the UI can find us
  writeDiscovery(httpPort, mcpConnected)
}

main().catch((err) => {
  process.stderr.write(`Channel server failed to start: ${err}\n`)
  process.exit(1)
})
