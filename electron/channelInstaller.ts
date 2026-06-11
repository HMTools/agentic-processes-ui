import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { homedir } from 'os'
import { fileURLToPath } from 'url'

const __installerFilename = fileURLToPath(import.meta.url)
const __installerDirname = dirname(__installerFilename)

const CLAUDE_CONFIG_PATH = join(homedir(), '.claude.json')
const SERVER_NAME = 'agentic-processes-channel'

function getChannelServerPath(): string {
  // In packaged app: resources/channel-server/dist/index.js
  // In dev: ../channel-server/dist/index.js (relative to dist-electron/)
  const devPath = resolve(__installerDirname, '..', 'channel-server', 'dist', 'index.js')
  if (existsSync(devPath)) return devPath

  // Packaged app: channel-server is bundled via extraResources in electron-builder.yml
  const prodPath = resolve(process.resourcesPath ?? __installerDirname, 'channel-server', 'dist', 'index.js')
  if (existsSync(prodPath)) return prodPath

  return devPath // fallback to dev path
}

function readClaudeConfig(): Record<string, unknown> {
  if (!existsSync(CLAUDE_CONFIG_PATH)) return {}
  try {
    return JSON.parse(readFileSync(CLAUDE_CONFIG_PATH, 'utf-8'))
  } catch {
    return {}
  }
}

function writeClaudeConfig(config: Record<string, unknown>): void {
  writeFileSync(CLAUDE_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
}

export function isChannelInstalled(): boolean {
  const config = readClaudeConfig()
  const mcpServers = (config.mcpServers ?? {}) as Record<string, unknown>
  return SERVER_NAME in mcpServers
}

export function getInstalledChannelPath(): string | null {
  const config = readClaudeConfig()
  const mcpServers = (config.mcpServers ?? {}) as Record<string, unknown>
  const entry = mcpServers[SERVER_NAME] as { args?: string[] } | undefined
  return entry?.args?.[0] ?? null
}

/**
 * Detect whether the app is running in development mode.
 * In dev mode, the channel server path points to a local dev build rather than a packaged resource.
 */
export function isDevMode(isPackaged?: boolean): boolean {
  if (typeof isPackaged === 'boolean') return !isPackaged
  // Fallback: check if the server path resolves to a dev location (outside resources/)
  const serverPath = getChannelServerPath()
  return !serverPath.includes('resources')
}

/**
 * Get dev-mode instructions for the user.
 * Returns null for packaged apps (no special flags needed).
 */
export function getDevModeInstructions(isPackaged?: boolean): string | null {
  if (!isDevMode(isPackaged)) return null
  return 'Development mode: Claude Code sessions need the --dangerously-load-development-channels flag to connect to this channel server.'
}

export function installChannelGlobally(isDev?: boolean): { success: boolean; error?: string } {
  try {
    const serverPath = getChannelServerPath()
    if (!existsSync(serverPath)) {
      return { success: false, error: `Channel server not found at: ${serverPath}. Build the channel server first.` }
    }

    const config = readClaudeConfig()
    const mcpServers = (config.mcpServers ?? {}) as Record<string, unknown>

    const mcpEntry: Record<string, unknown> = {
      command: 'node',
      args: [serverPath],
    }

    // In dev mode, add env flag so the channel server knows it's running in development
    if (isDev) {
      mcpEntry.env = { CHANNEL_DEV_MODE: 'true' }
    }

    mcpServers[SERVER_NAME] = mcpEntry

    config.mcpServers = mcpServers
    writeClaudeConfig(config)
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export function uninstallChannelGlobally(): { success: boolean; error?: string } {
  try {
    const config = readClaudeConfig()
    const mcpServers = (config.mcpServers ?? {}) as Record<string, unknown>

    if (!(SERVER_NAME in mcpServers)) {
      return { success: true } // already uninstalled
    }

    delete mcpServers[SERVER_NAME]
    config.mcpServers = mcpServers
    writeClaudeConfig(config)
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
