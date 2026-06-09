import { ipcMain, dialog, clipboard, BrowserWindow, app, Menu } from "electron";
import { join, dirname, resolve, extname } from "path";
import { homedir, platform } from "os";
import { fileURLToPath } from "url";
import { mkdir, readFile, readdir, stat, rm } from "fs/promises";
import { existsSync, readFileSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from "fs";
import { watch } from "chokidar";
import { spawn } from "node-pty";
import { EventEmitter } from "events";
import { randomUUID } from "crypto";
import { exec, execSync } from "child_process";
import { promisify } from "util";
import { request } from "http";
const AGENTIC_DIR = join(homedir(), ".claude", "agentic-processes");
const watchers = /* @__PURE__ */ new Map();
async function createFileWatcher(_projectPath, callback, onError) {
  stopFileWatcher("global");
  const agenticPath = AGENTIC_DIR;
  console.log("Starting file watcher for:", agenticPath);
  console.log("Path exists:", existsSync(agenticPath));
  if (!existsSync(agenticPath)) {
    console.log("Creating agentic-processes directory structure...");
    try {
      await mkdir(join(agenticPath, "active"), { recursive: true });
      await mkdir(join(agenticPath, "completed"), { recursive: true });
      await mkdir(join(agenticPath, "failed"), { recursive: true });
      console.log("agentic-processes directory structure created successfully");
    } catch (error) {
      const errorMsg = `Failed to create agentic-processes directory structure: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }
  const watcher = watch(agenticPath, {
    persistent: true,
    ignoreInitial: false,
    usePolling: true,
    interval: 1e3,
    depth: 4,
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
    if (normalized.endsWith("/log.json")) return "log";
    if (normalized.endsWith("/pending-interaction.json")) return "pending-interaction";
    if (normalized.endsWith("/qa-session.json")) return "qa-session";
    if (/\/memory\/[^/]+\.json$/.test(normalized)) return "memory";
    return null;
  };
  const getProcessPath = (filePath) => {
    const normalized = filePath.replace(/\\/g, "/");
    if (/\/memory\/[^/]+\.json$/.test(normalized)) {
      const memoryDir = dirname(filePath);
      const processDir = dirname(memoryDir);
      return join(processDir, "process.json");
    }
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
    console.log(`File watcher ready for: ${agenticPath}`);
  });
  watchers.set("global", watcher);
  return { success: true };
}
function stopFileWatcher(watcherId) {
  if (watcherId) {
    const watcher = watchers.get(watcherId);
    if (watcher) {
      watcher.close();
      watchers.delete(watcherId);
      console.log(`File watcher stopped for: ${watcherId}`);
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
const execAsync = promisify(exec);
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
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
async function findClaudeProcesses() {
  const isWindows = platform() === "win32";
  try {
    if (isWindows) {
      return await findClaudeProcessesWindows();
    } else {
      return await findClaudeProcessesUnix();
    }
  } catch {
    return [];
  }
}
async function findClaudeProcessesWindows() {
  let output;
  try {
    const result = await execAsync(
      `wmic process where "name like '%claude%'" get ProcessId,ParentProcessId,CommandLine /format:csv`,
      { encoding: "utf8", windowsHide: true, timeout: 1e4 }
    );
    output = result.stdout;
  } catch {
    try {
      const result = await execAsync(
        `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"name like '%claude%'\\" | Select-Object ProcessId,ParentProcessId,CommandLine | ConvertTo-Csv -NoTypeInformation"`,
        { encoding: "utf8", windowsHide: true, timeout: 15e3 }
      );
      output = result.stdout;
    } catch {
      return [];
    }
  }
  const processes = [];
  const lines = output.trim().split("\n").filter((l) => l.trim());
  for (const line of lines) {
    const parts = line.split(",");
    if (parts.length < 3) continue;
    const numbers = parts.map((p) => parseInt(p.replace(/"/g, "").trim(), 10)).filter((n) => !isNaN(n));
    if (numbers.length < 2) continue;
    const firstField = parts[0].replace(/"/g, "").trim();
    const isWmicFormat = isNaN(parseInt(firstField, 10));
    let pid, parentPid, commandLine;
    if (isWmicFormat) {
      pid = numbers[numbers.length - 1];
      parentPid = numbers[numbers.length - 2];
      commandLine = parts.slice(1, -2).join(",").replace(/"/g, "").trim();
    } else {
      pid = numbers[0];
      parentPid = numbers[1];
      commandLine = parts.slice(2).join(",").replace(/"/g, "").trim();
    }
    if (pid > 0) {
      processes.push({ pid, parentPid, commandLine });
    }
  }
  return processes;
}
async function findClaudeProcessesUnix() {
  const result = await execAsync("ps -eo pid,ppid,args", {
    encoding: "utf8",
    timeout: 5e3
  });
  const processes = [];
  const lines = result.stdout.trim().split("\n").slice(1);
  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^(\d+)\s+(\d+)\s+(.+)$/);
    if (!match) continue;
    const commandLine = match[3];
    if (/claude/i.test(commandLine) && !/grep/i.test(commandLine)) {
      processes.push({
        pid: parseInt(match[1], 10),
        parentPid: parseInt(match[2], 10),
        commandLine
      });
    }
  }
  return processes;
}
function isDescendantOf(pid, ancestorPids, allProcesses) {
  const processMap = new Map(allProcesses.map((p) => [p.pid, p]));
  let current = pid;
  const visited = /* @__PURE__ */ new Set();
  while (current > 1 && !visited.has(current)) {
    visited.add(current);
    if (ancestorPids.has(current)) return true;
    const proc = processMap.get(current);
    if (!proc) break;
    current = proc.parentPid;
  }
  return false;
}
function killProcessByPid(pid) {
  const isWindows = platform() === "win32";
  if (isWindows) {
    try {
      execSync(`taskkill /PID ${pid} /T /F`, { windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    } catch {
    }
  } else {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
    }
    setTimeout(() => {
      try {
        process.kill(pid, 0);
        process.kill(pid, "SIGKILL");
      } catch {
      }
    }, 1e3);
  }
}
const AGENT_CONFIGS = {
  "cursor": {
    command: "agent",
    args: [],
    processAttachCommand: (path) => `/process-continue ${path}`,
    available: false,
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
  async createSession(agentType, workingDirectory, processPath, options) {
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
      const envOptions = isWindows ? baseEnv : { ...baseEnv, TERM: "xterm-256color", COLORTERM: "truecolor" };
      let resolvedCwd = workingDirectory;
      if (!existsSync(resolvedCwd)) {
        if (processPath) {
          try {
            const processDir = dirname(processPath);
            const processJsonPath = join(processDir, "process.json");
            if (existsSync(processJsonPath)) {
              const processContent = JSON.parse(readFileSync(processJsonPath, "utf-8"));
              const projectPaths = processContent.metadata?.projectPaths;
              const legacyProjectPath = processContent.metadata?.projectPath;
              const derivedPath = Array.isArray(projectPaths) && projectPaths.length > 0 ? projectPaths[0] : typeof legacyProjectPath === "string" ? legacyProjectPath : null;
              if (derivedPath && existsSync(derivedPath)) {
                resolvedCwd = derivedPath;
              }
            }
          } catch {
          }
        }
        if (!existsSync(resolvedCwd)) {
          throw new Error(
            `Working directory does not exist: "${workingDirectory}". The process may have been created on a different machine. Please update the projectPaths in the process.json file.`
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
      await new Promise((resolve2) => setTimeout(resolve2, 500));
      let agentCommand = config.args?.length ? `${config.command} ${config.args.join(" ")}` : config.command;
      if (options?.permissionMode === "allow-all" && agentType === "claude-code") {
        agentCommand = `${agentCommand} --dangerously-skip-permissions`;
      }
      if (options?.resumeSessionId && agentType === "claude-code") {
        agentCommand = `${agentCommand} --resume ${options.resumeSessionId}`;
      }
      pty.write(`${agentCommand}\r`);
      const readyPattern = /[?>]\s*(for shortcuts|$)/;
      await this.waitForOutput(sessionId, readyPattern, 3e4);
      await new Promise((resolve2) => setTimeout(resolve2, 500));
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
    await new Promise((resolve2) => setTimeout(resolve2, 100));
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
    await new Promise((resolve2) => setTimeout(resolve2, 100));
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
   * Discover external Claude Code sessions attached to active processes.
   * Detection is purely file-based: if a .session file exists in the process
   * folder and this app doesn't have a managed session for it, it's external.
   * The OS process scan is deferred to migration time.
   */
  async discoverExternalSessions(activeProcesses) {
    const result = /* @__PURE__ */ new Map();
    for (const activeProc of activeProcesses) {
      const processDir = dirname(activeProc.path);
      const sessionFilePath = join(processDir, ".session");
      let realSessionId = null;
      try {
        if (existsSync(sessionFilePath)) {
          realSessionId = readFileSync(sessionFilePath, "utf-8").trim();
        }
      } catch {
      }
      if (!realSessionId) continue;
      const managedSessions = this.getSessionsForProcess(activeProc.path);
      if (managedSessions.some((s) => s.status === "running" || s.status === "starting")) continue;
      result.set(activeProc.path, {
        pid: 0,
        commandLine: "",
        claudeSessionId: realSessionId,
        processPath: activeProc.path,
        workingDirectory: activeProc.projectPaths?.[0]
      });
    }
    if (result.size > 0) {
      try {
        const allOsProcesses = await findClaudeProcesses();
        if (allOsProcesses.length > 0) {
          const managedPtyPids = /* @__PURE__ */ new Set();
          for (const session of this.sessions.values()) {
            if (session.pty) managedPtyPids.add(session.pty.pid);
          }
          const externalOsProcesses = allOsProcesses.filter(
            (proc) => !isDescendantOf(proc.pid, managedPtyPids, allOsProcesses)
          );
          for (const [path, extSession] of result) {
            for (const osProc of externalOsProcesses) {
              const sessionMatch = osProc.commandLine.includes(extSession.claudeSessionId);
              const cwdMatch = extSession.workingDirectory && osProc.commandLine.replace(/\\/g, "/").includes(extSession.workingDirectory.replace(/\\/g, "/"));
              if (sessionMatch || cwdMatch) {
                extSession.pid = osProc.pid;
                extSession.commandLine = osProc.commandLine;
                break;
              }
            }
          }
        }
      } catch {
      }
    }
    return result;
  }
  /**
   * Migrate an external Claude Code session into this app.
   * Finds and kills the external process, then resumes the session in a new PTY.
   */
  async migrateExternalSession(externalSession, workingDirectory, options) {
    const allOsProcesses = await findClaudeProcesses();
    if (allOsProcesses.length > 0) {
      const managedPtyPids = /* @__PURE__ */ new Set();
      for (const session of this.sessions.values()) {
        if (session.pty) {
          managedPtyPids.add(session.pty.pid);
        }
      }
      for (const proc of allOsProcesses) {
        if (!isDescendantOf(proc.pid, managedPtyPids, allOsProcesses)) {
          killProcessByPid(proc.pid);
        }
      }
    }
    await new Promise((resolve2) => setTimeout(resolve2, 1500));
    return this.createSession(
      "claude-code",
      workingDirectory,
      externalSession.processPath,
      { resumeSessionId: externalSession.claudeSessionId, permissionMode: options?.permissionMode }
    );
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
    return new Promise((resolve2) => {
      const session = this.sessions.get(sessionId);
      if (!session) {
        resolve2(false);
        return;
      }
      if (pattern.test(session.outputBuffer)) {
        resolve2(true);
        return;
      }
      const checkOutput = (event) => {
        if (event.sessionId !== sessionId) return;
        const currentSession = this.sessions.get(sessionId);
        if (currentSession && pattern.test(currentSession.outputBuffer)) {
          cleanup();
          resolve2(true);
        }
      };
      const timeoutId = setTimeout(() => {
        cleanup();
        resolve2(false);
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
const DISCOVERY_DIR = join(homedir(), ".claude", "agentic-processes", "channels");
class ChannelManager extends EventEmitter {
  channels = /* @__PURE__ */ new Map();
  // parentPid → endpoint
  watcher = null;
  sseAbortControllers = /* @__PURE__ */ new Map();
  // parentPid → SSE abort
  constructor() {
    super();
  }
  start() {
    mkdirSync(DISCOVERY_DIR, { recursive: true });
    this.loadExisting();
    this.startWatcher();
  }
  stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    for (const [, controller] of this.sseAbortControllers) {
      controller.abort();
    }
    this.sseAbortControllers.clear();
    this.channels.clear();
  }
  // -- Public API -----------------------------------------------------------
  getChannelForPid(claudeCodePid) {
    return this.channels.get(claudeCodePid) ?? null;
  }
  listChannels() {
    return Array.from(this.channels.values());
  }
  async checkHealth(port) {
    return new Promise((resolve2) => {
      const req = request(
        {
          hostname: "127.0.0.1",
          port,
          path: "/health",
          method: "GET",
          timeout: 3e3
        },
        (res) => {
          const chunks = [];
          res.on("data", (c) => chunks.push(c));
          res.on("end", () => {
            try {
              resolve2(JSON.parse(Buffer.concat(chunks).toString("utf-8")));
            } catch {
              resolve2(null);
            }
          });
        }
      );
      req.on("error", () => resolve2(null));
      req.on("timeout", () => {
        req.destroy();
        resolve2(null);
      });
      req.end();
    });
  }
  async sendPrompt(port, prompt, meta) {
    return new Promise((resolve2) => {
      const body = JSON.stringify({ prompt, meta });
      const req = request(
        {
          hostname: "127.0.0.1",
          port,
          path: "/prompt",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          timeout: 5e3
        },
        (res) => {
          const chunks = [];
          res.on("data", (c) => chunks.push(c));
          res.on("end", () => {
            try {
              const result = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
              resolve2(result);
            } catch {
              resolve2({ ok: false, error: "Invalid response from channel server" });
            }
          });
        }
      );
      req.on("error", (err) => resolve2({ ok: false, error: err.message }));
      req.on("timeout", () => {
        req.destroy();
        resolve2({ ok: false, error: "Request timed out" });
      });
      req.write(body);
      req.end();
    });
  }
  subscribeReplies(parentPid) {
    const endpoint = this.channels.get(parentPid);
    if (!endpoint) return;
    if (this.sseAbortControllers.has(parentPid)) return;
    const controller = new AbortController();
    this.sseAbortControllers.set(parentPid, controller);
    const connectSSE = () => {
      if (controller.signal.aborted) return;
      const req = request(
        {
          hostname: "127.0.0.1",
          port: endpoint.port,
          path: "/events",
          method: "GET",
          headers: { Accept: "text/event-stream" }
        },
        (res) => {
          let buffer = "";
          res.on("data", (chunk) => {
            buffer += chunk.toString();
            const events = buffer.split("\n\n");
            buffer = events.pop() ?? "";
            for (const raw of events) {
              const dataLine = raw.split("\n").find((l) => l.startsWith("data: "));
              if (!dataLine) continue;
              try {
                const reply = JSON.parse(dataLine.slice(6));
                this.emit("channel-reply", { parentPid, ...reply });
              } catch {
              }
            }
          });
          res.on("end", () => {
            if (!controller.signal.aborted) {
              setTimeout(connectSSE, 2e3);
            }
          });
        }
      );
      req.on("error", () => {
        if (!controller.signal.aborted) {
          setTimeout(connectSSE, 5e3);
        }
      });
      controller.signal.addEventListener("abort", () => req.destroy());
      req.end();
    };
    connectSSE();
  }
  unsubscribeReplies(parentPid) {
    const controller = this.sseAbortControllers.get(parentPid);
    if (controller) {
      controller.abort();
      this.sseAbortControllers.delete(parentPid);
    }
  }
  // -- Discovery watcher ----------------------------------------------------
  loadExisting() {
    if (!existsSync(DISCOVERY_DIR)) return;
    for (const file of readdirSync(DISCOVERY_DIR)) {
      if (!file.endsWith(".json")) continue;
      this.handleDiscoveryFile(join(DISCOVERY_DIR, file));
    }
  }
  startWatcher() {
    this.watcher = watch(DISCOVERY_DIR, {
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 200 }
    });
    this.watcher.on("add", (filePath) => this.handleDiscoveryFile(filePath));
    this.watcher.on("change", (filePath) => this.handleDiscoveryFile(filePath));
    this.watcher.on("unlink", (filePath) => this.handleDiscoveryRemoval(filePath));
  }
  handleDiscoveryFile(filePath) {
    try {
      const content = readFileSync(filePath, "utf-8");
      const data = JSON.parse(content);
      if (!data.port || !data.parentPid) return;
      if (!this.isProcessAlive(data.parentPid)) {
        try {
          unlinkSync(filePath);
        } catch {
        }
        return;
      }
      const isNew = !this.channels.has(data.parentPid);
      this.channels.set(data.parentPid, data);
      if (isNew) {
        this.emit("channel-available", {
          parentPid: data.parentPid,
          port: data.port
        });
        this.subscribeReplies(data.parentPid);
      }
    } catch {
    }
  }
  handleDiscoveryRemoval(filePath) {
    const fileName = filePath.split(/[/\\]/).pop()?.replace(".json", "");
    if (!fileName) return;
    const parentPid = parseInt(fileName, 10);
    if (isNaN(parentPid)) return;
    if (this.channels.has(parentPid)) {
      this.channels.delete(parentPid);
      this.unsubscribeReplies(parentPid);
      this.emit("channel-removed", { parentPid });
    }
  }
  isProcessAlive(pid) {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  }
}
let channelManager = null;
function getChannelManager() {
  if (!channelManager) {
    channelManager = new ChannelManager();
  }
  return channelManager;
}
function startChannelManager() {
  getChannelManager().start();
}
function stopChannelManager() {
  if (channelManager) {
    channelManager.stop();
    channelManager = null;
  }
}
const __installerFilename = fileURLToPath(import.meta.url);
const __installerDirname = dirname(__installerFilename);
const CLAUDE_CONFIG_PATH = join(homedir(), ".claude.json");
const SERVER_NAME = "agentic-processes-channel";
function getChannelServerPath() {
  const devPath = resolve(__installerDirname, "..", "channel-server", "dist", "index.js");
  if (existsSync(devPath)) return devPath;
  const prodPath = resolve(process.resourcesPath ?? __installerDirname, "channel-server", "dist", "index.js");
  if (existsSync(prodPath)) return prodPath;
  return devPath;
}
function readClaudeConfig() {
  if (!existsSync(CLAUDE_CONFIG_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CLAUDE_CONFIG_PATH, "utf-8"));
  } catch {
    return {};
  }
}
function writeClaudeConfig(config) {
  writeFileSync(CLAUDE_CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}
function isChannelInstalled() {
  const config = readClaudeConfig();
  const mcpServers = config.mcpServers ?? {};
  return SERVER_NAME in mcpServers;
}
function getInstalledChannelPath() {
  const config = readClaudeConfig();
  const mcpServers = config.mcpServers ?? {};
  const entry = mcpServers[SERVER_NAME];
  return entry?.args?.[0] ?? null;
}
function installChannelGlobally() {
  try {
    const serverPath = getChannelServerPath();
    if (!existsSync(serverPath)) {
      return { success: false, error: `Channel server not found at: ${serverPath}. Build the channel server first.` };
    }
    const config = readClaudeConfig();
    const mcpServers = config.mcpServers ?? {};
    mcpServers[SERVER_NAME] = {
      command: "node",
      args: [serverPath]
    };
    config.mcpServers = mcpServers;
    writeClaudeConfig(config);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
function uninstallChannelGlobally() {
  try {
    const config = readClaudeConfig();
    const mcpServers = config.mcpServers ?? {};
    if (!(SERVER_NAME in mcpServers)) {
      return { success: true };
    }
    delete mcpServers[SERVER_NAME];
    config.mcpServers = mcpServers;
    writeClaudeConfig(config);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = dirname(__filename$1);
let mainWindow = null;
let currentProjectPath = null;
let fileContentWatchers = /* @__PURE__ */ new Map();
let agentManagerInitialized = false;
let terminalWindows = /* @__PURE__ */ new Map();
let overviewWindows = /* @__PURE__ */ new Map();
let cachedProcesses = /* @__PURE__ */ new Map();
function broadcastToRenderers(channel, data) {
  mainWindow?.webContents.send(channel, data);
  for (const [, win] of overviewWindows) {
    if (!win.isDestroyed()) win.webContents.send(channel, data);
  }
}
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
    title: "Select Project Folder"
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
            if (event === "added" || event === "changed") {
              cachedProcesses.set(data.processPath, data.content);
            } else if (event === "removed") {
              cachedProcesses.delete(data.processPath);
            }
            broadcastToRenderers("process-update", {
              event,
              data: { path: data.processPath, process: data.content }
            });
            break;
          case "memory":
            broadcastToRenderers("memory-update", {
              event,
              processPath: data.processPath,
              memory: data.content
            });
            break;
          case "log":
            broadcastToRenderers("log-update", {
              event,
              processPath: data.processPath,
              log: data.content
            });
            break;
          case "pending-interaction":
            broadcastToRenderers("pending-interaction-update", {
              event,
              processPath: data.processPath,
              pendingInteraction: data.content
            });
            break;
          case "qa-session":
            broadcastToRenderers("qa-session-update", {
              event,
              processPath: data.processPath,
              qaSession: data.content
            });
            break;
        }
      },
      (error) => {
        broadcastToRenderers("watcher-error", { error });
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
ipcMain.handle("read-memory-directory", async (_event, processPath) => {
  try {
    const processDir = dirname(processPath);
    const memoryDir = join(processDir, "memory");
    if (!existsSync(memoryDir)) {
      console.log(`Memory directory not found: ${memoryDir}`);
      return null;
    }
    const entries = await readdir(memoryDir);
    const topics = {};
    for (const entry of entries) {
      if (!entry.endsWith(".json")) continue;
      const filePath = join(memoryDir, entry);
      try {
        const content = await readFile(filePath, "utf-8");
        const topicName = entry.replace(/\.json$/, "");
        topics[topicName] = JSON.parse(content);
      } catch (err) {
        console.error(`Error reading memory topic file: ${filePath}`, err);
      }
    }
    return topics;
  } catch (error) {
    console.error("Error reading memory directory:", error);
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
    files.sort((a, b) => a.name.localeCompare(b.name));
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
      broadcastToRenderers("file-content-update", {
        filePath: path,
        content
      });
    } catch (error) {
      console.error(`Error reading changed file: ${path}`, error);
    }
  });
  fileWatcher.on("unlink", (path) => {
    console.log(`Watched file removed: ${path}`);
    broadcastToRenderers("file-content-update", {
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
    if (!processDir.includes("agentic-processes")) {
      return { success: false, error: "Invalid path: not in agentic-processes" };
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
ipcMain.handle("read-qa-session", async (_event, processPath) => {
  try {
    const processDir = dirname(processPath);
    const qaSessionPath = join(processDir, "qa-session.json");
    if (!processDir.includes("agentic-processes")) {
      console.error("Invalid path: not in agentic-processes");
      return null;
    }
    if (!existsSync(qaSessionPath)) {
      return null;
    }
    const content = await readFile(qaSessionPath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading qa-session.json:", error);
    return null;
  }
});
ipcMain.handle("answer-question", async (_event, processPath, questionId, answer) => {
  try {
    const processDir = dirname(processPath);
    if (!processDir.includes("agentic-processes")) {
      return { success: false, error: "Invalid path" };
    }
    if (!questionId || typeof questionId !== "string") {
      return { success: false, error: "Invalid question ID" };
    }
    if (!answer || typeof answer !== "string") {
      return { success: false, error: "Invalid answer" };
    }
    const sanitizedQuestionId = questionId.replace(/[^\w-]/g, "");
    const sanitizedAnswer = answer.replace(/[\r\n]+/g, " ").trim();
    const { spawn: spawn2 } = await import("child_process");
    const pythonProcess = spawn2("python3", [
      "scripts/process_manager.py",
      "update-qa-answer",
      processPath,
      sanitizedQuestionId,
      sanitizedAnswer
    ], {
      cwd: join("C:", "Projects", "HM", "agentic-processes")
    });
    let stdout = "";
    let stderr = "";
    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    return new Promise((resolve2) => {
      pythonProcess.on("close", (code) => {
        if (code === 0) {
          resolve2({ success: true });
        } else {
          console.error(`Python script failed with code ${code}:`, stderr);
          resolve2({ success: false, error: "Failed to update answer" });
        }
      });
    });
  } catch (error) {
    console.error("Error answering question:", error);
    return {
      success: false,
      error: "Internal error"
    };
  }
});
ipcMain.handle("complete-question", async (_event, processPath, questionId) => {
  try {
    const processDir = dirname(processPath);
    if (!processDir.includes("agentic-processes")) {
      return { success: false, error: "Invalid path" };
    }
    if (!questionId || typeof questionId !== "string") {
      return { success: false, error: "Invalid question ID" };
    }
    const sanitizedQuestionId = questionId.replace(/[^\w-]/g, "");
    const { spawn: spawn2 } = await import("child_process");
    const pythonProcess = spawn2("python3", [
      "scripts/process_manager.py",
      "complete-qa-question",
      processPath,
      sanitizedQuestionId
    ], {
      cwd: join("C:", "Projects", "HM", "agentic-processes")
    });
    let stdout = "";
    let stderr = "";
    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    return new Promise((resolve2) => {
      pythonProcess.on("close", (code) => {
        if (code === 0) {
          resolve2({ success: true });
        } else {
          console.error(`Python script failed with code ${code}:`, stderr);
          resolve2({ success: false, error: "Failed to complete question" });
        }
      });
    });
  } catch (error) {
    console.error("Error completing question:", error);
    return {
      success: false,
      error: "Internal error"
    };
  }
});
ipcMain.handle("get-qa-session-status", async (_event, processPath) => {
  try {
    const processDir = dirname(processPath);
    const qaSessionPath = join(processDir, "qa-session.json");
    if (!processDir.includes("agentic-processes")) {
      return null;
    }
    if (!existsSync(qaSessionPath)) {
      return null;
    }
    const content = await readFile(qaSessionPath, "utf-8");
    const session = JSON.parse(content);
    return session.status || null;
  } catch (error) {
    console.error("Error reading qa-session status:", error);
    return null;
  }
});
const STEP_EMBED_FIELDS = [
  "output",
  "guidance",
  "substeps",
  "flow",
  "memoryFileUsage",
  "parameters",
  "improvementCategories",
  "prioritization",
  "workflow",
  "successCriteria",
  "complianceChecklist",
  "searchModes",
  "changeProposalFormat",
  "captureTypes"
];
async function resolveStepDefinitions(template, templateDir) {
  if (!template.steps || !Array.isArray(template.steps)) return;
  for (const step of template.steps) {
    if (!step.stepRef) continue;
    if (step.stepDefinition && Object.keys(step.stepDefinition).length > 0) continue;
    const stepJsonPath = join(templateDir, step.stepRef, `${step.stepRef}.json`);
    if (existsSync(stepJsonPath)) {
      try {
        const stepContent = await readFile(stepJsonPath, "utf-8");
        const stepData = JSON.parse(stepContent);
        const embedded = {};
        for (const field of STEP_EMBED_FIELDS) {
          if (field in stepData) {
            embedded[field] = stepData[field];
          }
        }
        step.stepDefinition = embedded;
      } catch (err) {
        console.error(`Error resolving step definition: ${stepJsonPath}`, err);
      }
    }
  }
}
ipcMain.handle("load-process-templates", async () => {
  try {
    const templatesPath = join(homedir(), ".claude", "agentic-processes", "templates", "processes");
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
            await resolveStepDefinitions(template, categoryPath);
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
              await resolveStepDefinitions(template, templatePath);
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
ipcMain.handle("load-step-templates", async () => {
  try {
    const stepsPath = join(homedir(), ".claude", "agentic-processes", "templates", "steps");
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
ipcMain.handle("agent:create", async (_event, agentType, workingDirectory, processPath, options) => {
  try {
    initializeAgentManager();
    const agentManager2 = getAgentManager();
    const session = await agentManager2.createSession(agentType, workingDirectory, processPath, {
      permissionMode: options?.permissionMode
    });
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
ipcMain.handle("agent:discover-external", async (_event, activeProcesses) => {
  try {
    initializeAgentManager();
    const agentManager2 = getAgentManager();
    const externalSessions = await agentManager2.discoverExternalSessions(activeProcesses);
    const sessionsObj = {};
    for (const [key, value] of externalSessions) {
      sessionsObj[key] = value;
    }
    return { success: true, sessions: sessionsObj };
  } catch (error) {
    console.error("Error discovering external sessions:", error);
    return {
      success: false,
      sessions: {},
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
});
ipcMain.handle("agent:migrate-external", async (_event, externalSession, workingDirectory, options) => {
  try {
    initializeAgentManager();
    const agentManager2 = getAgentManager();
    const session = await agentManager2.migrateExternalSession(externalSession, workingDirectory, {
      permissionMode: options?.permissionMode
    });
    return { success: true, session };
  } catch (error) {
    console.error("Error migrating external session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
});
let channelManagerInitialized = false;
function initializeChannelManager() {
  if (channelManagerInitialized) return;
  channelManagerInitialized = true;
  startChannelManager();
  const cm = getChannelManager();
  cm.on("channel-available", (event) => {
    mainWindow?.webContents.send("channel:available", event);
  });
  cm.on("channel-removed", (event) => {
    mainWindow?.webContents.send("channel:removed", event);
  });
  cm.on("channel-reply", (event) => {
    mainWindow?.webContents.send("channel:reply", event);
  });
}
ipcMain.handle("channel:is-installed", () => {
  return isChannelInstalled();
});
ipcMain.handle("channel:get-installed-path", () => {
  return getInstalledChannelPath();
});
ipcMain.handle("channel:install", () => {
  return installChannelGlobally();
});
ipcMain.handle("channel:uninstall", () => {
  return uninstallChannelGlobally();
});
ipcMain.handle("channel:list", () => {
  initializeChannelManager();
  return getChannelManager().listChannels();
});
ipcMain.handle("channel:get-for-pid", (_event, pid) => {
  initializeChannelManager();
  return getChannelManager().getChannelForPid(pid);
});
ipcMain.handle("channel:send-prompt", async (_event, port, prompt, meta) => {
  initializeChannelManager();
  return getChannelManager().sendPrompt(port, prompt, meta);
});
ipcMain.handle("channel:check-health", async (_event, port) => {
  initializeChannelManager();
  return getChannelManager().checkHealth(port);
});
function createOverviewWindow(projectPaths) {
  const existing = overviewWindows.get("default");
  if (existing && !existing.isDestroyed()) {
    existing.focus();
    return;
  }
  const overviewWin = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: join(__dirname$1, "../images/icon.png"),
    backgroundColor: "#0d1117",
    title: "Processes Overview",
    webPreferences: {
      preload: join(__dirname$1, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  overviewWin.setMenuBarVisibility(false);
  const queryParams = `?projectPaths=${encodeURIComponent(JSON.stringify(projectPaths))}`;
  if (process.env.VITE_DEV_SERVER_URL) {
    overviewWin.loadURL(`${process.env.VITE_DEV_SERVER_URL}overview-window.html${queryParams}`);
  } else {
    overviewWin.loadFile(join(__dirname$1, "../dist/overview-window.html"), {
      search: queryParams
    });
  }
  overviewWindows.set("default", overviewWin);
  overviewWin.on("closed", () => {
    overviewWindows.delete("default");
  });
}
ipcMain.handle("overview:open-window", (_event, projectPaths) => {
  try {
    createOverviewWindow(projectPaths);
    return { success: true };
  } catch (error) {
    console.error("Error opening overview window:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
});
ipcMain.handle("overview:get-window-params", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return null;
  try {
    const url = win.webContents.getURL();
    const urlObj = new URL(url);
    const projectPathsParam = urlObj.searchParams.get("projectPaths");
    return {
      projectPaths: projectPathsParam ? JSON.parse(projectPathsParam) : []
    };
  } catch {
    return null;
  }
});
ipcMain.handle("overview:get-current-processes", () => {
  const result = {};
  for (const [path, process2] of cachedProcesses) {
    result[path] = process2;
  }
  return result;
});
ipcMain.handle("overview:navigate-to-process", (_event, processPath) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("navigate-to-process-request", processPath);
    mainWindow.focus();
  }
  return { success: true };
});
async function runTemplateManagerCommand(args) {
  const { spawn: spawn2 } = await import("child_process");
  return new Promise((resolve2) => {
    const proc = spawn2("python3", ["scripts/template_manager.py", ...args], {
      cwd: join("C:", "Projects", "HM", "agentic-processes")
    });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    proc.on("close", (code) => {
      if (code === 0) {
        try {
          resolve2({ success: true, data: JSON.parse(stdout) });
        } catch {
          resolve2({ success: false, error: "Failed to parse response" });
        }
      } else {
        let errorMsg = stderr || "Command failed";
        try {
          const parsed = JSON.parse(stdout);
          if (parsed.message) errorMsg = parsed.message;
        } catch {
        }
        resolve2({ success: false, error: errorMsg });
      }
    });
    proc.on("error", (err) => {
      resolve2({ success: false, error: err.message });
    });
  });
}
ipcMain.handle("template-sources:list", async () => {
  return runTemplateManagerCommand(["list-sources"]);
});
ipcMain.handle("template-sources:add", async (_event, name, url, branch, priority) => {
  return runTemplateManagerCommand([
    "add-source",
    "--name",
    name,
    "--url",
    url,
    "--branch",
    branch,
    "--priority",
    String(priority)
  ]);
});
ipcMain.handle("template-sources:remove", async (_event, name) => {
  return runTemplateManagerCommand(["remove-source", "--name", name]);
});
ipcMain.handle("template-sources:toggle", async (_event, name) => {
  return runTemplateManagerCommand(["toggle-source", "--name", name]);
});
ipcMain.handle("template-sources:update", async (_event, name, updates) => {
  const args = ["update-source", "--name", name];
  if (updates.newName) args.push("--new-name", updates.newName);
  if (updates.url) args.push("--url", updates.url);
  if (updates.branch) args.push("--branch", updates.branch);
  if (updates.priority !== void 0) args.push("--priority", String(updates.priority));
  return runTemplateManagerCommand(args);
});
ipcMain.handle("template-sources:sync", async (_event, sourceName) => {
  const args = ["sync"];
  if (sourceName) args.push("--source", sourceName);
  return runTemplateManagerCommand(args);
});
ipcMain.handle("template-sources:status", async () => {
  return runTemplateManagerCommand(["status"]);
});
app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
  initializeChannelManager();
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
  for (const [, win] of overviewWindows) {
    if (!win.isDestroyed()) {
      win.close();
    }
  }
  overviewWindows.clear();
  cleanupAgentManager();
  stopChannelManager();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
