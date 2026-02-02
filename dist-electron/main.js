import { ipcMain, dialog, app, Menu, BrowserWindow } from "electron";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { readFile, readdir, stat } from "fs/promises";
import { existsSync } from "fs";
import { watch } from "chokidar";
let watcher = null;
function createFileWatcher(projectPath, callback, onError) {
  stopFileWatcher();
  const userProcessesPath = join(projectPath, ".user-processes");
  console.log("Starting file watcher for:", userProcessesPath);
  console.log("Path exists:", existsSync(userProcessesPath));
  if (!existsSync(userProcessesPath)) {
    const error = `The ".user-processes" folder was not found in "${projectPath}". Please ensure this folder exists with active/completed/failed subdirectories containing process.json files.`;
    console.error(error);
    if (onError) onError(error);
    return { success: false, error };
  }
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
    if (onError) {
      onError(`File watcher error: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  watcher.on("ready", () => {
    console.log("File watcher ready");
  });
  return { success: true };
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
let fileContentWatchers = /* @__PURE__ */ new Map();
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
    const result = createFileWatcher(
      projectPath,
      (event, fileType, data) => {
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
      },
      (error) => {
        mainWindow?.webContents.send("watcher-error", { error });
      }
    );
    if (!result.success) {
      return { success: false, error: result.error };
    }
  }
  return { success: true };
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
ipcMain.handle("list-process-files", async (_event, processPath) => {
  try {
    const processDir = dirname(processPath);
    if (!existsSync(processDir)) {
      console.log(`Process directory not found: ${processDir}`);
      return [];
    }
    const entries = await readdir(processDir);
    const files = [];
    for (const entry of entries) {
      const ext = extname(entry).toLowerCase();
      if (ext === ".md" || ext === ".json") {
        const filePath = join(processDir, entry);
        const fileStat = await stat(filePath);
        if (fileStat.isFile()) {
          files.push({
            name: entry,
            path: filePath,
            type: ext === ".md" ? "markdown" : "json",
            size: fileStat.size,
            modifiedAt: fileStat.mtime.toISOString()
          });
        }
      }
    }
    files.sort((a, b) => {
      if (a.name === "process.md") return -1;
      if (b.name === "process.md") return 1;
      return a.name.localeCompare(b.name);
    });
    return files;
  } catch (error) {
    console.error("Error listing process files:", error);
    return [];
  }
});
ipcMain.handle("read-file-content", async (_event, filePath) => {
  try {
    if (!existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return null;
    }
    const content = await readFile(filePath, "utf-8");
    return content;
  } catch (error) {
    console.error(`Error reading file content: ${filePath}`, error);
    return null;
  }
});
ipcMain.handle("watch-file", (_event, filePath) => {
  if (fileContentWatchers.has(filePath)) {
    return true;
  }
  if (!existsSync(filePath)) {
    console.log(`Cannot watch non-existent file: ${filePath}`);
    return false;
  }
  console.log(`Starting file content watcher for: ${filePath}`);
  const fileWatcher = watch(filePath, {
    persistent: true,
    usePolling: true,
    interval: 500,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100
    }
  });
  fileWatcher.on("change", async (path) => {
    console.log(`File content changed: ${path}`);
    try {
      const content = await readFile(path, "utf-8");
      mainWindow?.webContents.send("file-content-update", {
        filePath: path,
        content
      });
    } catch (error) {
      console.error(`Error reading changed file: ${path}`, error);
    }
  });
  fileWatcher.on("unlink", (path) => {
    console.log(`Watched file removed: ${path}`);
    mainWindow?.webContents.send("file-content-update", {
      filePath: path,
      content: null,
      removed: true
    });
  });
  fileContentWatchers.set(filePath, fileWatcher);
  return true;
});
ipcMain.handle("unwatch-file", (_event, filePath) => {
  const fileWatcher = fileContentWatchers.get(filePath);
  if (fileWatcher) {
    fileWatcher.close();
    fileContentWatchers.delete(filePath);
    console.log(`Stopped watching file: ${filePath}`);
  }
  return true;
});
ipcMain.handle("load-process-templates", async (_event, projectPath) => {
  try {
    const templatesPath = join(projectPath, ".processes", "templates");
    if (!existsSync(templatesPath)) {
      console.log(`Templates directory not found: ${templatesPath}`);
      return [];
    }
    const templates = [];
    const categories = await readdir(templatesPath);
    for (const category of categories) {
      const categoryPath = join(templatesPath, category);
      const categoryStat = await stat(categoryPath);
      if (!categoryStat.isDirectory() || category.startsWith(".") || category.startsWith("_")) {
        continue;
      }
      const directTemplateJson = join(categoryPath, `${category}.json`);
      if (existsSync(directTemplateJson)) {
        try {
          const content = await readFile(directTemplateJson, "utf-8");
          const template = JSON.parse(content);
          if (template.type === "template") {
            template.filePath = directTemplateJson;
            template.markdownPath = join(categoryPath, `${category}.md`);
            if (existsSync(template.markdownPath)) {
              template.markdownContent = await readFile(template.markdownPath, "utf-8");
            }
            templates.push(template);
          }
        } catch (err) {
          console.error(`Error reading template: ${directTemplateJson}`, err);
        }
        continue;
      }
      const templateFolders = await readdir(categoryPath);
      for (const templateName of templateFolders) {
        const templatePath = join(categoryPath, templateName);
        const templateStat = await stat(templatePath);
        if (!templateStat.isDirectory() || templateName.startsWith(".") || templateName.startsWith("_")) {
          continue;
        }
        const jsonPath = join(templatePath, `${templateName}.json`);
        if (existsSync(jsonPath)) {
          try {
            const content = await readFile(jsonPath, "utf-8");
            const template = JSON.parse(content);
            if (template.type === "template") {
              template.filePath = jsonPath;
              template.markdownPath = join(templatePath, `${templateName}.md`);
              if (existsSync(template.markdownPath)) {
                template.markdownContent = await readFile(template.markdownPath, "utf-8");
              }
              templates.push(template);
            }
          } catch (err) {
            console.error(`Error reading template: ${jsonPath}`, err);
          }
        }
      }
    }
    return templates;
  } catch (error) {
    console.error("Error loading process templates:", error);
    return [];
  }
});
ipcMain.handle("load-step-templates", async (_event, projectPath) => {
  try {
    const stepsPath = join(projectPath, ".processes", "steps");
    if (!existsSync(stepsPath)) {
      console.log(`Steps directory not found: ${stepsPath}`);
      return [];
    }
    const steps = [];
    const categories = await readdir(stepsPath);
    for (const category of categories) {
      const categoryPath = join(stepsPath, category);
      const categoryStat = await stat(categoryPath);
      if (!categoryStat.isDirectory() || category.startsWith(".") || category.startsWith("_")) {
        continue;
      }
      const stepFolders = await readdir(categoryPath);
      for (const stepName of stepFolders) {
        const stepPath = join(categoryPath, stepName);
        const stepStat = await stat(stepPath);
        if (!stepStat.isDirectory() || stepName.startsWith(".") || stepName.startsWith("_")) {
          continue;
        }
        const jsonPath = join(stepPath, `${stepName}.json`);
        if (existsSync(jsonPath)) {
          try {
            const content = await readFile(jsonPath, "utf-8");
            const step = JSON.parse(content);
            if (step.type === "step") {
              step.filePath = jsonPath;
              step.markdownPath = join(stepPath, `${stepName}.md`);
              if (existsSync(step.markdownPath)) {
                step.markdownContent = await readFile(step.markdownPath, "utf-8");
              }
              steps.push(step);
            }
          } catch (err) {
            console.error(`Error reading step: ${jsonPath}`, err);
          }
        }
      }
    }
    return steps;
  } catch (error) {
    console.error("Error loading step templates:", error);
    return [];
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
  for (const [, watcher2] of fileContentWatchers) {
    watcher2.close();
  }
  fileContentWatchers.clear();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
