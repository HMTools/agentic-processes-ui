import { useState, useEffect, useCallback, useMemo } from 'react'
import type { ProcessInstance, ProcessStep, ProcessMemory, ProcessLog, ChildProcessRef, ParentProcessRef } from '../../types'
import { ProcessDiagram } from './ProcessDiagram'
import { RightPanel } from './RightPanel'
import { Alert } from '../Alert'
import { LazyPromptButton } from '../LazyPromptButton'
import { getStatusColor, formatTimestamp } from '../../services/processService'

interface DiagramViewProps {
  process: ProcessInstance
  processPath: string
  onBack: () => void
  onNavigateToProcess: (path: string) => void
  getProcess: (path: string) => ProcessInstance | undefined
  navigatedFromPath: string | null
}

// Check if we're running in Electron
const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined
}

export function DiagramView({ process, processPath, onBack, onNavigateToProcess, getProcess, navigatedFromPath }: DiagramViewProps) {
  const [selectedStep, setSelectedStep] = useState<ProcessStep | null>(null)
  const [memory, setMemory] = useState<ProcessMemory | null>(null)
  const [log, setLog] = useState<ProcessLog | null>(null)
  const [memoryLoading, setMemoryLoading] = useState(false)
  const [logLoading, setLogLoading] = useState(false)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const completedSteps = process.steps.filter(s => s.status === 'completed').length
  const progress = Math.round((completedSteps / process.steps.length) * 100)

  // Load memory and log files
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

  // Resolve relative processPath to absolute path matching the format used in processes map
  const resolveProcessPath = useCallback((relativePath: string): string => {
    // Get the project path from current process metadata
    const projectPath = process.metadata.projectPath
    // Normalize path separators and join with process.json
    const normalizedRelative = relativePath.replace(/^\.\//, '').replace(/\//g, '\\')
    return `${projectPath.replace(/\//g, '\\')}\\${normalizedRelative}\\process.json`
  }, [process.metadata.projectPath])

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
              variant="default"
            />
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
          <div className="text-sm text-text-primary">{process.currentState.currentAction}</div>
          {process.currentState.details && (
            <div className="text-xs text-text-secondary mt-1">{process.currentState.details}</div>
          )}
        </div>
      </div>

      {/* Main content area with diagram and right panel */}
      <div className="flex-1 flex overflow-hidden">
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

        {/* Right Panel with Memory and Logs */}
        <RightPanel
          memory={memory}
          log={log}
          memoryLoading={memoryLoading}
          logLoading={logLoading}
        />
      </div>

      {/* Alert for process not found */}
      {alertMessage && (
        <Alert 
          message={alertMessage} 
          onClose={() => setAlertMessage(null)} 
        />
      )}
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

        {step.output && (
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider">Expected Output</label>
            <p className="text-sm text-text-secondary mt-1">{step.output}</p>
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
