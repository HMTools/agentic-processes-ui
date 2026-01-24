import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { createFileWatcher, stopFileWatcher } from './fileWatcher'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let mainWindow: BrowserWindow | null = null
let currentProjectPath: string | null = null

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
    createFileWatcher(projectPath, (event, fileType, data) => {
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
    })
  }
  return true
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
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

