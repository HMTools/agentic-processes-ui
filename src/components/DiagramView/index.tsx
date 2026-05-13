import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { ProcessInstance, ProcessStep, ProcessMemory, ProcessLog, ChildProcessRef, ParentProcessRef, ExternalSession, QASessionFile } from '../../types'
import { ProcessDiagram } from './ProcessDiagram'
import { RightPanel } from './RightPanel'
import { Alert } from '../Alert'
import { LazyPromptButton } from '../LazyPromptButton'
import { LazyPromptModal } from '../LazyPromptModal'
import { AgentSessionPanel } from '../AgentSessionPanel'
import { ConfirmationModal } from '../ConfirmationModal'
import { useToast } from '../Toast'
import { getStatusColor, formatTimestamp } from '../../services/processService'
import { useAgentSessions } from '../../hooks/useAgentSessions'
import { useSettings } from '../../hooks/useSettings'
import { readQASession } from '../../services/qaSessionService'

interface DiagramViewProps {
  process: ProcessInstance
  processPath: string
  onBack: () => void
  onNavigateToProcess: (path: string) => void
  getProcess: (path: string) => ProcessInstance | undefined
  navigatedFromPath: string | null
  externalSession?: ExternalSession | null
  onMigrateSession?: () => Promise<void>
}

// Check if we're running in Electron
const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined
}

// Agent panel resize constants
const AGENT_PANEL_MIN_HEIGHT = 150
const AGENT_PANEL_MAX_HEIGHT = 600
const AGENT_PANEL_DEFAULT_HEIGHT = 300

export function DiagramView({ process, processPath, onBack, onNavigateToProcess, getProcess, navigatedFromPath, externalSession, onMigrateSession }: DiagramViewProps) {
  const [selectedStep, setSelectedStep] = useState<ProcessStep | null>(null)
  const [memory, setMemory] = useState<ProcessMemory | null>(null)
  const [log, setLog] = useState<ProcessLog | null>(null)
  const [qaSession, setQASession] = useState<QASessionFile | null>(null)
  const [memoryLoading, setMemoryLoading] = useState(false)
  const [logLoading, setLogLoading] = useState(false)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [showAgentPanel, setShowAgentPanel] = useState(false)

  // Agent panel resize state
  const [agentPanelHeight, setAgentPanelHeight] = useState(AGENT_PANEL_DEFAULT_HEIGHT)
  const [isResizingAgent, setIsResizingAgent] = useState(false)
  const mainContentRef = useRef<HTMLDivElement>(null)

  // Lazy prompt modal state (for Shift+P shortcut)
  const [showLazyPromptModal, setShowLazyPromptModal] = useState(false)
  const { settings } = useSettings()

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { showToast } = useToast()

  // Agent sessions for this process
  const { hasActiveSession } = useAgentSessions({ processPath })

  // Get project path for agent working directory (prefer projectPaths array, fallback to legacy projectPath)
  const projectPath = process.metadata.projectPaths?.[0] || process.metadata.projectPath || ''

  // Delete handler
  const handleDelete = async () => {
    setDeleting(true)
    const result = await window.electronAPI.deleteProcessInstance(processPath)

    if (result.success) {
      onBack() // Navigate to dashboard first
      showToast('Process deleted successfully', 'success')
    } else {
      showToast(result.error || 'Failed to delete process', 'error')
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const completedSteps = process.steps.filter(s => s.status === 'completed').length
  const progress = Math.round((completedSteps / process.steps.length) * 100)

  // Load memory, log, and Q&A session files
  const loadProcessFiles = useCallback(async () => {
    if (!isElectron() || !processPath) return

    // Load memory.json
    setMemoryLoading(true)
    try {
      const memoryData = await window.electronAPI.readProcessFile(processPath, 'memory.json')
      setMemory(memoryData as ProcessMemory | null)
    } catch (error) {
      console.error('Error loading memory:', error)
      setMemory(null)
    } finally {
      setMemoryLoading(false)
    }

    // Load log.json
    setLogLoading(true)
    try {
      const logData = await window.electronAPI.readProcessFile(processPath, 'log.json')
      setLog(logData as ProcessLog | null)
    } catch (error) {
      console.error('Error loading log:', error)
      setLog(null)
    } finally {
      setLogLoading(false)
    }

    // Load qa-session.json
    try {
      const qaSessionData = await readQASession(processPath)
      setQASession(qaSessionData)
    } catch (error) {
      console.error('Error loading Q&A session:', error)
      setQASession(null)
    }
  }, [processPath])

  // Load files when process changes
  useEffect(() => {
    loadProcessFiles()
  }, [loadProcessFiles])

  // Subscribe to real-time memory updates
  useEffect(() => {
    if (!isElectron() || !processPath) return

    const unsubscribe = window.electronAPI.onMemoryUpdate(({ event, processPath: updatedPath, memory: memoryData }) => {
      // Only update if this is for the current process
      if (updatedPath === processPath) {
        if (event === 'removed') {
          setMemory(null)
        } else {
          setMemory(memoryData as ProcessMemory | null)
        }
      }
    })

    return unsubscribe
  }, [processPath])

  // Subscribe to real-time log updates
  useEffect(() => {
    if (!isElectron() || !processPath) return

    const unsubscribe = window.electronAPI.onLogUpdate(({ event, processPath: updatedPath, log: logData }) => {
      // Only update if this is for the current process
      if (updatedPath === processPath) {
        if (event === 'removed') {
          setLog(null)
        } else {
          setLog(logData as ProcessLog | null)
        }
      }
    })

    return unsubscribe
  }, [processPath])

  // Subscribe to real-time Q&A session updates
  useEffect(() => {
    if (!isElectron() || !processPath) return

    const unsubscribe = window.electronAPI.onQASessionUpdate(({ event, processPath: updatedPath, qaSession: qaSessionData }) => {
      // Only update if this is for the current process
      if (updatedPath === processPath) {
        if (event === 'removed') {
          setQASession(null)
        } else {
          setQASession(qaSessionData as QASessionFile | null)
        }
      }
    })

    return unsubscribe
  }, [processPath])

  // Handle Q&A session updates from child components
  const handleQASessionUpdate = useCallback(async () => {
    try {
      const qaSessionData = await readQASession(processPath)
      setQASession(qaSessionData)
    } catch (error) {
      console.error('Error refreshing Q&A session:', error)
    }
  }, [processPath])

  // Resolve processPath — paths are now absolute, so just ensure process.json suffix
  const resolveProcessPath = useCallback((processPathValue: string): string => {
    const normalized = processPathValue.replace(/^\.\//, '').replace(/\//g, '\\')
    // If it's already absolute (starts with drive letter or /), use as-is
    if (/^[A-Za-z]:/.test(normalized) || normalized.startsWith('\\')) {
      return normalized.endsWith('\\process.json') ? normalized : `${normalized}\\process.json`
    }
    // Legacy relative path — resolve against projectPaths[0] or projectPath
    const basePath = process.metadata.projectPaths?.[0] || process.metadata.projectPath || ''
    return `${basePath.replace(/\//g, '\\')}\\${normalized}\\process.json`
  }, [process.metadata.projectPaths, process.metadata.projectPath])

  // Determine which node to focus based on where we navigated from
  const focusNodeId = useMemo(() => {
    if (!navigatedFromPath) return null

    // Normalize paths for comparison
    const normalizeForCompare = (p: string) => p.replace(/\\/g, '/').toLowerCase()
    const normalizedFrom = normalizeForCompare(navigatedFromPath)

    // Check if we came from the parent process
    if (process.subProcessState?.parentProcess) {
      const parentAbsolutePath = resolveProcessPath(process.subProcessState.parentProcess.processPath)
      if (normalizeForCompare(parentAbsolutePath) === normalizedFrom) {
        return 'parent-process'
      }
    }

    // Check if we came from a child subprocess
    if (process.subProcessState?.childProcesses) {
      for (const child of process.subProcessState.childProcesses) {
        const childAbsolutePath = resolveProcessPath(child.processPath)
        if (normalizeForCompare(childAbsolutePath) === normalizedFrom) {
          return `subprocess-${child.id}`
        }
      }
    }

    return null
  }, [navigatedFromPath, process.subProcessState, resolveProcessPath])

  // Handle sub-process click - navigate to the sub-process
  const handleSubProcessClick = useCallback((subProcess: ChildProcessRef) => {
    const absolutePath = resolveProcessPath(subProcess.processPath)
    const targetProcess = getProcess(absolutePath)
    if (targetProcess) {
      onNavigateToProcess(absolutePath)
    } else {
      setAlertMessage(`"${subProcess.name}" process.json no longer exists`)
    }
  }, [getProcess, onNavigateToProcess, resolveProcessPath])

  // Handle parent process click - navigate to the parent process
  const handleParentClick = useCallback((parent: ParentProcessRef) => {
    const absolutePath = resolveProcessPath(parent.processPath)
    const targetProcess = getProcess(absolutePath)
    if (targetProcess) {
      onNavigateToProcess(absolutePath)
    } else {
      setAlertMessage(`"${parent.name}" process.json no longer exists`)
    }
  }, [getProcess, onNavigateToProcess, resolveProcessPath])

  // Get subprocess data for lazy prompts
  const getSubProcess = useCallback((relativePath: string) => {
    const absolutePath = resolveProcessPath(relativePath)
    const subProcess = getProcess(absolutePath)
    if (subProcess) {
      return { process: subProcess, absolutePath }
    }
    return undefined
  }, [getProcess, resolveProcessPath])

  // Agent panel resize handlers
  const handleAgentResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizingAgent(true)
  }, [])

  const handleAgentResizeMove = useCallback((e: MouseEvent) => {
    if (!mainContentRef.current) return
    
    const containerRect = mainContentRef.current.getBoundingClientRect()
    const newHeight = containerRect.bottom - e.clientY
    const clampedHeight = Math.min(Math.max(newHeight, AGENT_PANEL_MIN_HEIGHT), AGENT_PANEL_MAX_HEIGHT)
    setAgentPanelHeight(clampedHeight)
  }, [])

  const handleAgentResizeEnd = useCallback(() => {
    setIsResizingAgent(false)
  }, [])

  // Agent panel resize - global mouse listeners
  useEffect(() => {
    if (isResizingAgent) {
      document.addEventListener('mousemove', handleAgentResizeMove)
      document.addEventListener('mouseup', handleAgentResizeEnd)
      document.body.style.cursor = 'ns-resize'
      document.body.style.userSelect = 'none'
    }
    return () => {
      document.removeEventListener('mousemove', handleAgentResizeMove)
      document.removeEventListener('mouseup', handleAgentResizeEnd)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizingAgent, handleAgentResizeMove, handleAgentResizeEnd])

  // Global Ctrl+Shift+P keyboard shortcut to open Lazy Prompts modal
  useEffect(() => {
    if (!settings.lazyPrompts.enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setShowLazyPromptModal(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [settings.lazyPrompts.enabled])

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-md hover:bg-surface transition-colors"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-mono font-semibold text-text-primary truncate">
              {process.name}
            </h1>
            <p className="text-xs text-text-muted">
              {process.metadata.template} • Created {formatTimestamp(process.metadata.created)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LazyPromptButton
              process={process}
              processPath={processPath!}
              projectPath={projectPath}
              variant="default"
            />
            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-status-failed/30 bg-status-failed/10 text-status-failed hover:bg-status-failed/20 transition-all"
              title="Delete this process"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Delete</span>
            </button>
            {/* Agent Panel Toggle */}
            <button
              onClick={() => setShowAgentPanel(!showAgentPanel)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all
                ${showAgentPanel 
                  ? 'bg-accent text-white' 
                  : hasActiveSession
                    ? 'bg-status-active/20 text-status-active border border-status-active/30 hover:bg-status-active/30'
                    : 'bg-surface border border-border text-text-secondary hover:border-accent hover:text-accent'
                }
              `}
              title={showAgentPanel ? 'Hide agent panel' : 'Show agent panel'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Agent</span>
              {hasActiveSession && !showAgentPanel && (
                <span className="w-2 h-2 rounded-full bg-status-active animate-pulse" />
              )}
            </button>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(process.status)} bg-current/10`}>
              {process.status}
            </span>
          </div>
        </div>

        {/* Progress and current state */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-text-secondary mb-1">
              <span>Progress: {completedSteps}/{process.steps.length} steps</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  process.status === 'completed' ? 'bg-status-completed' :
                  process.status === 'failed' ? 'bg-status-failed' :
                  'bg-status-active'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current action */}
        <div className="mt-3 p-3 rounded-lg bg-surface border border-border">
          <div className="text-xs text-text-muted mb-1">Current Action</div>
          <div className="text-sm text-text-primary">
            {(process.currentState as any).actionSummary || (process.currentState as any).currentAction || 'Unknown action'}
          </div>
          {((process.currentState as any).actionDetails || (process.currentState as any).details) && (
            <div className="text-xs text-text-secondary mt-1">
              {(process.currentState as any).actionDetails || (process.currentState as any).details}
            </div>
          )}
        </div>
      </div>

      {/* Main content area with diagram, panels, and optional agent */}
      <div ref={mainContentRef} className="flex-1 flex flex-col overflow-hidden">
        {/* Top area: Diagram and right panel */}
        <div className={`flex overflow-hidden ${showAgentPanel ? 'flex-1' : 'flex-1'}`} style={{ minHeight: showAgentPanel ? '50%' : undefined }}>
          {/* Left side: Diagram with step details */}
          <div className="flex-1 flex overflow-hidden min-h-0 relative">
            {/* Diagram */}
            <div className="flex-1">
              <ProcessDiagram 
                process={process} 
                onStepClick={setSelectedStep}
                onSubProcessClick={handleSubProcessClick}
                onParentClick={handleParentClick}
                focusNodeId={focusNodeId}
                getSubProcess={getSubProcess}
              />
            </div>

            {/* Step details sidebar (overlays on diagram area) */}
            {selectedStep && (
              <div className="absolute right-0 top-0 bottom-0 w-80 border-l border-border bg-surface overflow-y-auto shadow-lg z-10">
                <StepDetails 
                  step={selectedStep} 
                  onClose={() => setSelectedStep(null)}
                />
              </div>
            )}
          </div>

          {/* Right Panel with Memory, Logs, Files, and Q&A Session */}
          <RightPanel
            memory={memory}
            log={log}
            qaSession={qaSession}
            memoryLoading={memoryLoading}
            logLoading={logLoading}
            processPath={processPath}
            onQASessionUpdate={handleQASessionUpdate}
          />
        </div>

        {/* Agent Session Panel (bottom) */}
        {showAgentPanel && (
          <div 
            className="flex flex-col border-t border-border" 
            style={{ height: agentPanelHeight, minHeight: AGENT_PANEL_MIN_HEIGHT }}
          >
            {/* Resize handle */}
            <div 
              className="h-1 cursor-ns-resize hover:bg-accent/50 transition-colors flex-shrink-0"
              onMouseDown={handleAgentResizeStart}
            />
            <AgentSessionPanel
              process={process}
              processPath={processPath}
              projectPath={projectPath}
              onClose={() => setShowAgentPanel(false)}
              externalSession={externalSession}
              onMigrateSession={onMigrateSession}
            />
          </div>
        )}
      </div>

      {/* Alert for process not found */}
      {alertMessage && (
        <Alert 
          message={alertMessage} 
          onClose={() => setAlertMessage(null)} 
        />
      )}

      {/* Lazy Prompts Modal (opened via Shift+P) */}
      {showLazyPromptModal && (
        <LazyPromptModal
          process={process}
          processPath={processPath!}
          projectPath={projectPath}
          onClose={() => setShowLazyPromptModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Process"
        message={
          process.status === 'running'
            ? `This process is currently running. Deleting "${process.name}" will permanently remove all data and cannot be undone.`
            : `Are you sure you want to delete "${process.name}"? This will permanently remove all process data and cannot be undone.`
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}

function StepDetails({ step, onClose }: { step: ProcessStep; onClose: () => void }) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-sm font-semibold text-text-primary">
          Step {step.number}
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-surface-elevated transition-colors"
        >
          <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-text-muted uppercase tracking-wider">Name</label>
          <p className="text-sm text-text-primary mt-1">{step.name}</p>
        </div>

        <div>
          <label className="text-xs text-text-muted uppercase tracking-wider">Status</label>
          <p className={`text-sm mt-1 ${getStatusColor(step.status)}`}>
            {step.status.replace('_', ' ')}
          </p>
        </div>

        {step.stepRef && (
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider">Step Reference</label>
            <p className="text-xs font-mono text-text-secondary mt-1 break-all">{step.stepRef}</p>
          </div>
        )}

        {step.approvalRequired && (
          <div className="flex items-center gap-2 p-2 rounded bg-status-paused/10 border border-status-paused/30">
            <svg className="w-4 h-4 text-status-paused" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs text-status-paused">
              {step.approved ? 'Approved' : 'Requires Approval'}
            </span>
          </div>
        )}

        {step.startedAt && (
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider">Started</label>
            <p className="text-sm text-text-secondary mt-1">{formatTimestamp(step.startedAt)}</p>
          </div>
        )}

        {step.completedAt && (
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider">Completed</label>
            <p className="text-sm text-text-secondary mt-1">{formatTimestamp(step.completedAt)}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}
