import { app, BrowserWindow, ipcMain, dialog, Menu, clipboard } from 'electron'
import { join, dirname, extname } from 'path'
import { homedir } from 'os'
import { fileURLToPath } from 'url'
import { readFile, readdir, stat, rm } from 'fs/promises'
import { existsSync } from 'fs'
import { watch, type FSWatcher } from 'chokidar'
import { autoUpdater } from 'electron-updater'
import { createFileWatcher, stopFileWatcher, stopAllFileWatchers } from './fileWatcher'
import {
  getAgentManager,
  cleanupAgentManager,
  AGENT_CONFIGS,
  type AgentType,
  type AgentOutputEvent,
  type AgentStatusEvent,
  type ActiveProcessInfo,
  type ExternalSession
} from './agentSessionManager'
import {
  getChannelManager,
  startChannelManager,
  stopChannelManager,
  type ChannelAvailableEvent,
  type ChannelRemovedEvent,
  type ChannelReply,
} from './channelManager'
import {
  isChannelInstalled,
  installChannelGlobally,
  uninstallChannelGlobally,
  getInstalledChannelPath,
} from './channelInstaller'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// dist-electron/main.js -> agentic-processes-ui -> HM -> agentic-processes (sibling repo)
const AGENTIC_PROCESSES_REPO = join(__dirname, '..', '..', 'agentic-processes')

let mainWindow: BrowserWindow | null = null
let fileContentWatchers: Map<string, FSWatcher> = new Map()
let agentManagerInitialized = false
let terminalWindows: Map<string, BrowserWindow> = new Map()
let overviewWindows: Map<string, BrowserWindow> = new Map()

// Cached process map for serving initial snapshots to overview windows
let cachedProcesses: Map<string, unknown> = new Map()

function broadcastToRenderers(channel: string, data: unknown) {
  mainWindow?.webContents.send(channel, data)
  for (const [, win] of overviewWindows) {
    if (!win.isDestroyed()) win.webContents.send(channel, data)
  }
}

function createWindow() {
  const iconPath = join(__dirname, '../images/icon.png')
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    icon: existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: '#0d1117',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
    
    // Filter out harmless DevTools protocol errors
    mainWindow.webContents.on('console-message', (_event, level, message) => {
      // Suppress Autofill DevTools protocol errors (they're harmless in Electron)
      if (message.includes('Autofill.enable') || message.includes('Autofill.setAddresses')) {
        return
      }
    })
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Create a detached terminal window for an agent session
function createTerminalWindow(sessionId: string, processPath: string, processName: string) {
  // If a window already exists for this session, focus it
  const existing = terminalWindows.get(sessionId)
  if (existing && !existing.isDestroyed()) {
    existing.focus()
    return
  }

  const iconPath = join(__dirname, '../images/icon.png')
  const terminalWin = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    icon: existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: '#0d1117',
    title: processName || 'Agent Terminal',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // Remove menu bar for terminal windows
  terminalWin.setMenuBarVisibility(false)

  const queryParams = `?sessionId=${encodeURIComponent(sessionId)}&processPath=${encodeURIComponent(processPath)}&processName=${encodeURIComponent(processName)}`

  if (process.env.VITE_DEV_SERVER_URL) {
    terminalWin.loadURL(`${process.env.VITE_DEV_SERVER_URL}terminal-window.html${queryParams}`)
  } else {
    terminalWin.loadFile(join(__dirname, '../dist/terminal-window.html'), {
      search: queryParams
    })
  }

  terminalWindows.set(sessionId, terminalWin)

  terminalWin.on('closed', () => {
    terminalWindows.delete(sessionId)
  })
}

// Auto-update IPC handlers
ipcMain.handle('update:get-current-version', () => {
  return app.getVersion()
})

ipcMain.handle('update:quit-and-install', () => {
  autoUpdater.quitAndInstall()
})

ipcMain.handle('update:start-download', () => {
  return autoUpdater.downloadUpdate()
})

// IPC Handlers
ipcMain.handle('select-project-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Select Project Folder'
  })

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

ipcMain.handle('start-watching', async (_event, projectPath: string) => {
  if (mainWindow) {
    const result = await createFileWatcher(
      projectPath,
      async (event, fileType, data) => {
        switch (fileType) {
          case 'process':
            if (event === 'added' || event === 'changed') {
              cachedProcesses.set(data.processPath, data.content)
            } else if (event === 'removed') {
              cachedProcesses.delete(data.processPath)
            }
            broadcastToRenderers('process-update', {
              event,
              data: { path: data.processPath, process: data.content }
            })
            break
          case 'memory':
            // On any memory topic file change, re-read all topic files and emit combined state
            try {
              const memDir = join(dirname(data.processPath), 'memory')
              if (existsSync(memDir)) {
                const memEntries = await readdir(memDir)
                const topics: Record<string, unknown> = {}
                for (const me of memEntries) {
                  if (!me.endsWith('.json')) continue
                  try {
                    const mc = await readFile(join(memDir, me), 'utf-8')
                    topics[me.replace(/\.json$/, '')] = JSON.parse(mc)
                  } catch { /* skip unreadable files */ }
                }
                broadcastToRenderers('memory-update', {
                  event,
                  processPath: data.processPath,
                  memory: topics
                })
              }
            } catch (memErr) {
              console.error('Error aggregating memory topics:', memErr)
            }
            break
          case 'log':
            broadcastToRenderers('log-update', {
              event,
              processPath: data.processPath,
              log: data.content
            })
            break
          case 'pending-interaction':
            broadcastToRenderers('pending-interaction-update', {
              event,
              processPath: data.processPath,
              pendingInteraction: data.content
            })
            break
          case 'qa-session':
            broadcastToRenderers('qa-session-update', {
              event,
              processPath: data.processPath,
              qaSession: data.content
            })
            break
        }
      },
      (error) => {
        broadcastToRenderers('watcher-error', { error })
      }
    )

    if (!result.success) {
      return { success: false, error: result.error }
    }
  }
  return { success: true }
})

ipcMain.handle('stop-watching', (_event, projectPath?: string) => {
  stopFileWatcher(projectPath)
  return true
})

ipcMain.handle('stop-all-watching', () => {
  stopAllFileWatchers()
  return true
})

ipcMain.handle('read-process-file', async (_event, processPath: string, fileName: string) => {
  try {
    // processPath is the full path to process.json, get the directory
    const processDir = dirname(processPath)
    const filePath = join(processDir, fileName)
    
    if (!existsSync(filePath)) {
      console.log(`File not found: ${filePath}`)
      return null
    }
    
    const content = await readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error(`Error reading ${fileName}:`, error)
    return null
  }
})

// Read all memory topic files from the memory/ directory
ipcMain.handle('read-memory-directory', async (_event, processPath: string) => {
  try {
    const processDir = dirname(processPath)
    const memoryDir = join(processDir, 'memory')

    if (!existsSync(memoryDir)) {
      console.log(`Memory directory not found: ${memoryDir}`)
      return null
    }

    const entries = await readdir(memoryDir)
    const topics: Record<string, unknown> = {}

    for (const entry of entries) {
      if (!entry.endsWith('.json')) continue
      const filePath = join(memoryDir, entry)
      try {
        const content = await readFile(filePath, 'utf-8')
        const topicName = entry.replace(/\.json$/, '')
        topics[topicName] = JSON.parse(content)
      } catch (err) {
        console.error(`Error reading memory topic file: ${filePath}`, err)
      }
    }

    return topics
  } catch (error) {
    console.error('Error reading memory directory:', error)
    return null
  }
})

// List all .md and .json files in a process directory
ipcMain.handle('list-process-files', async (_event, processPath: string) => {
  try {
    const processDir = dirname(processPath)

    if (!existsSync(processDir)) {
      console.log(`Process directory not found: ${processDir}`)
      return []
    }

    const entries = await readdir(processDir)
    const files = []

    for (const entry of entries) {
      const ext = extname(entry).toLowerCase()
      if (ext === '.md' || ext === '.json') {
        const filePath = join(processDir, entry)
        const fileStat = await stat(filePath)

        if (fileStat.isFile()) {
          files.push({
            name: entry,
            path: filePath,
            type: ext === '.md' ? 'markdown' : 'json',
            size: fileStat.size,
            modifiedAt: fileStat.mtime.toISOString()
          })
        }
      }
    }

    // Sort alphabetically
    files.sort((a, b) => a.name.localeCompare(b.name))
    
    return files
  } catch (error) {
    console.error('Error listing process files:', error)
    return []
  }
})

// Read raw file content (not parsed as JSON)
ipcMain.handle('read-file-content', async (_event, filePath: string) => {
  try {
    if (!existsSync(filePath)) {
      console.log(`File not found: ${filePath}`)
      return null
    }
    
    const content = await readFile(filePath, 'utf-8')
    return content
  } catch (error) {
    console.error(`Error reading file content: ${filePath}`, error)
    return null
  }
})

// Watch a specific file for changes (hot reload)
ipcMain.handle('watch-file', (_event, filePath: string) => {
  // Don't create duplicate watchers
  if (fileContentWatchers.has(filePath)) {
    return true
  }
  
  if (!existsSync(filePath)) {
    console.log(`Cannot watch non-existent file: ${filePath}`)
    return false
  }
  
  console.log(`Starting file content watcher for: ${filePath}`)
  
  const fileWatcher = watch(filePath, {
    persistent: true,
    usePolling: true,
    interval: 500,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100
    }
  })
  
  fileWatcher.on('change', async (path) => {
    console.log(`File content changed: ${path}`)
    try {
      const content = await readFile(path, 'utf-8')
      broadcastToRenderers('file-content-update', {
        filePath: path,
        content
      })
    } catch (error) {
      console.error(`Error reading changed file: ${path}`, error)
    }
  })

  fileWatcher.on('unlink', (path) => {
    console.log(`Watched file removed: ${path}`)
    broadcastToRenderers('file-content-update', {
      filePath: path,
      content: null,
      removed: true
    })
  })
  
  fileContentWatchers.set(filePath, fileWatcher)
  return true
})

// Stop watching a specific file
ipcMain.handle('unwatch-file', (_event, filePath: string) => {
  const fileWatcher = fileContentWatchers.get(filePath)
  if (fileWatcher) {
    fileWatcher.close()
    fileContentWatchers.delete(filePath)
    console.log(`Stopped watching file: ${filePath}`)
  }
  return true
})

// Delete a process instance
ipcMain.handle('delete-process-instance', async (_event, processPath: string) => {
  try {
    // Extract the directory path from the process.json path
    const processDir = dirname(processPath)

    // Validate path is within agentic-processes
    if (!processDir.includes('agentic-processes')) {
      return { success: false, error: 'Invalid path: not in agentic-processes' }
    }

    // Check if directory exists
    if (!existsSync(processDir)) {
      return { success: false, error: 'Process directory not found' }
    }

    // Delete the directory recursively
    await rm(processDir, { recursive: true, force: true })

    console.log(`Deleted process directory: ${processDir}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting process instance:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
})

// ============================================================================
// Q&A Session IPC Handlers
// ============================================================================

// Read qa-session.json for a process
ipcMain.handle('read-qa-session', async (_event, processPath: string) => {
  try {
    const processDir = dirname(processPath)
    const qaSessionPath = join(processDir, 'qa-session.json')

    // Validate path is within agentic-processes
    if (!processDir.includes('agentic-processes')) {
      console.error('Invalid path: not in agentic-processes')
      return null
    }

    if (!existsSync(qaSessionPath)) {
      return null
    }

    const content = await readFile(qaSessionPath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Error reading qa-session.json:', error)
    return null
  }
})

// Submit an answer to a question
ipcMain.handle('answer-question', async (_event, processPath: string, questionId: string, answer: string) => {
  try {
    const processDir = dirname(processPath)

    // Validate path is within agentic-processes
    if (!processDir.includes('agentic-processes')) {
      return { success: false, error: 'Invalid path' }
    }

    // Validate inputs
    if (!questionId || typeof questionId !== 'string') {
      return { success: false, error: 'Invalid question ID' }
    }

    if (!answer || typeof answer !== 'string') {
      return { success: false, error: 'Invalid answer' }
    }

    // Sanitize inputs for command execution
    const sanitizedQuestionId = questionId.replace(/[^\w-]/g, '')
    const sanitizedAnswer = answer.replace(/[\r\n]+/g, ' ').trim()

    // Execute Python script to update Q&A answer via process_manager.py
    // TODO: Make script path configurable in settings
    const { spawn } = await import('child_process')
    const pythonProcess = spawn('python3', [
      'scripts/process_manager.py',
      'update-qa-answer',
      processPath,
      sanitizedQuestionId,
      sanitizedAnswer
    ], {
      cwd: AGENTIC_PROCESSES_REPO
    })

    let stdout = ''
    let stderr = ''

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    return new Promise((resolve) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true })
        } else {
          console.error(`Python script failed with code ${code}:`, stderr)
          resolve({ success: false, error: 'Failed to update answer' })
        }
      })
    })
  } catch (error) {
    console.error('Error answering question:', error)
    return {
      success: false,
      error: 'Internal error'
    }
  }
})

// Mark a question as complete
ipcMain.handle('complete-question', async (_event, processPath: string, questionId: string) => {
  try {
    const processDir = dirname(processPath)

    // Validate path is within agentic-processes
    if (!processDir.includes('agentic-processes')) {
      return { success: false, error: 'Invalid path' }
    }

    // Validate inputs
    if (!questionId || typeof questionId !== 'string') {
      return { success: false, error: 'Invalid question ID' }
    }

    // Sanitize input for command execution
    const sanitizedQuestionId = questionId.replace(/[^\w-]/g, '')

    // Execute Python script to complete question via process_manager.py
    // TODO: Make script path configurable in settings
    const { spawn } = await import('child_process')
    const pythonProcess = spawn('python3', [
      'scripts/process_manager.py',
      'complete-qa-question',
      processPath,
      sanitizedQuestionId
    ], {
      cwd: AGENTIC_PROCESSES_REPO
    })

    let stdout = ''
    let stderr = ''

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    return new Promise((resolve) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true })
        } else {
          console.error(`Python script failed with code ${code}:`, stderr)
          resolve({ success: false, error: 'Failed to complete question' })
        }
      })
    })
  } catch (error) {
    console.error('Error completing question:', error)
    return {
      success: false,
      error: 'Internal error'
    }
  }
})

// Get Q&A session status
ipcMain.handle('get-qa-session-status', async (_event, processPath: string) => {
  try {
    const processDir = dirname(processPath)
    const qaSessionPath = join(processDir, 'qa-session.json')

    // Validate path is within agentic-processes
    if (!processDir.includes('agentic-processes')) {
      return null
    }

    if (!existsSync(qaSessionPath)) {
      return null
    }

    const content = await readFile(qaSessionPath, 'utf-8')
    const session = JSON.parse(content)
    return session.status || null
  } catch (error) {
    console.error('Error reading qa-session status:', error)
    return null
  }
})

const STEP_EMBED_FIELDS = [
  'output', 'guidance', 'substeps', 'flow', 'memoryFileUsage', 'parameters',
  'improvementCategories', 'prioritization', 'workflow',
  'successCriteria', 'complianceChecklist', 'searchModes',
  'changeProposalFormat', 'captureTypes'
]

async function buildStepIdRegistry(templateDir: string): Promise<Map<string, string>> {
  const registry = new Map<string, string>() // uuid -> path
  if (!existsSync(templateDir)) return registry
  const entries = await readdir(templateDir, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const stepJsonPath = join(templateDir, entry.name, `${entry.name}.json`)
    if (existsSync(stepJsonPath)) {
      try {
        const content = await readFile(stepJsonPath, 'utf-8')
        const data = JSON.parse(content)
        if (data.type === 'step' && data.id) {
          registry.set(data.id, stepJsonPath)
        }
      } catch { /* skip invalid files */ }
    }
  }
  return registry
}

async function resolveStepDefinitions(template: any, templateDir: string) {
  if (!template.steps || !Array.isArray(template.steps)) return
  const registry = await buildStepIdRegistry(templateDir)
  for (const step of template.steps) {
    if (!step.stepRef) continue
    if (step.stepDefinition && Object.keys(step.stepDefinition).length > 0) continue
    const stepJsonPath = registry.get(step.stepRef)
    if (stepJsonPath && existsSync(stepJsonPath)) {
      try {
        const stepContent = await readFile(stepJsonPath, 'utf-8')
        const stepData = JSON.parse(stepContent)
        const embedded: Record<string, unknown> = {}
        for (const field of STEP_EMBED_FIELDS) {
          if (field in stepData) {
            embedded[field] = stepData[field]
          }
        }
        step.stepDefinition = embedded
      } catch (err) {
        console.error(`Error resolving step definition UUID ${step.stepRef}: ${stepJsonPath}`, err)
      }
    }
  }
}

// Load all process templates from ~/.claude/agentic-processes/templates/processes/ (unified)
ipcMain.handle('load-process-templates', async () => {
  try {
    const templatesPath = join(homedir(), '.claude', 'agentic-processes', 'templates', 'processes')

    if (!existsSync(templatesPath)) {
      console.log(`Templates directory not found: ${templatesPath}`)
      return []
    }

    const templates = []
    const categories = await readdir(templatesPath)

    for (const category of categories) {
      const categoryPath = join(templatesPath, category)
      const categoryStat = await stat(categoryPath)

      // Skip non-directories and special files
      if (!categoryStat.isDirectory() || category.startsWith('.') || category.startsWith('_')) {
        continue
      }

      // Check if this is a direct template folder (has .json file with same name)
      const directTemplateJson = join(categoryPath, `${category}.json`)
      if (existsSync(directTemplateJson)) {
        try {
          const content = await readFile(directTemplateJson, 'utf-8')
          const template = JSON.parse(content)
          if (template.type === 'template') {
            template.filePath = directTemplateJson
            await resolveStepDefinitions(template, categoryPath)
            templates.push(template)
          }
        } catch (err) {
          console.error(`Error reading template: ${directTemplateJson}`, err)
        }
        continue
      }

      // Otherwise, scan for template subdirectories
      const templateFolders = await readdir(categoryPath)

      for (const templateName of templateFolders) {
        const templatePath = join(categoryPath, templateName)
        const templateStat = await stat(templatePath)

        if (!templateStat.isDirectory() || templateName.startsWith('.') || templateName.startsWith('_')) {
          continue
        }

        const jsonPath = join(templatePath, `${templateName}.json`)

        if (existsSync(jsonPath)) {
          try {
            const content = await readFile(jsonPath, 'utf-8')
            const template = JSON.parse(content)

            if (template.type === 'template') {
              template.filePath = jsonPath
              await resolveStepDefinitions(template, templatePath)
              templates.push(template)
            }
          } catch (err) {
            console.error(`Error reading template: ${jsonPath}`, err)
          }
        }
      }
    }

    return templates
  } catch (error) {
    console.error('Error loading process templates:', error)
    return []
  }
})

// ============================================================================
// Clipboard IPC Handlers
// ============================================================================

ipcMain.handle('clipboard:read-text', () => {
  return clipboard.readText()
})

ipcMain.handle('clipboard:write-text', (_event, text: string) => {
  clipboard.writeText(text)
  return true
})

// ============================================================================
// Agent Session IPC Handlers
// ============================================================================

// Initialize agent manager and setup event forwarding
function initializeAgentManager() {
  if (agentManagerInitialized) return
  
  const agentManager = getAgentManager()
  
  // Forward output events to all windows (main + detached terminals)
  agentManager.on('output', (event: AgentOutputEvent) => {
    mainWindow?.webContents.send('agent:output', event)
    // Also forward to any detached terminal window for this session
    const terminalWin = terminalWindows.get(event.sessionId)
    if (terminalWin && !terminalWin.isDestroyed()) {
      terminalWin.webContents.send('agent:output', event)
    }
  })
  
  // Forward status events to all windows (main + detached terminals)
  agentManager.on('status', (event: AgentStatusEvent) => {
    mainWindow?.webContents.send('agent:status', event)
    // Also forward to any detached terminal window for this session
    const terminalWin = terminalWindows.get(event.sessionId)
    if (terminalWin && !terminalWin.isDestroyed()) {
      terminalWin.webContents.send('agent:status', event)
    }
  })
  
  agentManagerInitialized = true
}

// Get available agent types
ipcMain.handle('agent:get-available', () => {
  return Object.entries(AGENT_CONFIGS).map(([type, config]) => ({
    type,
    displayName: config.displayName,
    available: config.available
  }))
})

// Create a new agent session
ipcMain.handle('agent:create', async (_event, agentType: AgentType, workingDirectory: string, processPath?: string, options?: { permissionMode?: string }) => {
  try {
    initializeAgentManager()
    const agentManager = getAgentManager()
    const session = await agentManager.createSession(agentType, workingDirectory, processPath, {
      permissionMode: options?.permissionMode as 'regular' | 'allow-all' | undefined
    })
    return { success: true, session }
  } catch (error) {
    console.error('Error creating agent session:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
})

// Attach session to a process
ipcMain.handle('agent:attach', async (_event, sessionId: string, processPath: string) => {
  try {
    const agentManager = getAgentManager()
    await agentManager.attachToProcess(sessionId, processPath)
    return { success: true }
  } catch (error) {
    console.error('Error attaching to process:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
})

// Send a prompt to the agent
ipcMain.handle('agent:send-prompt', async (_event, sessionId: string, prompt: string) => {
  try {
    const agentManager = getAgentManager()
    await agentManager.sendPrompt(sessionId, prompt)
    return { success: true }
  } catch (error) {
    console.error('Error sending prompt:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
})

// Send raw input to the agent (keyboard events)
ipcMain.handle('agent:input', (_event, sessionId: string, data: string) => {
  try {
    const agentManager = getAgentManager()
    agentManager.sendInput(sessionId, data)
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
})

// Resize the terminal
ipcMain.handle('agent:resize', (_event, sessionId: string, cols: number, rows: number) => {
  try {
    const agentManager = getAgentManager()
    agentManager.resizeTerminal(sessionId, cols, rows)
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
})

// Kill a session
ipcMain.handle('agent:kill', (_event, sessionId: string) => {
  try {
    const agentManager = getAgentManager()
    agentManager.killSession(sessionId)
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
})

// List all sessions
ipcMain.handle('agent:list', () => {
  try {
    const agentManager = getAgentManager()
    return { success: true, sessions: agentManager.listSessions() }
  } catch (error) {
    return { 
      success: false, 
      sessions: [],
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
})

// Get a specific session
ipcMain.handle('agent:get', (_event, sessionId: string) => {
  try {
    const agentManager = getAgentManager()
    const session = agentManager.getSession(sessionId)
    return { success: true, session }
  } catch (error) {
    return { 
      success: false, 
      session: null,
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
})

// Open a detached terminal window
ipcMain.handle('agent:open-window', (_event, sessionId: string, processPath: string, processName: string) => {
  try {
    createTerminalWindow(sessionId, processPath, processName)
    return { success: true }
  } catch (error) {
    console.error('Error opening terminal window:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
})

// Close a detached terminal window
ipcMain.handle('agent:close-window', (_event) => {
  try {
    const win = BrowserWindow.getFocusedWindow()
    if (win && win !== mainWindow) {
      win.close()
    }
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
})

// Get window parameters (URL query params) for the terminal window
ipcMain.handle('agent:get-window-params', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) return null
  
  try {
    const url = win.webContents.getURL()
    const urlObj = new URL(url)
    return {
      sessionId: urlObj.searchParams.get('sessionId'),
      processPath: urlObj.searchParams.get('processPath'),
      processName: urlObj.searchParams.get('processName')
    }
  } catch {
    return null
  }
})

// Get sessions for a specific process
ipcMain.handle('agent:get-for-process', (_event, processPath: string) => {
  try {
    const agentManager = getAgentManager()
    const sessions = agentManager.getSessionsForProcess(processPath)
    return { success: true, sessions }
  } catch (error) {
    return { 
      success: false, 
      sessions: [],
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
})

// Discover external Claude Code sessions not managed by this app
ipcMain.handle('agent:discover-external', async (_event, activeProcesses: ActiveProcessInfo[]) => {
  try {
    initializeAgentManager()
    const agentManager = getAgentManager()
    const externalSessions = await agentManager.discoverExternalSessions(activeProcesses)

    // Convert Map to plain object for IPC serialization
    const sessionsObj: Record<string, ExternalSession> = {}
    for (const [key, value] of externalSessions) {
      sessionsObj[key] = value
    }

    return { success: true, sessions: sessionsObj }
  } catch (error) {
    console.error('Error discovering external sessions:', error)
    return {
      success: false,
      sessions: {},
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
})

// Migrate an external session into this app (kill external, resume in PTY)
ipcMain.handle('agent:migrate-external', async (_event, externalSession: ExternalSession, workingDirectory: string, options?: { permissionMode?: string }) => {
  try {
    initializeAgentManager()
    const agentManager = getAgentManager()
    const session = await agentManager.migrateExternalSession(externalSession, workingDirectory, {
      permissionMode: options?.permissionMode as 'regular' | 'allow-all' | undefined
    })
    return { success: true, session }
  } catch (error) {
    console.error('Error migrating external session:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
})

// ============================================================================
// Channel IPC Handlers
// ============================================================================

let channelManagerInitialized = false

function initializeChannelManager() {
  if (channelManagerInitialized) return
  channelManagerInitialized = true

  startChannelManager()
  const cm = getChannelManager()

  cm.on('channel-available', (event: ChannelAvailableEvent) => {
    broadcastToRenderers('channel:available', event)
  })

  cm.on('channel-removed', (event: ChannelRemovedEvent) => {
    broadcastToRenderers('channel:removed', event)
  })

  cm.on('channel-reply', (event: ChannelReply & { parentPid: number }) => {
    broadcastToRenderers('channel:reply', event)
  })
}

ipcMain.handle('channel:is-installed', () => {
  return isChannelInstalled()
})

ipcMain.handle('channel:get-installed-path', () => {
  return getInstalledChannelPath()
})

ipcMain.handle('channel:install', () => {
  return installChannelGlobally(!app.isPackaged)
})

ipcMain.handle('channel:uninstall', () => {
  return uninstallChannelGlobally()
})

ipcMain.handle('channel:list', () => {
  initializeChannelManager()
  return getChannelManager().listChannels()
})

ipcMain.handle('channel:get-for-pid', (_event, pid: number) => {
  initializeChannelManager()
  return getChannelManager().getChannelForPid(pid)
})

ipcMain.handle('channel:send-prompt', async (_event, port: number, prompt: string, meta?: Record<string, string>) => {
  initializeChannelManager()
  return getChannelManager().sendPrompt(port, prompt, meta)
})

ipcMain.handle('channel:check-health', async (_event, port: number) => {
  initializeChannelManager()
  return getChannelManager().checkHealth(port)
})

// ============================================================================
// Overview Window IPC Handlers
// ============================================================================

function createOverviewWindow() {
  const existing = overviewWindows.get('default')
  if (existing && !existing.isDestroyed()) {
    existing.focus()
    return
  }

  const iconPath = join(__dirname, '../images/icon.png')
  const overviewWin = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: '#0d1117',
    title: 'Processes Overview',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  overviewWin.setMenuBarVisibility(false)

  if (process.env.VITE_DEV_SERVER_URL) {
    overviewWin.loadURL(`${process.env.VITE_DEV_SERVER_URL}overview-window.html`)
  } else {
    overviewWin.loadFile(join(__dirname, '../dist/overview-window.html'))
  }

  overviewWindows.set('default', overviewWin)

  overviewWin.on('closed', () => {
    overviewWindows.delete('default')
  })
}

ipcMain.handle('overview:open-window', () => {
  try {
    createOverviewWindow()
    return { success: true }
  } catch (error) {
    console.error('Error opening overview window:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
})

ipcMain.handle('overview:get-window-params', () => {
  return null
})

ipcMain.handle('overview:get-current-processes', () => {
  const result: Record<string, unknown> = {}
  for (const [path, process] of cachedProcesses) {
    result[path] = process
  }
  return result
})

ipcMain.handle('overview:navigate-to-process', (_event, processPath: string) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('navigate-to-process-request', processPath)
    mainWindow.focus()
  }
  return { success: true }
})

// ============================================================================
// Marketplace IPC Handlers
// ============================================================================

async function runMarketplaceCommand(args: string[]): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const { spawn } = await import('child_process')
  return new Promise((resolve) => {
    const proc = spawn('python3', ['scripts/template_manager.py', ...args], {
      cwd: AGENTIC_PROCESSES_REPO
    })

    let stdout = ''
    let stderr = ''
    proc.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString() })
    proc.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString() })

    proc.on('close', (code) => {
      if (code === 0) {
        try {
          resolve({ success: true, data: JSON.parse(stdout) })
        } catch {
          resolve({ success: false, error: 'Failed to parse response' })
        }
      } else {
        let errorMsg = stderr || 'Command failed'
        try {
          const parsed = JSON.parse(stdout)
          if (parsed.message) errorMsg = parsed.message
        } catch { /* use stderr */ }
        resolve({ success: false, error: errorMsg })
      }
    })

    proc.on('error', (err) => {
      resolve({ success: false, error: err.message })
    })
  })
}

ipcMain.handle('marketplace:list', async () => {
  return runMarketplaceCommand(['list-marketplaces'])
})

ipcMain.handle('marketplace:add', async (_event, name: string, url: string, branch: string, priority: number) => {
  return runMarketplaceCommand([
    'add-marketplace',
    '--name', name,
    '--url', url,
    '--branch', branch,
    '--priority', String(priority)
  ])
})

ipcMain.handle('marketplace:remove', async (_event, name: string) => {
  return runMarketplaceCommand(['remove-marketplace', '--name', name])
})

ipcMain.handle('marketplace:toggle', async (_event, name: string) => {
  return runMarketplaceCommand(['toggle-marketplace', '--name', name])
})

ipcMain.handle('marketplace:update', async (_event, name: string, updates: { newName?: string; url?: string; branch?: string; priority?: number }) => {
  const args = ['update-marketplace', '--name', name]
  if (updates.newName) args.push('--new-name', updates.newName)
  if (updates.url) args.push('--url', updates.url)
  if (updates.branch) args.push('--branch', updates.branch)
  if (updates.priority !== undefined) args.push('--priority', String(updates.priority))
  return runMarketplaceCommand(args)
})

ipcMain.handle('marketplace:refresh', async (_event, marketplaceName?: string) => {
  const args = ['refresh']
  if (marketplaceName) args.push('--marketplace', marketplaceName)
  return runMarketplaceCommand(args)
})

ipcMain.handle('marketplace:status', async () => {
  return runMarketplaceCommand(['status'])
})

ipcMain.handle('marketplace:catalog', async () => {
  return runMarketplaceCommand(['catalog'])
})

ipcMain.handle('marketplace:install', async (_event, marketplace: string, template: string, category: string, type: string) => {
  return runMarketplaceCommand([
    'install',
    '--marketplace', marketplace,
    '--template', template,
    '--category', category,
    '--type', type
  ])
})

ipcMain.handle('marketplace:uninstall', async (_event, template: string, type: string) => {
  return runMarketplaceCommand(['uninstall', '--template', template, '--type', type])
})

// Single-instance lock: prevent multiple instances from conflicting
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// Set the app name (shows in Dock and menu)
app.name = 'Agentic Processes UI'

// App lifecycle
app.whenReady().then(() => {
  // Remove default menu bar
  Menu.setApplicationMenu(null)

  // Set the Dock icon on macOS
  if (process.platform === 'darwin') {
    const iconPath = join(__dirname, '../images/icon.png')
    if (existsSync(iconPath)) {
      app.dock.setIcon(iconPath)
    }
  }

  createWindow()

  // Start channel discovery on app launch
  initializeChannelManager()

  // Auto-update (production only)
  if (!process.env.VITE_DEV_SERVER_URL) {
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = true

    autoUpdater.on('checking-for-update', () => {
      mainWindow?.webContents.send('update:status', { status: 'checking' })
    })

    autoUpdater.on('update-available', (info) => {
      mainWindow?.webContents.send('update:status', {
        status: 'available',
        version: info.version,
      })
    })

    autoUpdater.on('update-not-available', () => {
      mainWindow?.webContents.send('update:status', { status: 'not-available' })
    })

    autoUpdater.on('download-progress', (progress) => {
      mainWindow?.webContents.send('update:status', {
        status: 'downloading',
        percent: progress.percent,
        transferred: progress.transferred,
        total: progress.total,
      })
    })

    autoUpdater.on('update-downloaded', (info) => {
      mainWindow?.webContents.send('update:status', {
        status: 'downloaded',
        version: info.version,
      })
    })

    autoUpdater.on('error', (err) => {
      mainWindow?.webContents.send('update:status', {
        status: 'error',
        error: err?.message || 'Unknown error',
      })
    })

    autoUpdater.checkForUpdates().catch((err) => {
      console.log('Auto-update check failed:', err?.message)
    })
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  stopAllFileWatchers()
  // Stop all file content watchers
  for (const [, watcher] of fileContentWatchers) {
    watcher.close()
  }
  fileContentWatchers.clear()
  
  // Close all terminal windows
  for (const [, win] of terminalWindows) {
    if (!win.isDestroyed()) {
      win.close()
    }
  }
  terminalWindows.clear()

  // Close all overview windows
  for (const [, win] of overviewWindows) {
    if (!win.isDestroyed()) {
      win.close()
    }
  }
  overviewWindows.clear()
  
  // Clean up agent sessions
  cleanupAgentManager()

  // Clean up channel manager
  stopChannelManager()

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

