const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  // Project selection
  selectProjectFolder: () => ipcRenderer.invoke("select-project-folder"),
  getCurrentProject: () => ipcRenderer.invoke("get-current-project"),
  setProjectPath: (path) => ipcRenderer.invoke("set-project-path", path),
  // File watching
  startWatching: (projectPath) => ipcRenderer.invoke("start-watching", projectPath),
  stopWatching: (projectPath) => ipcRenderer.invoke("stop-watching", projectPath),
  stopAllWatching: () => ipcRenderer.invoke("stop-all-watching"),
  // File reading
  readProcessFile: (processPath, fileName) => ipcRenderer.invoke("read-process-file", processPath, fileName),
  // Process files listing and reading
  listProcessFiles: (processPath) => ipcRenderer.invoke("list-process-files", processPath),
  readFileContent: (filePath) => ipcRenderer.invoke("read-file-content", filePath),
  // File content watching (hot reload)
  watchFile: (filePath) => ipcRenderer.invoke("watch-file", filePath),
  unwatchFile: (filePath) => ipcRenderer.invoke("unwatch-file", filePath),
  // Process instance management
  deleteProcessInstance: (processPath) => ipcRenderer.invoke("delete-process-instance", processPath),
  // Template loading (framework templates from .processes/)
  loadProcessTemplates: (projectPath) => ipcRenderer.invoke("load-process-templates", projectPath),
  loadStepTemplates: (projectPath) => ipcRenderer.invoke("load-step-templates", projectPath),
  // User templates (project-specific from .user-processes/)
  loadUserTemplates: (projectPath) => ipcRenderer.invoke("load-user-templates", projectPath),
  loadUserSteps: (projectPath) => ipcRenderer.invoke("load-user-steps", projectPath),
  // Folder detection (determine if folder has .processes/ and/or .user-processes/)
  detectFolderType: (path) => ipcRenderer.invoke("detect-folder-type", path),
  // Event listeners
  onProcessUpdate: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on("process-update", subscription);
    return () => {
      ipcRenderer.removeListener("process-update", subscription);
    };
  },
  onMemoryUpdate: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on("memory-update", subscription);
    return () => {
      ipcRenderer.removeListener("memory-update", subscription);
    };
  },
  onLogUpdate: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on("log-update", subscription);
    return () => {
      ipcRenderer.removeListener("log-update", subscription);
    };
  },
  onFileContentUpdate: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on("file-content-update", subscription);
    return () => {
      ipcRenderer.removeListener("file-content-update", subscription);
    };
  },
  onPendingInteractionUpdate: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on("pending-interaction-update", subscription);
    return () => {
      ipcRenderer.removeListener("pending-interaction-update", subscription);
    };
  },
  onWatcherError: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on("watcher-error", subscription);
    return () => {
      ipcRenderer.removeListener("watcher-error", subscription);
    };
  },
  // ============================================================================
  // Agent Session API
  // ============================================================================
  // Get available agent types
  agentGetAvailable: () => ipcRenderer.invoke("agent:get-available"),
  // Create a new agent session
  agentCreate: (agentType, workingDirectory, processPath) => ipcRenderer.invoke("agent:create", agentType, workingDirectory, processPath),
  // Attach session to a process
  agentAttach: (sessionId, processPath) => ipcRenderer.invoke("agent:attach", sessionId, processPath),
  // Send a prompt to the agent
  agentSendPrompt: (sessionId, prompt) => ipcRenderer.invoke("agent:send-prompt", sessionId, prompt),
  // Send raw input (keyboard events)
  agentInput: (sessionId, data) => ipcRenderer.invoke("agent:input", sessionId, data),
  // Resize the terminal
  agentResize: (sessionId, cols, rows) => ipcRenderer.invoke("agent:resize", sessionId, cols, rows),
  // Kill a session
  agentKill: (sessionId) => ipcRenderer.invoke("agent:kill", sessionId),
  // List all sessions
  agentList: () => ipcRenderer.invoke("agent:list"),
  // Get a specific session
  agentGet: (sessionId) => ipcRenderer.invoke("agent:get", sessionId),
  // Get sessions for a specific process
  agentGetForProcess: (processPath) => ipcRenderer.invoke("agent:get-for-process", processPath),
  // Terminal window management
  openTerminalWindow: (sessionId, processPath, processName) => ipcRenderer.invoke("agent:open-window", sessionId, processPath, processName),
  closeTerminalWindow: () => ipcRenderer.invoke("agent:close-window"),
  getWindowParams: () => ipcRenderer.invoke("agent:get-window-params"),
  // Clipboard
  clipboardReadText: () => ipcRenderer.invoke("clipboard:read-text"),
  clipboardWriteText: (text) => ipcRenderer.invoke("clipboard:write-text", text),
  // Agent event listeners
  onAgentOutput: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on("agent:output", subscription);
    return () => {
      ipcRenderer.removeListener("agent:output", subscription);
    };
  },
  onAgentStatus: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on("agent:status", subscription);
    return () => {
      ipcRenderer.removeListener("agent:status", subscription);
    };
  }
});
