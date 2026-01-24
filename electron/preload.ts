const { contextBridge, ipcRenderer } = require('electron')

export interface ProcessUpdateEvent {
  event: 'added' | 'changed' | 'removed'
  data: {
    path: string
    process?: unknown
  }
}

export interface MemoryUpdateEvent {
  event: 'added' | 'changed' | 'removed'
  processPath: string
  memory?: unknown
}

export interface LogUpdateEvent {
  event: 'added' | 'changed' | 'removed'
  processPath: string
  log?: unknown
}

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Project selection
  selectProjectFolder: () => ipcRenderer.invoke('select-project-folder'),
  getCurrentProject: () => ipcRenderer.invoke('get-current-project'),
  setProjectPath: (path: string) => ipcRenderer.invoke('set-project-path', path),
  
  // File watching
  startWatching: (projectPath: string) => ipcRenderer.invoke('start-watching', projectPath),
  stopWatching: () => ipcRenderer.invoke('stop-watching'),
  
  // File reading
  readProcessFile: (processPath: string, fileName: string) => 
    ipcRenderer.invoke('read-process-file', processPath, fileName),
  
  // Event listeners
  onProcessUpdate: (callback: (event: ProcessUpdateEvent) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, data: ProcessUpdateEvent) => callback(data)
    ipcRenderer.on('process-update', subscription)
    return () => {
      ipcRenderer.removeListener('process-update', subscription)
    }
  },
  
  onMemoryUpdate: (callback: (event: MemoryUpdateEvent) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, data: MemoryUpdateEvent) => callback(data)
    ipcRenderer.on('memory-update', subscription)
    return () => {
      ipcRenderer.removeListener('memory-update', subscription)
    }
  },
  
  onLogUpdate: (callback: (event: LogUpdateEvent) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, data: LogUpdateEvent) => callback(data)
    ipcRenderer.on('log-update', subscription)
    return () => {
      ipcRenderer.removeListener('log-update', subscription)
    }
  }
})

// Type declaration for the window object
declare global {
  interface Window {
    electronAPI: {
      selectProjectFolder: () => Promise<string | null>
      getCurrentProject: () => Promise<string | null>
      setProjectPath: (path: string) => Promise<boolean>
      startWatching: (projectPath: string) => Promise<boolean>
      stopWatching: () => Promise<boolean>
      readProcessFile: (processPath: string, fileName: string) => Promise<unknown | null>
      onProcessUpdate: (callback: (event: ProcessUpdateEvent) => void) => () => void
      onMemoryUpdate: (callback: (event: MemoryUpdateEvent) => void) => () => void
      onLogUpdate: (callback: (event: LogUpdateEvent) => void) => () => void
    }
  }
}
