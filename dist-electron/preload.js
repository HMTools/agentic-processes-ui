const { contextBridge: s, ipcRenderer: n } = require("electron");
s.exposeInMainWorld("electronAPI", {
  // Project selection
  selectProjectFolder: () => n.invoke("select-project-folder"),
  getCurrentProject: () => n.invoke("get-current-project"),
  setProjectPath: (e) => n.invoke("set-project-path", e),
  // File watching
  startWatching: (e) => n.invoke("start-watching", e),
  stopWatching: (e) => n.invoke("stop-watching", e),
  stopAllWatching: () => n.invoke("stop-all-watching"),
  // File reading
  readProcessFile: (e, t) => n.invoke("read-process-file", e, t),
  readMemoryDirectory: (e) => n.invoke("read-memory-directory", e),
  // Process files listing and reading
  listProcessFiles: (e) => n.invoke("list-process-files", e),
  readFileContent: (e) => n.invoke("read-file-content", e),
  // File content watching (hot reload)
  watchFile: (e) => n.invoke("watch-file", e),
  unwatchFile: (e) => n.invoke("unwatch-file", e),
  // Process instance management
  deleteProcessInstance: (e) => n.invoke("delete-process-instance", e),
  // Template loading (unified from ~/.claude/agentic-processes/)
  loadProcessTemplates: () => n.invoke("load-process-templates"),
  loadStepTemplates: () => n.invoke("load-step-templates"),
  // Q&A Session operations
  readQASession: (e) => n.invoke("read-qa-session", e),
  answerQuestion: (e, t, a) => n.invoke("answer-question", e, t, a),
  completeQuestion: (e, t) => n.invoke("complete-question", e, t),
  getQASessionStatus: (e) => n.invoke("get-qa-session-status", e),
  // Event listeners
  onProcessUpdate: (e) => {
    const t = (a, o) => e(o);
    return n.on("process-update", t), () => {
      n.removeListener("process-update", t);
    };
  },
  onMemoryUpdate: (e) => {
    const t = (a, o) => e(o);
    return n.on("memory-update", t), () => {
      n.removeListener("memory-update", t);
    };
  },
  onLogUpdate: (e) => {
    const t = (a, o) => e(o);
    return n.on("log-update", t), () => {
      n.removeListener("log-update", t);
    };
  },
  onFileContentUpdate: (e) => {
    const t = (a, o) => e(o);
    return n.on("file-content-update", t), () => {
      n.removeListener("file-content-update", t);
    };
  },
  onPendingInteractionUpdate: (e) => {
    const t = (a, o) => e(o);
    return n.on("pending-interaction-update", t), () => {
      n.removeListener("pending-interaction-update", t);
    };
  },
  onQASessionUpdate: (e) => {
    const t = (a, o) => e(o);
    return n.on("qa-session-update", t), () => {
      n.removeListener("qa-session-update", t);
    };
  },
  onWatcherError: (e) => {
    const t = (a, o) => e(o);
    return n.on("watcher-error", t), () => {
      n.removeListener("watcher-error", t);
    };
  },
  // ============================================================================
  // Agent Session API
  // ============================================================================
  // Get available agent types
  agentGetAvailable: () => n.invoke("agent:get-available"),
  // Create a new agent session
  agentCreate: (e, t, a, o) => n.invoke("agent:create", e, t, a, o),
  // Attach session to a process
  agentAttach: (e, t) => n.invoke("agent:attach", e, t),
  // Send a prompt to the agent
  agentSendPrompt: (e, t) => n.invoke("agent:send-prompt", e, t),
  // Send raw input (keyboard events)
  agentInput: (e, t) => n.invoke("agent:input", e, t),
  // Resize the terminal
  agentResize: (e, t, a) => n.invoke("agent:resize", e, t, a),
  // Kill a session
  agentKill: (e) => n.invoke("agent:kill", e),
  // List all sessions
  agentList: () => n.invoke("agent:list"),
  // Get a specific session
  agentGet: (e) => n.invoke("agent:get", e),
  // Get sessions for a specific process
  agentGetForProcess: (e) => n.invoke("agent:get-for-process", e),
  // External session discovery and migration
  agentDiscoverExternal: (e) => n.invoke("agent:discover-external", e),
  agentMigrateExternal: (e, t, a) => n.invoke("agent:migrate-external", e, t, a),
  // Terminal window management
  openTerminalWindow: (e, t, a) => n.invoke("agent:open-window", e, t, a),
  closeTerminalWindow: () => n.invoke("agent:close-window"),
  getWindowParams: () => n.invoke("agent:get-window-params"),
  // Clipboard
  clipboardReadText: () => n.invoke("clipboard:read-text"),
  clipboardWriteText: (e) => n.invoke("clipboard:write-text", e),
  // ============================================================================
  // Channel API
  // ============================================================================
  channelIsInstalled: () => n.invoke("channel:is-installed"),
  channelGetInstalledPath: () => n.invoke("channel:get-installed-path"),
  channelInstall: () => n.invoke("channel:install"),
  channelUninstall: () => n.invoke("channel:uninstall"),
  channelList: () => n.invoke("channel:list"),
  channelGetForPid: (e) => n.invoke("channel:get-for-pid", e),
  channelSendPrompt: (e, t, a) => n.invoke("channel:send-prompt", e, t, a),
  channelCheckHealth: (e) => n.invoke("channel:check-health", e),
  onChannelAvailable: (e) => {
    const t = (a, o) => e(o);
    return n.on("channel:available", t), () => {
      n.removeListener("channel:available", t);
    };
  },
  onChannelRemoved: (e) => {
    const t = (a, o) => e(o);
    return n.on("channel:removed", t), () => {
      n.removeListener("channel:removed", t);
    };
  },
  onChannelReply: (e) => {
    const t = (a, o) => e(o);
    return n.on("channel:reply", t), () => {
      n.removeListener("channel:reply", t);
    };
  },
  // ============================================================================
  // Overview Window API
  // ============================================================================
  openOverviewWindow: (e) => n.invoke("overview:open-window", e),
  getOverviewWindowParams: () => n.invoke("overview:get-window-params"),
  getCurrentProcesses: () => n.invoke("overview:get-current-processes"),
  navigateToProcessInMain: (e) => n.invoke("overview:navigate-to-process", e),
  onNavigateToProcessRequest: (e) => {
    const t = (a, o) => e(o);
    return n.on("navigate-to-process-request", t), () => {
      n.removeListener("navigate-to-process-request", t);
    };
  },
  // ============================================================================
  // Template Sources API
  // ============================================================================
  templateSourcesList: () => n.invoke("template-sources:list"),
  templateSourcesAdd: (e, t, a, o) => n.invoke("template-sources:add", e, t, a, o),
  templateSourcesRemove: (e) => n.invoke("template-sources:remove", e),
  templateSourcesToggle: (e) => n.invoke("template-sources:toggle", e),
  templateSourcesUpdate: (e, t) => n.invoke("template-sources:update", e, t),
  templateSourcesSync: (e) => n.invoke("template-sources:sync", e),
  templateSourcesStatus: () => n.invoke("template-sources:status"),
  // Agent event listeners
  onAgentOutput: (e) => {
    const t = (a, o) => e(o);
    return n.on("agent:output", t), () => {
      n.removeListener("agent:output", t);
    };
  },
  onAgentStatus: (e) => {
    const t = (a, o) => e(o);
    return n.on("agent:status", t), () => {
      n.removeListener("agent:status", t);
    };
  }
});
