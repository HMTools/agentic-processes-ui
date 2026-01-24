import { ipcMain, dialog, app, Menu, BrowserWindow } from "electron";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { watch } from "chokidar";
let watcher = null;
function createFileWatcher(projectPath, callback) {
  stopFileWatcher();
  const userProcessesPath = join(projectPath, ".user-processes");
  console.log("Starting file watcher for:", userProcessesPath);
  console.log("Path exists:", existsSync(userProcessesPath));
  watcher = watch(userProcessesPath, {
    persistent: true,
    ignoreInitial: false,
    usePolling: true,
    interval: 1e3,
    depth: 3,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100
    }
  });
  const isInProcessFolder = (path) => {
    const normalized = path.replace(/\\/g, "/");
    return normalized.includes("/active/") || normalized.includes("/completed/") || normalized.includes("/failed/");
  };
  const getFileType = (path) => {
    const normalized = path.replace(/\\/g, "/");
    if (normalized.endsWith("/process.json")) return "process";
    if (normalized.endsWith("/memory.json")) return "memory";
    if (normalized.endsWith("/log.json")) return "log";
    return null;
  };
  const getProcessPath = (filePath) => {
    const dir = dirname(filePath);
    return join(dir, "process.json");
  };
  watcher.on("add", async (path) => {
    const fileType = getFileType(path);
    if (!fileType || !isInProcessFolder(path)) {
      return;
    }
    console.log(`${fileType}.json found:`, path);
    try {
      const content = await readFile(path, "utf-8");
      const parsed = JSON.parse(content);
      const processPath = getProcessPath(path);
      console.log(`${fileType} parsed for process:`, processPath);
      callback("added", fileType, { path, processPath, content: parsed });
    } catch (error) {
      console.error(`Error reading ${fileType}.json:`, path, error);
    }
  });
  watcher.on("change", async (path) => {
    const fileType = getFileType(path);
    if (!fileType || !isInProcessFolder(path)) return;
    console.log(`${fileType}.json changed:`, path);
    try {
      const content = await readFile(path, "utf-8");
      const parsed = JSON.parse(content);
      const processPath = getProcessPath(path);
      callback("changed", fileType, { path, processPath, content: parsed });
    } catch (error) {
      console.error(`Error reading ${fileType}.json:`, path, error);
    }
  });
  watcher.on("unlink", (path) => {
    const fileType = getFileType(path);
    if (!fileType || !isInProcessFolder(path)) return;
    console.log(`${fileType}.json removed:`, path);
    const processPath = getProcessPath(path);
    callback("removed", fileType, { path, processPath });
  });
  watcher.on("error", (error) => {
    console.error("Watcher error:", error);
  });
  watcher.on("ready", () => {
    console.log("File watcher ready");
  });
}
function stopFileWatcher() {
  if (watcher) {
    watcher.close();
    watcher = null;
    console.log("File watcher stopped");
  }
}
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = dirname(__filename$1);
let mainWindow = null;
let currentProjectPath = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1e3,
    minHeight: 700,
    backgroundColor: "#0d1117",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: join(__dirname$1, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname$1, "../dist/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
ipcMain.handle("select-project-folder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
    title: "Select Project with .user-processes folder"
  });
  if (!result.canceled && result.filePaths.length > 0) {
    currentProjectPath = result.filePaths[0];
    return currentProjectPath;
  }
  return null;
});
ipcMain.handle("get-current-project", () => {
  return currentProjectPath;
});
ipcMain.handle("set-project-path", (_event, path) => {
  currentProjectPath = path;
  return true;
});
ipcMain.handle("start-watching", (_event, projectPath) => {
  if (mainWindow) {
    createFileWatcher(projectPath, (event, fileType, data) => {
      switch (fileType) {
        case "process":
          mainWindow?.webContents.send("process-update", {
            event,
            data: { path: data.processPath, process: data.content }
          });
          break;
        case "memory":
          mainWindow?.webContents.send("memory-update", {
            event,
            processPath: data.processPath,
            memory: data.content
          });
          break;
        case "log":
          mainWindow?.webContents.send("log-update", {
            event,
            processPath: data.processPath,
            log: data.content
          });
          break;
      }
    });
  }
  return true;
});
ipcMain.handle("stop-watching", () => {
  stopFileWatcher();
  return true;
});
ipcMain.handle("read-process-file", async (_event, processPath, fileName) => {
  try {
    const processDir = dirname(processPath);
    const filePath = join(processDir, fileName);
    if (!existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return null;
    }
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${fileName}:`, error);
    return null;
  }
});
app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  stopFileWatcher();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
