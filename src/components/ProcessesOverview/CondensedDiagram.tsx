import { useState, useEffect, useCallback } from 'react'
import type { ProcessInstance, ProcessMemory, ProcessLog, ProcessStep, ChildProcessRef, ParentProcessRef } from '../../types'
import { ProcessDiagram } from '../DiagramView/ProcessDiagram'
import { MemoryView } from '../DiagramView/MemoryView'
import { LogsView } from '../DiagramView/LogsView'
import { FilesView } from '../DiagramView/FilesView'
import { getStatusColor } from '../../services/processService'

type InfoTab = 'memory' | 'logs' | 'files'

interface CondensedDiagramProps {
  process: ProcessInstance
  processPath: string
  getProcess: (path: string) => ProcessInstance | undefined
  onNavigateToProcess: (path: string) => void
}

const isElectron = () => typeof window !== 'undefined' && window.electronAPI !== undefined

export function CondensedDiagram({ process, processPath, getProcess, onNavigateToProcess }: CondensedDiagramProps) {
  const [activeTab, setActiveTab] = useState<InfoTab>('memory')
  const [memory, setMemory] = useState<ProcessMemory | null>(null)
  const [log, setLog] = useState<ProcessLog | null>(null)
  const [memoryLoading, setMemoryLoading] = useState(false)
  const [logLoading, setLogLoading] = useState(false)
  const [showInfoPanel, setShowInfoPanel] = useState(true)

  // Load memory and log files
  useEffect(() => {
    if (!isElectron() || !processPath) return

    const load = async () => {
      setMemoryLoading(true)
      try {
        const data = await window.electronAPI.readProcessFile(processPath, 'memory.json')
        setMemory(data as ProcessMemory | null)
      } catch { setMemory(null) }
      finally { setMemoryLoading(false) }

      setLogLoading(true)
      try {
        const data = await window.electronAPI.readProcessFile(processPath, 'log.json')
        setLog(data as ProcessLog | null)
      } catch { setLog(null) }
      finally { setLogLoading(false) }
    }
    load()
  }, [processPath])

  // Subscribe to real-time memory updates
  useEffect(() => {
    if (!isElectron() || !processPath) return
    const unsubscribe = window.electronAPI.onMemoryUpdate(({ event, processPath: updatedPath, memory: memoryData }) => {
      if (updatedPath === processPath) {
        setMemory(event === 'removed' ? null : memoryData as ProcessMemory | null)
      }
    })
    return unsubscribe
  }, [processPath])

  // Subscribe to real-time log updates
  useEffect(() => {
    if (!isElectron() || !processPath) return
    const unsubscribe = window.electronAPI.onLogUpdate(({ event, processPath: updatedPath, log: logData }) => {
      if (updatedPath === processPath) {
        setLog(event === 'removed' ? null : logData as ProcessLog | null)
      }
    })
    return unsubscribe
  }, [processPath])

  // Resolve processPath — paths are now absolute, so just ensure process.json suffix
  const resolveProcessPath = useCallback((processPathValue: string): string => {
    const normalized = processPathValue.replace(/^\.\//, '').replace(/\//g, '\\')
    if (/^[A-Za-z]:/.test(normalized) || normalized.startsWith('\\')) {
      return normalized.endsWith('\\process.json') ? normalized : `${normalized}\\process.json`
    }
    // Legacy relative path fallback
    const basePath = process.metadata.projectPaths?.[0] || process.metadata.projectPath || ''
    return `${basePath.replace(/\//g, '\\')}\\${normalized}\\process.json`
  }, [process.metadata.projectPaths, process.metadata.projectPath])

  const handleSubProcessClick = useCallback((subProcess: ChildProcessRef) => {
    const absolutePath = resolveProcessPath(subProcess.processPath)
    onNavigateToProcess(absolutePath)
  }, [resolveProcessPath, onNavigateToProcess])

  const handleParentClick = useCallback((parent: ParentProcessRef) => {
    const absolutePath = resolveProcessPath(parent.processPath)
    onNavigateToProcess(absolutePath)
  }, [resolveProcessPath, onNavigateToProcess])

  const getSubProcess = useCallback((relativePath: string) => {
    const absolutePath = resolveProcessPath(relativePath)
    const subProcess = getProcess(absolutePath)
    if (subProcess) {
      return { process: subProcess, absolutePath }
    }
    return undefined
  }, [getProcess, resolveProcessPath])

  const completedSteps = process.steps.filter(s => s.status === 'completed').length

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Step progress bar */}
      <div className="flex-shrink-0 px-3 py-2 bg-surface border-b border-border">
        <div className="flex items-center gap-1.5">
          {process.steps.map((step) => {
            const currentState = process.currentState as any
            const isActive = currentState.activeStepId
              ? step.id === currentState.activeStepId
              : step.number === currentState.activeStepNumber

            return (
              <div
                key={step.id}
                className="flex-1 flex flex-col items-center gap-0.5"
                title={`Step ${step.number}: ${step.name} (${step.status})`}
              >
                <div className={`
                  w-full h-1.5 rounded-full transition-colors
                  ${step.status === 'completed' ? 'bg-status-completed' :
                    step.status === 'in_progress' || isActive ? 'bg-status-active' :
                    step.status === 'failed' ? 'bg-status-failed' :
                    step.status === 'awaiting_approval' ? 'bg-status-paused' :
                    step.status === 'skipped' ? 'bg-status-pending/50' :
                    'bg-border'
                  }
                  ${isActive ? 'animate-pulse' : ''}
                `} />
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-text-muted">
            {completedSteps}/{process.steps.length} steps
          </span>
          <span className="text-[10px] text-text-muted truncate ml-2">
            {(process.currentState as any).actionSummary || (process.currentState as any).currentAction || ''}
          </span>
        </div>
      </div>

      {/* Main content: Diagram + Info Panel */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Diagram */}
        <div className="flex-1 min-h-0">
          <ProcessDiagram
            process={process}
            onSubProcessClick={handleSubProcessClick}
            onParentClick={handleParentClick}
            getSubProcess={getSubProcess}
          />
        </div>

        {/* Info Panel (collapsible) */}
        {showInfoPanel && (
          <div className="w-64 flex flex-col border-l border-border bg-background overflow-hidden">
            {/* Info tabs */}
            <div className="flex-shrink-0 flex items-center gap-1 px-2 h-8 bg-surface border-b border-border">
              {(['memory', 'logs', 'files'] as InfoTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-2 py-0.5 text-[10px] font-medium rounded transition-colors
                    ${activeTab === tab
                      ? 'bg-surface-elevated text-text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                    }
                  `}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
              <div className="flex-1" />
              <button
                onClick={() => setShowInfoPanel(false)}
                className="p-0.5 rounded hover:bg-surface-elevated text-text-muted"
                title="Hide panel"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'memory' && (
                <MemoryView memory={memory} loading={memoryLoading} processPath={processPath} />
              )}
              {activeTab === 'logs' && (
                <LogsView log={log} loading={logLoading} />
              )}
              {activeTab === 'files' && (
                <FilesView processPath={processPath} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toggle info panel (when collapsed) */}
      {!showInfoPanel && (
        <button
          onClick={() => setShowInfoPanel(true)}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded bg-surface border border-border text-text-muted hover:text-text-primary z-10"
          title="Show info panel"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
    </div>
  )
}
