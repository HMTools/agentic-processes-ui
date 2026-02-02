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

export interface FileContentUpdateEvent {
  filePath: string
  content: string | null
  removed?: boolean
}

export interface WatcherErrorEvent {
  error: string
}

export interface StartWatchingResult {
  success: boolean
  error?: string
}

export interface ProcessFile {
  name: string
  path: string
  type: 'markdown' | 'json'
  size: number
  modifiedAt: string
}

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Project selection
  selectProjectFolder: () => ipcRenderer.invoke('select-project-folder'),
  getCurrentProject: () => ipcRenderer.invoke('get-current-project'),
  setProjectPath: (path: string) => ipcRenderer.invoke('set-project-path', path),
  
  // File watching
  startWatching: (projectPath: string) => ipcRenderer.invoke('start-watching', projectPath) as Promise<StartWatchingResult>,
  stopWatching: () => ipcRenderer.invoke('stop-watching'),
  
  // File reading
  readProcessFile: (processPath: string, fileName: string) => 
    ipcRenderer.invoke('read-process-file', processPath, fileName),
  
  // Process files listing and reading
  listProcessFiles: (processPath: string) =>
    ipcRenderer.invoke('list-process-files', processPath),
  readFileContent: (filePath: string) =>
    ipcRenderer.invoke('read-file-content', filePath),
  
  // File content watching (hot reload)
  watchFile: (filePath: string) =>
    ipcRenderer.invoke('watch-file', filePath),
  unwatchFile: (filePath: string) =>
    ipcRenderer.invoke('unwatch-file', filePath),
  
  // Template loading
  loadProcessTemplates: (projectPath: string) =>
    ipcRenderer.invoke('load-process-templates', projectPath),
  loadStepTemplates: (projectPath: string) =>
    ipcRenderer.invoke('load-step-templates', projectPath),
  
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
  },
  
  onFileContentUpdate: (callback: (event: FileContentUpdateEvent) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, data: FileContentUpdateEvent) => callback(data)
    ipcRenderer.on('file-content-update', subscription)
    return () => {
      ipcRenderer.removeListener('file-content-update', subscription)
    }
  },
  
  onWatcherError: (callback: (event: WatcherErrorEvent) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, data: WatcherErrorEvent) => callback(data)
    ipcRenderer.on('watcher-error', subscription)
    return () => {
      ipcRenderer.removeListener('watcher-error', subscription)
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
      startWatching: (projectPath: string) => Promise<StartWatchingResult>
      stopWatching: () => Promise<boolean>
      readProcessFile: (processPath: string, fileName: string) => Promise<unknown | null>
      listProcessFiles: (processPath: string) => Promise<ProcessFile[]>
      readFileContent: (filePath: string) => Promise<string | null>
      watchFile: (filePath: string) => Promise<boolean>
      unwatchFile: (filePath: string) => Promise<boolean>
      loadProcessTemplates: (projectPath: string) => Promise<unknown[]>
      loadStepTemplates: (projectPath: string) => Promise<unknown[]>
      onProcessUpdate: (callback: (event: ProcessUpdateEvent) => void) => () => void
      onMemoryUpdate: (callback: (event: MemoryUpdateEvent) => void) => () => void
      onLogUpdate: (callback: (event: LogUpdateEvent) => void) => () => void
      onFileContentUpdate: (callback: (event: FileContentUpdateEvent) => void) => () => void
      onWatcherError: (callback: (event: WatcherErrorEvent) => void) => () => void
    }
  }
}
