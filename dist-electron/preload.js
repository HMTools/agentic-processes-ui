const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  // Project selection
  selectProjectFolder: () => ipcRenderer.invoke("select-project-folder"),
  getCurrentProject: () => ipcRenderer.invoke("get-current-project"),
  setProjectPath: (path) => ipcRenderer.invoke("set-project-path", path),
  // File watching
  startWatching: (projectPath) => ipcRenderer.invoke("start-watching", projectPath),
  stopWatching: () => ipcRenderer.invoke("stop-watching"),
  // File reading
  readProcessFile: (processPath, fileName) => ipcRenderer.invoke("read-process-file", processPath, fileName),
  // Process files listing and reading
  listProcessFiles: (processPath) => ipcRenderer.invoke("list-process-files", processPath),
  readFileContent: (filePath) => ipcRenderer.invoke("read-file-content", filePath),
  // File content watching (hot reload)
  watchFile: (filePath) => ipcRenderer.invoke("watch-file", filePath),
  unwatchFile: (filePath) => ipcRenderer.invoke("unwatch-file", filePath),
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
  }
});
