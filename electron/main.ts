import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import { join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'
import { readFile, readdir, stat } from 'fs/promises'
import { existsSync } from 'fs'
import { watch, type FSWatcher } from 'chokidar'
import { createFileWatcher, stopFileWatcher } from './fileWatcher'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let mainWindow: BrowserWindow | null = null
let currentProjectPath: string | null = null
let fileContentWatchers: Map<string, FSWatcher> = new Map()

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
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
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
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

ipcMain.handle('start-watching', (_event, projectPath: string) => {
  if (mainWindow) {
    const result = createFileWatcher(
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

ipcMain.handle('stop-watching', () => {
  stopFileWatcher()
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
  stopFileWatcher()
  // Stop all file content watchers
  for (const [, watcher] of fileContentWatchers) {
    watcher.close()
  }
  fileContentWatchers.clear()
  
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

