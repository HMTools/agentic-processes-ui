import { watch, type FSWatcher } from 'chokidar'
import { readFile, readdir, stat } from 'fs/promises'
import { join, basename, dirname } from 'path'
import { existsSync } from 'fs'

export type FileType = 'process' | 'memory' | 'log'

export type WatcherCallback = (
  event: 'added' | 'changed' | 'removed', 
  fileType: FileType,
  data: { path: string; processPath: string; content?: unknown }
) => void

export type ErrorCallback = (error: string) => void

let watcher: FSWatcher | null = null

export function createFileWatcher(
  projectPath: string, 
  callback: WatcherCallback,
  onError?: ErrorCallback
): { success: boolean; error?: string } {
  // Stop existing watcher if any
  stopFileWatcher()

  const userProcessesPath = join(projectPath, '.user-processes')
  
  console.log('Starting file watcher for:', userProcessesPath)
  console.log('Path exists:', existsSync(userProcessesPath))

  // Check if .user-processes folder exists
  if (!existsSync(userProcessesPath)) {
    const error = `The ".user-processes" folder was not found in "${projectPath}". Please ensure this folder exists with active/completed/failed subdirectories containing process.json files.`
    console.error(error)
    if (onError) onError(error)
    return { success: false, error }
  }

  // Watch the entire .user-processes directory
  watcher = watch(userProcessesPath, {
    persistent: true,
    ignoreInitial: false,
    usePolling: true,
    interval: 1000,
    depth: 3,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100
    }
  })

  const isInProcessFolder = (path: string) => {
    const normalized = path.replace(/\\/g, '/')
    return normalized.includes('/active/') || 
           normalized.includes('/completed/') || 
           normalized.includes('/failed/')
  }

  const getFileType = (path: string): FileType | null => {
    const normalized = path.replace(/\\/g, '/')
    if (normalized.endsWith('/process.json')) return 'process'
    if (normalized.endsWith('/memory.json')) return 'memory'
    if (normalized.endsWith('/log.json')) return 'log'
    return null
  }

  const getProcessPath = (filePath: string): string => {
    // Get the process.json path from any file in the same directory
    const dir = dirname(filePath)
    return join(dir, 'process.json')
  }

  watcher.on('add', async (path) => {
    const fileType = getFileType(path)
    if (!fileType || !isInProcessFolder(path)) {
      return
    }
    
    console.log(`${fileType}.json found:`, path)
    try {
      const content = await readFile(path, 'utf-8')
      const parsed = JSON.parse(content)
      const processPath = getProcessPath(path)
      console.log(`${fileType} parsed for process:`, processPath)
      callback('added', fileType, { path, processPath, content: parsed })
    } catch (error) {
      console.error(`Error reading ${fileType}.json:`, path, error)
    }
  })

  watcher.on('change', async (path) => {
    const fileType = getFileType(path)
    if (!fileType || !isInProcessFolder(path)) return
    
    console.log(`${fileType}.json changed:`, path)
    try {
      const content = await readFile(path, 'utf-8')
      const parsed = JSON.parse(content)
      const processPath = getProcessPath(path)
      callback('changed', fileType, { path, processPath, content: parsed })
    } catch (error) {
      console.error(`Error reading ${fileType}.json:`, path, error)
    }
  })

  watcher.on('unlink', (path) => {
    const fileType = getFileType(path)
    if (!fileType || !isInProcessFolder(path)) return
    
    console.log(`${fileType}.json removed:`, path)
    const processPath = getProcessPath(path)
    callback('removed', fileType, { path, processPath })
  })

  watcher.on('error', (error) => {
    console.error('Watcher error:', error)
    if (onError) {
      onError(`File watcher error: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  watcher.on('ready', () => {
    console.log('File watcher ready')
  })

  return { success: true }
}

export function stopFileWatcher() {
  if (watcher) {
    watcher.close()
    watcher = null
    console.log('File watcher stopped')
  }
}

// Utility to get process status from path
export function getStatusFromPath(filePath: string): 'active' | 'completed' | 'failed' | null {
  const normalized = filePath.replace(/\\/g, '/')
  
  if (normalized.includes('/active/')) return 'active'
  if (normalized.includes('/completed/')) return 'completed'
  if (normalized.includes('/failed/')) return 'failed'
  return null
}
