const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  // Project selection
  selectProjectFolder: () => ipcRenderer.invoke("select-project-folder"),
  // File watching
  startWatching: (projectPath) => ipcRenderer.invoke("start-watching", projectPath),
  stopWatching: (projectPath) => ipcRenderer.invoke("stop-watching", projectPath),
  stopAllWatching: () => ipcRenderer.invoke("stop-all-watching"),
  // File reading
  readProcessFile: (processPath, fileName) => ipcRenderer.invoke("read-process-file", processPath, fileName),
  readMemoryDirectory: (processPath) => ipcRenderer.invoke("read-memory-directory", processPath),
  // Process files listing and reading
  listProcessFiles: (processPath) => ipcRenderer.invoke("list-process-files", processPath),
  readFileContent: (filePath) => ipcRenderer.invoke("read-file-content", filePath),
  // File content watching (hot reload)
  watchFile: (filePath) => ipcRenderer.invoke("watch-file", filePath),
  unwatchFile: (filePath) => ipcRenderer.invoke("unwatch-file", filePath),
  // Process instance management
  deleteProcessInstance: (processPath) => ipcRenderer.invoke("delete-process-instance", processPath),
  // Template loading (unified from ~/.claude/agentic-processes/)
  loadProcessTemplates: () => ipcRenderer.invoke("load-process-templates"),
  loadStepTemplates: () => ipcRenderer.invoke("load-step-templates"),
  // Q&A Session operations
  readQASession: (processPath) => ipcRenderer.invoke("read-qa-session", processPath),
  answerQuestion: (processPath, questionId, answer) => ipcRenderer.invoke("answer-question", processPath, questionId, answer),
  completeQuestion: (processPath, questionId) => ipcRenderer.invoke("complete-question", processPath, questionId),
  getQASessionStatus: (processPath) => ipcRenderer.invoke("get-qa-session-status", processPath),
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
  onQASessionUpdate: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on("qa-session-update", subscription);
    return () => {
      ipcRenderer.removeListener("qa-session-update", subscription);
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
  agentCreate: (agentType, workingDirectory, processPath, options) => ipcRenderer.invoke("agent:create", agentType, workingDirectory, processPath, options),
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
  // External session discovery and migration
  agentDiscoverExternal: (activeProcesses) => ipcRenderer.invoke("agent:discover-external", activeProcesses),
  agentMigrateExternal: (externalSession, workingDirectory, options) => ipcRenderer.invoke("agent:migrate-external", externalSession, workingDirectory, options),
  // Terminal window management
  openTerminalWindow: (sessionId, processPath, processName) => ipcRenderer.invoke("agent:open-window", sessionId, processPath, processName),
  closeTerminalWindow: () => ipcRenderer.invoke("agent:close-window"),
  getWindowParams: () => ipcRenderer.invoke("agent:get-window-params"),
  // Clipboard
  clipboardReadText: () => ipcRenderer.invoke("clipboard:read-text"),
  clipboardWriteText: (text) => ipcRenderer.invoke("clipboard:write-text", text),
  // ============================================================================
  // Channel API
  // ============================================================================
  channelIsInstalled: () => ipcRenderer.invoke("channel:is-installed"),
  channelGetInstalledPath: () => ipcRenderer.invoke("channel:get-installed-path"),
  channelInstall: () => ipcRenderer.invoke("channel:install"),
  channelUninstall: () => ipcRenderer.invoke("channel:uninstall"),
  channelList: () => ipcRenderer.invoke("channel:list"),
  channelGetForPid: (pid) => ipcRenderer.invoke("channel:get-for-pid", pid),
  channelSendPrompt: (port, prompt, meta) => ipcRenderer.invoke("channel:send-prompt", port, prompt, meta),
  channelCheckHealth: (port) => ipcRenderer.invoke("channel:check-health", port),
  onChannelAvailable: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on("channel:available", subscription);
    return () => {
      ipcRenderer.removeListener("channel:available", subscription);
    };
  },
  onChannelRemoved: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on("channel:removed", subscription);
    return () => {
      ipcRenderer.removeListener("channel:removed", subscription);
    };
  },
  onChannelReply: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on("channel:reply", subscription);
    return () => {
      ipcRenderer.removeListener("channel:reply", subscription);
    };
  },
  // ============================================================================
  // Overview Window API
  // ============================================================================
  openOverviewWindow: () => ipcRenderer.invoke("overview:open-window"),
  getOverviewWindowParams: () => ipcRenderer.invoke("overview:get-window-params"),
  getCurrentProcesses: () => ipcRenderer.invoke("overview:get-current-processes"),
  navigateToProcessInMain: (processPath) => ipcRenderer.invoke("overview:navigate-to-process", processPath),
  onNavigateToProcessRequest: (callback) => {
    const subscription = (_event, processPath) => callback(processPath);
    ipcRenderer.on("navigate-to-process-request", subscription);
    return () => {
      ipcRenderer.removeListener("navigate-to-process-request", subscription);
    };
  },
  // ============================================================================
  // Marketplace API
  // ============================================================================
  marketplaceList: () => ipcRenderer.invoke("marketplace:list"),
  marketplaceAdd: (name, url, branch, priority) => ipcRenderer.invoke("marketplace:add", name, url, branch, priority),
  marketplaceRemove: (name) => ipcRenderer.invoke("marketplace:remove", name),
  marketplaceToggle: (name) => ipcRenderer.invoke("marketplace:toggle", name),
  marketplaceUpdate: (name, updates) => ipcRenderer.invoke("marketplace:update", name, updates),
  marketplaceRefresh: (marketplaceName) => ipcRenderer.invoke("marketplace:refresh", marketplaceName),
  marketplaceStatus: () => ipcRenderer.invoke("marketplace:status"),
  marketplaceCatalog: () => ipcRenderer.invoke("marketplace:catalog"),
  marketplaceInstall: (marketplace, template, category, type) => ipcRenderer.invoke("marketplace:install", marketplace, template, category, type),
  marketplaceUninstall: (template, type) => ipcRenderer.invoke("marketplace:uninstall", template, type),
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
  },
  // Auto-Update API
  updateGetCurrentVersion: () => ipcRenderer.invoke("update:get-current-version"),
  updateQuitAndInstall: () => ipcRenderer.invoke("update:quit-and-install"),
  onUpdateStatus: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on("update:status", subscription);
    return () => {
      ipcRenderer.removeListener("update:status", subscription);
    };
  }
});
