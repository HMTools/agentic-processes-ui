import { app, BrowserWindow, ipcMain, dialog, Menu, clipboard } from 'electron'
import { join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'
import { readFile, readdir, stat } from 'fs/promises'
import { existsSync } from 'fs'
import { watch, type FSWatcher } from 'chokidar'
import { createFileWatcher, stopFileWatcher, stopAllFileWatchers } from './fileWatcher'
import { 
  getAgentManager, 
  cleanupAgentManager, 
  AGENT_CONFIGS,
  type AgentType,
  type AgentOutputEvent,
  type AgentStatusEvent
} from './agentSessionManager'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let mainWindow: BrowserWindow | null = null
let currentProjectPath: string | null = null
let fileContentWatchers: Map<string, FSWatcher> = new Map()
let agentManagerInitialized = false
let terminalWindows: Map<string, BrowserWindow> = new Map()

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    icon: join(__dirname, '../images/icon.png'),
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

  const terminalWin = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    icon: join(__dirname, '../images/icon.png'),
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

// IPC Handlers
ipcMain.handle('select-project-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Select Project with .user-processes folder'
  })
  
  if (!result.canceled && result.filePaths.length > 0) {
    currentProjectPath = result.filePaths[0]
    return currentProjectPath
  }
  return null
})

ipcMain.handle('get-current-project', () => {
  return currentProjectPath
})

ipcMain.handle('set-project-path', (_event, path: string) => {
  currentProjectPath = path
  return true
})

ipcMain.handle('start-watching', async (_event, projectPath: string) => {
  if (mainWindow) {
    const result = await createFileWatcher(
      projectPath, 
      (event, fileType, data) => {
        // Send to appropriate channel based on file type
        switch (fileType) {
          case 'process':
            mainWindow?.webContents.send('process-update', { 
              event, 
              data: { path: data.processPath, process: data.content } 
            })
            break
          case 'memory':
            mainWindow?.webContents.send('memory-update', { 
              event, 
              processPath: data.processPath,
              memory: data.content 
            })
            break
          case 'log':
            mainWindow?.webContents.send('log-update', { 
              event, 
              processPath: data.processPath,
              log: data.content 
            })
            break
        }
      },
      (error) => {
        // Send error to renderer
        mainWindow?.webContents.send('watcher-error', { error })
      }
    )
    
    // Return error info if watcher failed to start
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
    
    // Sort: process.md first, then alphabetically
    files.sort((a, b) => {
      if (a.name === 'process.md') return -1
      if (b.name === 'process.md') return 1
      return a.name.localeCompare(b.name)
    })
    
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
      mainWindow?.webContents.send('file-content-update', {
        filePath: path,
        content
      })
    } catch (error) {
      console.error(`Error reading changed file: ${path}`, error)
    }
  })
  
  fileWatcher.on('unlink', (path) => {
    console.log(`Watched file removed: ${path}`)
    mainWindow?.webContents.send('file-content-update', {
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

// Load all process templates from .processes/templates/
ipcMain.handle('load-process-templates', async (_event, projectPath: string) => {
  try {
    const templatesPath = join(projectPath, '.processes', 'templates')
    
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
        // This is a template directly under templates/ (unusual but possible)
        try {
          const content = await readFile(directTemplateJson, 'utf-8')
          const template = JSON.parse(content)
          if (template.type === 'template') {
            template.filePath = directTemplateJson
            template.markdownPath = join(categoryPath, `${category}.md`)
            if (existsSync(template.markdownPath)) {
              template.markdownContent = await readFile(template.markdownPath, 'utf-8')
            }
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
              template.markdownPath = join(templatePath, `${templateName}.md`)
              if (existsSync(template.markdownPath)) {
                template.markdownContent = await readFile(template.markdownPath, 'utf-8')
              }
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

// Load user templates from .user-processes/templates/ (project-specific)
ipcMain.handle('load-user-templates', async (_event, projectPath: string) => {
  try {
    const templatesPath = join(projectPath, '.user-processes', 'templates')
    
    if (!existsSync(templatesPath)) {
      console.log(`User templates directory not found: ${templatesPath}`)
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
            template.markdownPath = join(categoryPath, `${category}.md`)
            if (existsSync(template.markdownPath)) {
              template.markdownContent = await readFile(template.markdownPath, 'utf-8')
            }
            templates.push(template)
          }
        } catch (err) {
          console.error(`Error reading user template: ${directTemplateJson}`, err)
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
              template.markdownPath = join(templatePath, `${templateName}.md`)
              if (existsSync(template.markdownPath)) {
                template.markdownContent = await readFile(template.markdownPath, 'utf-8')
              }
              templates.push(template)
            }
          } catch (err) {
            console.error(`Error reading user template: ${jsonPath}`, err)
          }
        }
      }
    }
    
    return templates
  } catch (error) {
    console.error('Error loading user templates:', error)
    return []
  }
})

// Load user step templates from .user-processes/steps/ (project-specific)
ipcMain.handle('load-user-steps', async (_event, projectPath: string) => {
  try {
    const stepsPath = join(projectPath, '.user-processes', 'steps')
    
    if (!existsSync(stepsPath)) {
      console.log(`User steps directory not found: ${stepsPath}`)
      return []
    }
    
    const steps = []
    const categories = await readdir(stepsPath)
    
    for (const category of categories) {
      const categoryPath = join(stepsPath, category)
      const categoryStat = await stat(categoryPath)
      
      // Skip non-directories and special folders like _components
      if (!categoryStat.isDirectory() || category.startsWith('.') || category.startsWith('_')) {
        continue
      }
      
      const stepFolders = await readdir(categoryPath)
      
      for (const stepName of stepFolders) {
        const stepPath = join(categoryPath, stepName)
        const stepStat = await stat(stepPath)
        
        if (!stepStat.isDirectory() || stepName.startsWith('.') || stepName.startsWith('_')) {
          continue
        }
        
        const jsonPath = join(stepPath, `${stepName}.json`)
        
        if (existsSync(jsonPath)) {
          try {
            const content = await readFile(jsonPath, 'utf-8')
            const step = JSON.parse(content)
            
            if (step.type === 'step') {
              step.filePath = jsonPath
              step.markdownPath = join(stepPath, `${stepName}.md`)
              if (existsSync(step.markdownPath)) {
                step.markdownContent = await readFile(step.markdownPath, 'utf-8')
              }
              steps.push(step)
            }
          } catch (err) {
            console.error(`Error reading user step: ${jsonPath}`, err)
          }
        }
      }
    }
    
    return steps
  } catch (error) {
    console.error('Error loading user steps:', error)
    return []
  }
})

// Detect what type of folder this is (framework with .processes/ and/or project with .user-processes/)
ipcMain.handle('detect-folder-type', async (_event, path: string) => {
  return {
    hasProcesses: existsSync(join(path, '.processes')),
    hasUserProcesses: existsSync(join(path, '.user-processes'))
  }
})

// Load all step templates from .processes/steps/
ipcMain.handle('load-step-templates', async (_event, projectPath: string) => {
  try {
    const stepsPath = join(projectPath, '.processes', 'steps')
    
    if (!existsSync(stepsPath)) {
      console.log(`Steps directory not found: ${stepsPath}`)
      return []
    }
    
    const steps = []
    const categories = await readdir(stepsPath)
    
    for (const category of categories) {
      const categoryPath = join(stepsPath, category)
      const categoryStat = await stat(categoryPath)
      
      // Skip non-directories and special folders like _components
      if (!categoryStat.isDirectory() || category.startsWith('.') || category.startsWith('_')) {
        continue
      }
      
      const stepFolders = await readdir(categoryPath)
      
      for (const stepName of stepFolders) {
        const stepPath = join(categoryPath, stepName)
        const stepStat = await stat(stepPath)
        
        if (!stepStat.isDirectory() || stepName.startsWith('.') || stepName.startsWith('_')) {
          continue
        }
        
        const jsonPath = join(stepPath, `${stepName}.json`)
        
        if (existsSync(jsonPath)) {
          try {
            const content = await readFile(jsonPath, 'utf-8')
            const step = JSON.parse(content)
            
            if (step.type === 'step') {
              step.filePath = jsonPath
              step.markdownPath = join(stepPath, `${stepName}.md`)
              if (existsSync(step.markdownPath)) {
                step.markdownContent = await readFile(step.markdownPath, 'utf-8')
              }
              steps.push(step)
            }
          } catch (err) {
            console.error(`Error reading step: ${jsonPath}`, err)
          }
        }
      }
    }
    
    return steps
  } catch (error) {
    console.error('Error loading step templates:', error)
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
ipcMain.handle('agent:create', async (_event, agentType: AgentType, workingDirectory: string, processPath?: string) => {
  try {
    initializeAgentManager()
    const agentManager = getAgentManager()
    const session = await agentManager.createSession(agentType, workingDirectory, processPath)
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

// App lifecycle
app.whenReady().then(() => {
  // Remove default menu bar
  Menu.setApplicationMenu(null)
  
  createWindow()

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
  
  // Clean up agent sessions
  cleanupAgentManager()
  
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

