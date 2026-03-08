import { ipcMain, dialog, clipboard, BrowserWindow, app, Menu } from "electron";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { mkdir, readFile, readdir, stat, rm } from "fs/promises";
import { existsSync } from "fs";
import { watch } from "chokidar";
import { spawn } from "node-pty";
import { EventEmitter } from "events";
import { randomUUID } from "crypto";
import { platform } from "os";
import { execSync } from "child_process";
const watchers = /* @__PURE__ */ new Map();
async function createFileWatcher(projectPath, callback, onError) {
  stopFileWatcher(projectPath);
  const userProcessesPath = join(projectPath, ".user-processes");
  console.log("Starting file watcher for:", userProcessesPath);
  console.log("Path exists:", existsSync(userProcessesPath));
  if (!existsSync(userProcessesPath)) {
    console.log("Creating .user-processes directory structure...");
    try {
      await mkdir(join(userProcessesPath, "active"), { recursive: true });
      await mkdir(join(userProcessesPath, "completed"), { recursive: true });
      await mkdir(join(userProcessesPath, "failed"), { recursive: true });
      console.log(".user-processes directory structure created successfully");
    } catch (error) {
      const errorMsg = `Failed to create .user-processes directory structure: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }
  const watcher = watch(userProcessesPath, {
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
    if (normalized.endsWith("/pending-interaction.json")) return "pending-interaction";
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
    console.log(`File watcher ready for: ${projectPath}`);
  });
  watchers.set(projectPath, watcher);
  return { success: true };
}
function stopFileWatcher(projectPath) {
  if (projectPath) {
    const watcher = watchers.get(projectPath);
    if (watcher) {
      watcher.close();
      watchers.delete(projectPath);
      console.log(`File watcher stopped for: ${projectPath}`);
    }
  } else {
    stopAllFileWatchers();
  }
}
function stopAllFileWatchers() {
  for (const [path, watcher] of watchers) {
    watcher.close();
    console.log(`File watcher stopped for: ${path}`);
  }
  watchers.clear();
  console.log("All file watchers stopped");
}
function readRegistryValue(key, valueName) {
  try {
    const output = execSync(`reg query "${key}" /v "${valueName}"`, {
      encoding: "utf8",
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"]
    });
    const match = output.match(/REG_(?:SZ|EXPAND_SZ)\s+(.+)$/m);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}
function getFreshWindowsPath() {
  try {
    const systemPath = readRegistryValue(
      "HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment",
      "Path"
    ) || "";
    const userPath = readRegistryValue(
      "HKEY_CURRENT_USER\\Environment",
      "Path"
    ) || "";
    const combinedPath = userPath && systemPath ? `${userPath};${systemPath}` : userPath || systemPath;
    return combinedPath;
  } catch {
    return process.env.PATH || process.env.Path || "";
  }
}
function getFreshWindowsEnv() {
  const env = { ...process.env };
  const freshPath = getFreshWindowsPath();
  if (freshPath) {
    env.PATH = freshPath;
    env.Path = freshPath;
  }
  return env;
}
function getCursorCliDir() {
  const localAppData = process.env.LOCALAPPDATA || "";
  return `${localAppData}\\cursor-agent`;
}
function getWindowsEnvWithCursorPath(baseEnv) {
  const cursorCliDir = getCursorCliDir();
  const currentPath = baseEnv.PATH || baseEnv.Path || "";
  if (!currentPath.toLowerCase().includes(cursorCliDir.toLowerCase())) {
    return {
      ...baseEnv,
      PATH: `${cursorCliDir};${currentPath}`
    };
  }
  return baseEnv;
}
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const AGENT_CONFIGS = {
  "cursor": {
    command: "agent",
    // Works because we add cursor-agent dir to PATH
    args: [],
    processAttachCommand: (path) => `/process-continue ${path}`,
    available: true,
    displayName: "Cursor Agent"
  },
  "github-copilot": {
    command: "gh",
    args: ["copilot"],
    processAttachCommand: (_path) => "",
    // Future implementation
    available: false,
    displayName: "GitHub Copilot"
  },
  "claude-code": {
    command: "claude",
    args: [],
    processAttachCommand: (path) => `/process-continue ${path}`,
    available: true,
    displayName: "Claude Code"
  }
};
class AgentSessionManager extends EventEmitter {
  sessions = /* @__PURE__ */ new Map();
  shell;
  constructor() {
    super();
    this.shell = platform() === "win32" ? "cmd.exe" : process.env.SHELL || "/bin/bash";
  }
  /**
   * Get all available agent types with their configurations
   */
  getAvailableAgents() {
    return Object.entries(AGENT_CONFIGS).filter(([, config]) => config.available).map(([type, config]) => ({ type, config }));
  }
  /**
   * Create a new agent session
   */
  async createSession(agentType, workingDirectory, processPath) {
    const config = AGENT_CONFIGS[agentType];
    if (!config.available) {
      throw new Error(`Agent type '${agentType}' is not available yet`);
    }
    const sessionId = randomUUID();
    const session = {
      id: sessionId,
      agentType,
      attachedProcessId: null,
      attachedProcessPath: processPath || null,
      status: "starting",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      workingDirectory,
      pty: null,
      outputBuffer: ""
    };
    this.sessions.set(sessionId, session);
    try {
      const isWindows = platform() === "win32";
      const baseEnv = isWindows ? getFreshWindowsEnv() : process.env;
      const envOptions = isWindows ? getWindowsEnvWithCursorPath(baseEnv) : { ...baseEnv, TERM: "xterm-256color", COLORTERM: "truecolor" };
      let resolvedCwd = workingDirectory;
      if (!existsSync(resolvedCwd)) {
        if (processPath) {
          const normalized = processPath.replace(/\\/g, "/");
          const userProcessIdx = normalized.indexOf("/.user-processes/");
          const processIdx = normalized.indexOf("/.processes/");
          const idx = userProcessIdx !== -1 ? userProcessIdx : processIdx;
          if (idx !== -1) {
            const derived = processPath.substring(0, idx);
            if (existsSync(derived)) {
              resolvedCwd = derived;
            }
          }
        }
        if (!existsSync(resolvedCwd)) {
          throw new Error(
            `Working directory does not exist: "${workingDirectory}". The process may have been created on a different machine. Please update the projectPath in the process.json file.`
          );
        }
      }
      const pty = spawn(this.shell, [], {
        name: "xterm-256color",
        cols: 120,
        rows: 30,
        cwd: resolvedCwd,
        env: envOptions,
        useConpty: isWindows
        // Use Windows ConPTY for better compatibility
      });
      session.pty = pty;
      pty.onData((data) => {
        session.outputBuffer += data;
        if (session.outputBuffer.length > 10240) {
          session.outputBuffer = session.outputBuffer.slice(-10240);
        }
        this.emit("output", {
          sessionId,
          data
        });
      });
      pty.onExit(({ exitCode }) => {
        const currentSession = this.sessions.get(sessionId);
        if (currentSession) {
          if (currentSession.status === "stopped") {
            currentSession.pty = null;
            return;
          }
          currentSession.status = exitCode === 0 ? "stopped" : "error";
          currentSession.pty = null;
          this.emit("status", {
            sessionId,
            status: currentSession.status,
            error: exitCode !== 0 ? `Process exited with code ${exitCode}` : void 0
          });
        }
      });
      await new Promise((resolve) => setTimeout(resolve, 500));
      const agentCommand = config.args?.length ? `${config.command} ${config.args.join(" ")}` : config.command;
      pty.write(`${agentCommand}\r`);
      const readyPattern = /[?>]\s*(for shortcuts|$)/;
      await this.waitForOutput(sessionId, readyPattern, 3e4);
      await new Promise((resolve) => setTimeout(resolve, 500));
      session.status = "running";
      this.emit("status", {
        sessionId,
        status: "running"
      });
      if (processPath) {
        await this.attachToProcess(sessionId, processPath);
      }
      return this.getSessionPublic(session);
    } catch (error) {
      session.status = "error";
      this.emit("status", {
        sessionId,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
      throw error;
    }
  }
  /**
   * Attach an existing session to an agentic process
   */
  async attachToProcess(sessionId, processPath) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session '${sessionId}' not found`);
    }
    if (!session.pty) {
      throw new Error(`Session '${sessionId}' has no active PTY`);
    }
    const config = AGENT_CONFIGS[session.agentType];
    const attachCommand = config.processAttachCommand(processPath);
    if (!attachCommand) {
      throw new Error(`Agent type '${session.agentType}' does not support process attachment`);
    }
    this.clearOutputBuffer(sessionId);
    session.pty.write(attachCommand);
    const commandEnd = attachCommand.slice(-20);
    const echoPattern = new RegExp(escapeRegex(commandEnd));
    await this.waitForOutput(sessionId, echoPattern, 5e3);
    await new Promise((resolve) => setTimeout(resolve, 100));
    session.pty.write("\r");
    session.attachedProcessPath = processPath;
    this.emit("status", {
      sessionId,
      status: session.status
    });
  }
  /**
   * Send a prompt/command to the agent session
   */
  async sendPrompt(sessionId, prompt) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session '${sessionId}' not found`);
    }
    if (!session.pty) {
      throw new Error(`Session '${sessionId}' has no active PTY`);
    }
    if (session.status !== "running") {
      throw new Error(`Session '${sessionId}' is not running (status: ${session.status})`);
    }
    this.clearOutputBuffer(sessionId);
    session.pty.write(prompt);
    const promptEnd = prompt.slice(-20);
    const echoPattern = new RegExp(escapeRegex(promptEnd));
    await this.waitForOutput(sessionId, echoPattern, 5e3);
    await new Promise((resolve) => setTimeout(resolve, 100));
    session.pty.write("\r");
  }
  /**
   * Resize the PTY terminal
   */
  resizeTerminal(sessionId, cols, rows) {
    const session = this.sessions.get(sessionId);
    if (session?.pty) {
      session.pty.resize(cols, rows);
    }
  }
  /**
   * Send raw input to the PTY (for keyboard events)
   */
  sendInput(sessionId, data) {
    const session = this.sessions.get(sessionId);
    if (session?.pty) {
      session.pty.write(data);
    }
  }
  /**
   * Kill an agent session
   */
  killSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }
    if (session.pty) {
      session.pty.kill();
      session.pty = null;
    }
    session.status = "stopped";
    this.emit("status", {
      sessionId,
      status: "stopped"
    });
  }
  /**
   * Get a session by ID
   */
  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? this.getSessionPublic(session) : null;
  }
  /**
   * Get all active sessions
   */
  listSessions() {
    return Array.from(this.sessions.values()).map((s) => this.getSessionPublic(s));
  }
  /**
   * Get sessions attached to a specific process
   */
  getSessionsForProcess(processPath) {
    return Array.from(this.sessions.values()).filter((s) => s.attachedProcessPath === processPath).map((s) => this.getSessionPublic(s));
  }
  /**
   * Clean up all sessions
   */
  cleanup() {
    for (const [sessionId] of this.sessions) {
      this.killSession(sessionId);
    }
    this.sessions.clear();
  }
  /**
   * Wait for a pattern to appear in the PTY output
   * Returns true if pattern found, false if timeout
   */
  waitForOutput(sessionId, pattern, timeoutMs = 5e3) {
    return new Promise((resolve) => {
      const session = this.sessions.get(sessionId);
      if (!session) {
        resolve(false);
        return;
      }
      if (pattern.test(session.outputBuffer)) {
        resolve(true);
        return;
      }
      const checkOutput = (event) => {
        if (event.sessionId !== sessionId) return;
        const currentSession = this.sessions.get(sessionId);
        if (currentSession && pattern.test(currentSession.outputBuffer)) {
          cleanup();
          resolve(true);
        }
      };
      const timeoutId = setTimeout(() => {
        cleanup();
        resolve(false);
      }, timeoutMs);
      const cleanup = () => {
        clearTimeout(timeoutId);
        this.off("output", checkOutput);
      };
      this.on("output", checkOutput);
    });
  }
  /**
   * Clear the output buffer for a session
   */
  clearOutputBuffer(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.outputBuffer = "";
    }
  }
  /**
   * Convert internal session to public session (without PTY reference)
   */
  getSessionPublic(session) {
    const { pty: _pty, outputBuffer: _buffer, ...publicSession } = session;
    return publicSession;
  }
}
let agentManager = null;
function getAgentManager() {
  if (!agentManager) {
    agentManager = new AgentSessionManager();
  }
  return agentManager;
}
function cleanupAgentManager() {
  if (agentManager) {
    agentManager.cleanup();
    agentManager = null;
  }
}
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = dirname(__filename$1);
let mainWindow = null;
let currentProjectPath = null;
let fileContentWatchers = /* @__PURE__ */ new Map();
let agentManagerInitialized = false;
let terminalWindows = /* @__PURE__ */ new Map();
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1e3,
    minHeight: 700,
    icon: join(__dirname$1, "../images/icon.png"),
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
    mainWindow.webContents.on("console-message", (_event, level, message) => {
      if (message.includes("Autofill.enable") || message.includes("Autofill.setAddresses")) {
        return;
      }
    });
  } else {
    mainWindow.loadFile(join(__dirname$1, "../dist/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
function createTerminalWindow(sessionId, processPath, processName) {
  const existing = terminalWindows.get(sessionId);
  if (existing && !existing.isDestroyed()) {
    existing.focus();
    return;
  }
  const terminalWin = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    icon: join(__dirname$1, "../images/icon.png"),
    backgroundColor: "#0d1117",
    title: processName || "Agent Terminal",
    webPreferences: {
      preload: join(__dirname$1, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  terminalWin.setMenuBarVisibility(false);
  const queryParams = `?sessionId=${encodeURIComponent(sessionId)}&processPath=${encodeURIComponent(processPath)}&processName=${encodeURIComponent(processName)}`;
  if (process.env.VITE_DEV_SERVER_URL) {
    terminalWin.loadURL(`${process.env.VITE_DEV_SERVER_URL}terminal-window.html${queryParams}`);
  } else {
    terminalWin.loadFile(join(__dirname$1, "../dist/terminal-window.html"), {
      search: queryParams
    });
  }
  terminalWindows.set(sessionId, terminalWin);
  terminalWin.on("closed", () => {
    terminalWindows.delete(sessionId);
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
ipcMain.handle("start-watching", async (_event, projectPath) => {
  if (mainWindow) {
    const result = await createFileWatcher(
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
          case "pending-interaction":
            mainWindow?.webContents.send("pending-interaction-update", {
              event,
              processPath: data.processPath,
              pendingInteraction: data.content
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
ipcMain.handle("stop-watching", (_event, projectPath) => {
  stopFileWatcher(projectPath);
  return true;
});
ipcMain.handle("stop-all-watching", () => {
  stopAllFileWatchers();
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
ipcMain.handle("delete-process-instance", async (_event, processPath) => {
  try {
    const processDir = dirname(processPath);
    if (!processDir.includes(".user-processes")) {
      return { success: false, error: "Invalid path: not in .user-processes" };
    }
    if (!existsSync(processDir)) {
      return { success: false, error: "Process directory not found" };
    }
    await rm(processDir, { recursive: true, force: true });
    console.log(`Deleted process directory: ${processDir}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting process instance:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
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
ipcMain.handle("load-user-templates", async (_event, projectPath) => {
  try {
    const templatesPath = join(projectPath, ".user-processes", "templates");
    if (!existsSync(templatesPath)) {
      console.log(`User templates directory not found: ${templatesPath}`);
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
          console.error(`Error reading user template: ${directTemplateJson}`, err);
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
            console.error(`Error reading user template: ${jsonPath}`, err);
          }
        }
      }
    }
    return templates;
  } catch (error) {
    console.error("Error loading user templates:", error);
    return [];
  }
});
ipcMain.handle("load-user-steps", async (_event, projectPath) => {
  try {
    const stepsPath = join(projectPath, ".user-processes", "steps");
    if (!existsSync(stepsPath)) {
      console.log(`User steps directory not found: ${stepsPath}`);
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
            console.error(`Error reading user step: ${jsonPath}`, err);
          }
        }
      }
    }
    return steps;
  } catch (error) {
    console.error("Error loading user steps:", error);
    return [];
  }
});
ipcMain.handle("detect-folder-type", async (_event, path) => {
  return {
    hasProcesses: existsSync(join(path, ".processes")),
    hasUserProcesses: existsSync(join(path, ".user-processes"))
  };
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
ipcMain.handle("clipboard:read-text", () => {
  return clipboard.readText();
});
ipcMain.handle("clipboard:write-text", (_event, text) => {
  clipboard.writeText(text);
  return true;
});
function initializeAgentManager() {
  if (agentManagerInitialized) return;
  const agentManager2 = getAgentManager();
  agentManager2.on("output", (event) => {
    mainWindow?.webContents.send("agent:output", event);
    const terminalWin = terminalWindows.get(event.sessionId);
    if (terminalWin && !terminalWin.isDestroyed()) {
      terminalWin.webContents.send("agent:output", event);
    }
  });
  agentManager2.on("status", (event) => {
    mainWindow?.webContents.send("agent:status", event);
    const terminalWin = terminalWindows.get(event.sessionId);
    if (terminalWin && !terminalWin.isDestroyed()) {
      terminalWin.webContents.send("agent:status", event);
    }
  });
  agentManagerInitialized = true;
}
ipcMain.handle("agent:get-available", () => {
  return Object.entries(AGENT_CONFIGS).map(([type, config]) => ({
    type,
    displayName: config.displayName,
    available: config.available
  }));
});
ipcMain.handle("agent:create", async (_event, agentType, workingDirectory, processPath) => {
  try {
    initializeAgentManager();
    const agentManager2 = getAgentManager();
    const session = await agentManager2.createSession(agentType, workingDirectory, processPath);
    return { success: true, session };
  } catch (error) {
    console.error("Error creating agent session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
});
ipcMain.handle("agent:attach", async (_event, sessionId, processPath) => {
  try {
    const agentManager2 = getAgentManager();
    await agentManager2.attachToProcess(sessionId, processPath);
    return { success: true };
  } catch (error) {
    console.error("Error attaching to process:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
});
ipcMain.handle("agent:send-prompt", async (_event, sessionId, prompt) => {
  try {
    const agentManager2 = getAgentManager();
    await agentManager2.sendPrompt(sessionId, prompt);
    return { success: true };
  } catch (error) {
    console.error("Error sending prompt:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
});
ipcMain.handle("agent:input", (_event, sessionId, data) => {
  try {
    const agentManager2 = getAgentManager();
    agentManager2.sendInput(sessionId, data);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
});
ipcMain.handle("agent:resize", (_event, sessionId, cols, rows) => {
  try {
    const agentManager2 = getAgentManager();
    agentManager2.resizeTerminal(sessionId, cols, rows);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
});
ipcMain.handle("agent:kill", (_event, sessionId) => {
  try {
    const agentManager2 = getAgentManager();
    agentManager2.killSession(sessionId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
});
ipcMain.handle("agent:list", () => {
  try {
    const agentManager2 = getAgentManager();
    return { success: true, sessions: agentManager2.listSessions() };
  } catch (error) {
    return {
      success: false,
      sessions: [],
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
});
ipcMain.handle("agent:get", (_event, sessionId) => {
  try {
    const agentManager2 = getAgentManager();
    const session = agentManager2.getSession(sessionId);
    return { success: true, session };
  } catch (error) {
    return {
      success: false,
      session: null,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
});
ipcMain.handle("agent:open-window", (_event, sessionId, processPath, processName) => {
  try {
    createTerminalWindow(sessionId, processPath, processName);
    return { success: true };
  } catch (error) {
    console.error("Error opening terminal window:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
});
ipcMain.handle("agent:close-window", (_event) => {
  try {
    const win = BrowserWindow.getFocusedWindow();
    if (win && win !== mainWindow) {
      win.close();
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
});
ipcMain.handle("agent:get-window-params", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return null;
  try {
    const url = win.webContents.getURL();
    const urlObj = new URL(url);
    return {
      sessionId: urlObj.searchParams.get("sessionId"),
      processPath: urlObj.searchParams.get("processPath"),
      processName: urlObj.searchParams.get("processName")
    };
  } catch {
    return null;
  }
});
ipcMain.handle("agent:get-for-process", (_event, processPath) => {
  try {
    const agentManager2 = getAgentManager();
    const sessions = agentManager2.getSessionsForProcess(processPath);
    return { success: true, sessions };
  } catch (error) {
    return {
      success: false,
      sessions: [],
      error: error instanceof Error ? error.message : "Unknown error"
    };
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
  stopAllFileWatchers();
  for (const [, watcher] of fileContentWatchers) {
    watcher.close();
  }
  fileContentWatchers.clear();
  for (const [, win] of terminalWindows) {
    if (!win.isDestroyed()) {
      win.close();
    }
  }
  terminalWindows.clear();
  cleanupAgentManager();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
