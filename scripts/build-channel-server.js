#!/usr/bin/env node

/**
 * Pre-build script for the channel-server sub-project.
 * Compiles TypeScript and installs production dependencies
 * so electron-builder can bundle via extraResources.
 *
 * Usage: node scripts/build-channel-server.js
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const channelServerDir = resolve(__dirname, '..', 'channel-server')

function run(cmd, cwd) {
  console.log(`[build-channel-server] Running: ${cmd}`)
  execSync(cmd, { cwd, stdio: 'inherit' })
}

// 1. Install channel-server dependencies
console.log('[build-channel-server] Installing channel-server dependencies...')
run('npm ci', channelServerDir)

// 2. Build TypeScript
console.log('[build-channel-server] Compiling TypeScript...')
run('npm run build', channelServerDir)

// 3. Remove devDependencies for a lean bundle
console.log('[build-channel-server] Pruning devDependencies...')
run('npm prune --omit=dev', channelServerDir)

// 4. Verify output
const distIndex = resolve(channelServerDir, 'dist', 'index.js')
if (!existsSync(distIndex)) {
  console.error(`[build-channel-server] ERROR: ${distIndex} not found after build`)
  process.exit(1)
}

console.log('[build-channel-server] Channel server built successfully.')
