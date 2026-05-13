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

export interface PendingInteractionUpdateEvent {
  event: 'added' | 'changed' | 'removed'
  processPath: string
  pendingInteraction?: unknown
}

export interface QASessionUpdateEvent {
  event: 'added' | 'changed' | 'removed'
  processPath: string
  qaSession?: unknown
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

// ============================================================================
// Agent Types
// ============================================================================

export type AgentType = 'cursor' | 'github-copilot' | 'claude-code'

export type AgentSessionStatus = 'starting' | 'running' | 'stopped' | 'error'

export interface AgentSession {
  id: string
  agentType: AgentType
  attachedProcessId: string | null
  attachedProcessPath: string | null
  status: AgentSessionStatus
  createdAt: string
  workingDirectory: string
}

export interface AgentOutputEvent {
  sessionId: string
  data: string
}

export interface AgentStatusEvent {
  sessionId: string
  status: AgentSessionStatus
  error?: string
}

export interface AgentAvailableType {
  type: AgentType
  displayName: string
  available: boolean
}

export interface AgentResult<T = void> {
  success: boolean
  error?: string
  session?: AgentSession
  sessions?: AgentSession[]
}

export interface ExternalSession {
  pid: number
  commandLine: string
  claudeSessionId: string
  processPath: string
  workingDirectory?: string
}

export interface ActiveProcessInfo {
  path: string
  sessionId?: string
  projectPaths?: string[]
}

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Project selection
  selectProjectFolder: () => ipcRenderer.invoke('select-project-folder'),
  getCurrentProject: () => ipcRenderer.invoke('get-current-project'),
  setProjectPath: (path: string) => ipcRenderer.invoke('set-project-path', path),
  
  // File watching
  startWatching: (projectPath: string) => ipcRenderer.invoke('start-watching', projectPath) as Promise<StartWatchingResult>,
  stopWatching: (projectPath?: string) => ipcRenderer.invoke('stop-watching', projectPath),
  stopAllWatching: () => ipcRenderer.invoke('stop-all-watching'),
  
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

  // Process instance management
  deleteProcessInstance: (processPath: string) =>
    ipcRenderer.invoke('delete-process-instance', processPath) as Promise<{ success: boolean; error?: string }>,

  // Template loading (unified from ~/.claude/agentic-processes/)
  loadProcessTemplates: () =>
    ipcRenderer.invoke('load-process-templates'),
  loadStepTemplates: () =>
    ipcRenderer.invoke('load-step-templates'),

  // Q&A Session operations
  readQASession: (processPath: string) =>
    ipcRenderer.invoke('read-qa-session', processPath),
  answerQuestion: (processPath: string, questionId: string, answer: string) =>
    ipcRenderer.invoke('answer-question', processPath, questionId, answer) as Promise<{ success: boolean; error?: string }>,
  completeQuestion: (processPath: string, questionId: string) =>
    ipcRenderer.invoke('complete-question', processPath, questionId) as Promise<{ success: boolean; error?: string }>,
  getQASessionStatus: (processPath: string) =>
    ipcRenderer.invoke('get-qa-session-status', processPath),
  
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
  
  onPendingInteractionUpdate: (callback: (event: PendingInteractionUpdateEvent) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, data: PendingInteractionUpdateEvent) => callback(data)
    ipcRenderer.on('pending-interaction-update', subscription)
    return () => {
      ipcRenderer.removeListener('pending-interaction-update', subscription)
    }
  },

  onQASessionUpdate: (callback: (event: QASessionUpdateEvent) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, data: QASessionUpdateEvent) => callback(data)
    ipcRenderer.on('qa-session-update', subscription)
    return () => {
      ipcRenderer.removeListener('qa-session-update', subscription)
    }
  },

  onWatcherError: (callback: (event: WatcherErrorEvent) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, data: WatcherErrorEvent) => callback(data)
    ipcRenderer.on('watcher-error', subscription)
    return () => {
      ipcRenderer.removeListener('watcher-error', subscription)
    }
  },
  
  // ============================================================================
  // Agent Session API
  // ============================================================================
  
  // Get available agent types
  agentGetAvailable: () => 
    ipcRenderer.invoke('agent:get-available') as Promise<AgentAvailableType[]>,
  
  // Create a new agent session
  agentCreate: (agentType: AgentType, workingDirectory: string, processPath?: string, options?: { permissionMode?: string }) =>
    ipcRenderer.invoke('agent:create', agentType, workingDirectory, processPath, options) as Promise<AgentResult<AgentSession>>,
  
  // Attach session to a process
  agentAttach: (sessionId: string, processPath: string) =>
    ipcRenderer.invoke('agent:attach', sessionId, processPath) as Promise<AgentResult>,
  
  // Send a prompt to the agent
  agentSendPrompt: (sessionId: string, prompt: string) =>
    ipcRenderer.invoke('agent:send-prompt', sessionId, prompt) as Promise<AgentResult>,
  
  // Send raw input (keyboard events)
  agentInput: (sessionId: string, data: string) =>
    ipcRenderer.invoke('agent:input', sessionId, data) as Promise<AgentResult>,
  
  // Resize the terminal
  agentResize: (sessionId: string, cols: number, rows: number) =>
    ipcRenderer.invoke('agent:resize', sessionId, cols, rows) as Promise<AgentResult>,
  
  // Kill a session
  agentKill: (sessionId: string) =>
    ipcRenderer.invoke('agent:kill', sessionId) as Promise<AgentResult>,
  
  // List all sessions
  agentList: () =>
    ipcRenderer.invoke('agent:list') as Promise<AgentResult & { sessions: AgentSession[] }>,
  
  // Get a specific session
  agentGet: (sessionId: string) =>
    ipcRenderer.invoke('agent:get', sessionId) as Promise<AgentResult & { session: AgentSession | null }>,
  
  // Get sessions for a specific process
  agentGetForProcess: (processPath: string) =>
    ipcRenderer.invoke('agent:get-for-process', processPath) as Promise<AgentResult & { sessions: AgentSession[] }>,
  
  // External session discovery and migration
  agentDiscoverExternal: (activeProcesses: ActiveProcessInfo[]) =>
    ipcRenderer.invoke('agent:discover-external', activeProcesses) as Promise<{ success: boolean; sessions: Record<string, ExternalSession>; error?: string }>,

  agentMigrateExternal: (externalSession: ExternalSession, workingDirectory: string, options?: { permissionMode?: string }) =>
    ipcRenderer.invoke('agent:migrate-external', externalSession, workingDirectory, options) as Promise<AgentResult<AgentSession>>,

  // Terminal window management
  openTerminalWindow: (sessionId: string, processPath: string, processName: string) =>
    ipcRenderer.invoke('agent:open-window', sessionId, processPath, processName) as Promise<AgentResult>,
  
  closeTerminalWindow: () =>
    ipcRenderer.invoke('agent:close-window') as Promise<AgentResult>,
  
  getWindowParams: () =>
    ipcRenderer.invoke('agent:get-window-params') as Promise<{ sessionId: string; processPath: string; processName: string } | null>,
  
  // Clipboard
  clipboardReadText: () =>
    ipcRenderer.invoke('clipboard:read-text') as Promise<string>,
  clipboardWriteText: (text: string) =>
    ipcRenderer.invoke('clipboard:write-text', text) as Promise<boolean>,
  
  // Agent event listeners
  onAgentOutput: (callback: (event: AgentOutputEvent) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, data: AgentOutputEvent) => callback(data)
    ipcRenderer.on('agent:output', subscription)
    return () => {
      ipcRenderer.removeListener('agent:output', subscription)
    }
  },
  
  onAgentStatus: (callback: (event: AgentStatusEvent) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, data: AgentStatusEvent) => callback(data)
    ipcRenderer.on('agent:status', subscription)
    return () => {
      ipcRenderer.removeListener('agent:status', subscription)
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
      stopWatching: (projectPath?: string) => Promise<boolean>
      stopAllWatching: () => Promise<boolean>
      readProcessFile: (processPath: string, fileName: string) => Promise<unknown | null>
      listProcessFiles: (processPath: string) => Promise<ProcessFile[]>
      readFileContent: (filePath: string) => Promise<string | null>
      watchFile: (filePath: string) => Promise<boolean>
      unwatchFile: (filePath: string) => Promise<boolean>
      deleteProcessInstance: (processPath: string) => Promise<{ success: boolean; error?: string }>
      loadProcessTemplates: () => Promise<unknown[]>
      loadStepTemplates: () => Promise<unknown[]>
      // Q&A Session API
      readQASession: (processPath: string) => Promise<unknown | null>
      answerQuestion: (processPath: string, questionId: string, answer: string) => Promise<{ success: boolean; error?: string }>
      completeQuestion: (processPath: string, questionId: string) => Promise<{ success: boolean; error?: string }>
      getQASessionStatus: (processPath: string) => Promise<string | null>
      onProcessUpdate: (callback: (event: ProcessUpdateEvent) => void) => () => void
      onMemoryUpdate: (callback: (event: MemoryUpdateEvent) => void) => () => void
      onLogUpdate: (callback: (event: LogUpdateEvent) => void) => () => void
      onPendingInteractionUpdate: (callback: (event: PendingInteractionUpdateEvent) => void) => () => void
      onQASessionUpdate: (callback: (event: QASessionUpdateEvent) => void) => () => void
      onFileContentUpdate: (callback: (event: FileContentUpdateEvent) => void) => () => void
      onWatcherError: (callback: (event: WatcherErrorEvent) => void) => () => void
      // Clipboard API
      clipboardReadText: () => Promise<string>
      clipboardWriteText: (text: string) => Promise<boolean>
      // Agent API
      agentGetAvailable: () => Promise<AgentAvailableType[]>
      agentCreate: (agentType: AgentType, workingDirectory: string, processPath?: string, options?: { permissionMode?: string }) => Promise<AgentResult<AgentSession>>
      agentAttach: (sessionId: string, processPath: string) => Promise<AgentResult>
      agentSendPrompt: (sessionId: string, prompt: string) => Promise<AgentResult>
      agentInput: (sessionId: string, data: string) => Promise<AgentResult>
      agentResize: (sessionId: string, cols: number, rows: number) => Promise<AgentResult>
      agentKill: (sessionId: string) => Promise<AgentResult>
      agentList: () => Promise<AgentResult & { sessions: AgentSession[] }>
      agentGet: (sessionId: string) => Promise<AgentResult & { session: AgentSession | null }>
      agentGetForProcess: (processPath: string) => Promise<AgentResult & { sessions: AgentSession[] }>
      agentDiscoverExternal: (activeProcesses: ActiveProcessInfo[]) => Promise<{ success: boolean; sessions: Record<string, ExternalSession>; error?: string }>
      agentMigrateExternal: (externalSession: ExternalSession, workingDirectory: string, options?: { permissionMode?: string }) => Promise<AgentResult<AgentSession>>
      openTerminalWindow: (sessionId: string, processPath: string, processName: string) => Promise<AgentResult>
      closeTerminalWindow: () => Promise<AgentResult>
      getWindowParams: () => Promise<{ sessionId: string; processPath: string; processName: string } | null>
      onAgentOutput: (callback: (event: AgentOutputEvent) => void) => () => void
      onAgentStatus: (callback: (event: AgentStatusEvent) => void) => () => void
    }
  }
}
