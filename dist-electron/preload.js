const { contextBridge: r, ipcRenderer: t } = require("electron");
r.exposeInMainWorld("electronAPI", {
  // Project selection
  selectProjectFolder: () => t.invoke("select-project-folder"),
  // File watching
  startWatching: (e) => t.invoke("start-watching", e),
  stopWatching: (e) => t.invoke("stop-watching", e),
  stopAllWatching: () => t.invoke("stop-all-watching"),
  // File reading
  readProcessFile: (e, n) => t.invoke("read-process-file", e, n),
  readMemoryDirectory: (e) => t.invoke("read-memory-directory", e),
  // Process files listing and reading
  listProcessFiles: (e) => t.invoke("list-process-files", e),
  readFileContent: (e) => t.invoke("read-file-content", e),
  // File content watching (hot reload)
  watchFile: (e) => t.invoke("watch-file", e),
  unwatchFile: (e) => t.invoke("unwatch-file", e),
  // Process instance management
  deleteProcessInstance: (e) => t.invoke("delete-process-instance", e),
  // Template loading (unified from ~/.claude/agentic-processes/)
  loadProcessTemplates: () => t.invoke("load-process-templates"),
  // Q&A Session operations
  readQASession: (e) => t.invoke("read-qa-session", e),
  answerQuestion: (e, n, a) => t.invoke("answer-question", e, n, a),
  completeQuestion: (e, n) => t.invoke("complete-question", e, n),
  getQASessionStatus: (e) => t.invoke("get-qa-session-status", e),
  // Event listeners
  onProcessUpdate: (e) => {
    const n = (a, o) => e(o);
    return t.on("process-update", n), () => {
      t.removeListener("process-update", n);
    };
  },
  onMemoryUpdate: (e) => {
    const n = (a, o) => e(o);
    return t.on("memory-update", n), () => {
      t.removeListener("memory-update", n);
    };
  },
  onLogUpdate: (e) => {
    const n = (a, o) => e(o);
    return t.on("log-update", n), () => {
      t.removeListener("log-update", n);
    };
  },
  onFileContentUpdate: (e) => {
    const n = (a, o) => e(o);
    return t.on("file-content-update", n), () => {
      t.removeListener("file-content-update", n);
    };
  },
  onPendingInteractionUpdate: (e) => {
    const n = (a, o) => e(o);
    return t.on("pending-interaction-update", n), () => {
      t.removeListener("pending-interaction-update", n);
    };
  },
  onQASessionUpdate: (e) => {
    const n = (a, o) => e(o);
    return t.on("qa-session-update", n), () => {
      t.removeListener("qa-session-update", n);
    };
  },
  onWatcherError: (e) => {
    const n = (a, o) => e(o);
    return t.on("watcher-error", n), () => {
      t.removeListener("watcher-error", n);
    };
  },
  // ============================================================================
  // Agent Session API
  // ============================================================================
  // Get available agent types
  agentGetAvailable: () => t.invoke("agent:get-available"),
  // Create a new agent session
  agentCreate: (e, n, a, o) => t.invoke("agent:create", e, n, a, o),
  // Attach session to a process
  agentAttach: (e, n) => t.invoke("agent:attach", e, n),
  // Send a prompt to the agent
  agentSendPrompt: (e, n) => t.invoke("agent:send-prompt", e, n),
  // Send raw input (keyboard events)
  agentInput: (e, n) => t.invoke("agent:input", e, n),
  // Resize the terminal
  agentResize: (e, n, a) => t.invoke("agent:resize", e, n, a),
  // Kill a session
  agentKill: (e) => t.invoke("agent:kill", e),
  // List all sessions
  agentList: () => t.invoke("agent:list"),
  // Get a specific session
  agentGet: (e) => t.invoke("agent:get", e),
  // Get sessions for a specific process
  agentGetForProcess: (e) => t.invoke("agent:get-for-process", e),
  // External session discovery and migration
  agentDiscoverExternal: (e) => t.invoke("agent:discover-external", e),
  agentMigrateExternal: (e, n, a) => t.invoke("agent:migrate-external", e, n, a),
  // Terminal window management
  openTerminalWindow: (e, n, a) => t.invoke("agent:open-window", e, n, a),
  closeTerminalWindow: () => t.invoke("agent:close-window"),
  getWindowParams: () => t.invoke("agent:get-window-params"),
  // Clipboard
  clipboardReadText: () => t.invoke("clipboard:read-text"),
  clipboardWriteText: (e) => t.invoke("clipboard:write-text", e),
  // ============================================================================
  // Herdr API
  // ============================================================================
  herdrGetStatus: () => t.invoke("herdr:get-status"),
  onHerdrStatusChange: (e) => {
    const n = (a, o) => e(o);
    return t.on("herdr:status-changed", n), () => {
      t.removeListener("herdr:status-changed", n);
    };
  },
  // ============================================================================
  // Overview Window API
  // ============================================================================
  openOverviewWindow: () => t.invoke("overview:open-window"),
  getOverviewWindowParams: () => t.invoke("overview:get-window-params"),
  getCurrentProcesses: () => t.invoke("overview:get-current-processes"),
  navigateToProcessInMain: (e) => t.invoke("overview:navigate-to-process", e),
  onNavigateToProcessRequest: (e) => {
    const n = (a, o) => e(o);
    return t.on("navigate-to-process-request", n), () => {
      t.removeListener("navigate-to-process-request", n);
    };
  },
  // ============================================================================
  // Marketplace API
  // ============================================================================
  marketplaceList: () => t.invoke("marketplace:list"),
  marketplaceAdd: (e, n, a, o) => t.invoke("marketplace:add", e, n, a, o),
  marketplaceRemove: (e) => t.invoke("marketplace:remove", e),
  marketplaceToggle: (e) => t.invoke("marketplace:toggle", e),
  marketplaceUpdate: (e, n) => t.invoke("marketplace:update", e, n),
  marketplaceRefresh: (e) => t.invoke("marketplace:refresh", e),
  marketplaceStatus: () => t.invoke("marketplace:status"),
  marketplaceCatalog: () => t.invoke("marketplace:catalog"),
  marketplaceInstall: (e, n, a, o) => t.invoke("marketplace:install", e, n, a, o),
  marketplaceUninstall: (e, n) => t.invoke("marketplace:uninstall", e, n),
  // Agent event listeners
  onAgentOutput: (e) => {
    const n = (a, o) => e(o);
    return t.on("agent:output", n), () => {
      t.removeListener("agent:output", n);
    };
  },
  onAgentStatus: (e) => {
    const n = (a, o) => e(o);
    return t.on("agent:status", n), () => {
      t.removeListener("agent:status", n);
    };
  },
  // Auto-Update API
  updateGetCurrentVersion: () => t.invoke("update:get-current-version"),
  updateQuitAndInstall: () => t.invoke("update:quit-and-install"),
  updateStartDownload: () => t.invoke("update:start-download"),
  onUpdateStatus: (e) => {
    const n = (a, o) => e(o);
    return t.on("update:status", n), () => {
      t.removeListener("update:status", n);
    };
  }
});
