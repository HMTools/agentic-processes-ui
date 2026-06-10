import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useProcesses } from './hooks/useProcesses'
import { useSettingsState, SettingsContext } from './hooks/useSettings'
import { useTemplates } from './hooks/useTemplates'
import { useAgentSessions } from './hooks/useAgentSessions'
import { usePendingInteractions } from './hooks/usePendingInteractions'
import { Dashboard } from './components/Dashboard'
import { DiagramView } from './components/DiagramView'
import { Settings } from './components/Settings'
import { Templates } from './components/Templates'
import { AgentSessions } from './components/AgentSessions'
import { ProcessesOverview } from './components/ProcessesOverview'
import { NewProcessModal } from './components/NewProcessModal'
import { Sidebar } from './components/Layout/Sidebar'
import { ToastProvider } from './components/Toast'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ErrorDisplay } from './components/ErrorDisplay'
import type { ProcessTemplate } from './types'

type AppView = 'dashboard' | 'settings' | 'templates' | 'agent-sessions' | 'processes-overview'

function App() {
  const settingsState = useSettingsState()

  // Multi-workspace state from useProcesses
  const {
    frameworkPath,
    projectPaths,
    isWatching,
    processes,
    activeProcesses,
    completedProcesses,
    failedProcesses,
    selectFolder,
    addFolder,
    removeProject,
    setFrameworkPath,
    getProcess,
    error,
    processErrors,
    retryWatching
  } = useProcesses({
    initialWorkspace: settingsState.settings.workspace,
    onWorkspaceChange: settingsState.updateWorkspaceSettings
  })

  // Lift templates to App level so Dashboard and Templates page can both access them
  // Templates now load from framework + all project folders
  const { processTemplates } = useTemplates(frameworkPath, projectPaths)

  // Track running agent sessions for the sidebar badge + external session discovery
  const {
    sessions: allAgentSessions,
    externalSessions,
    discoverExternal,
    migrateSession
  } = useAgentSessions()
  const runningSessionCount = allAgentSessions.filter(
    s => s.status === 'running' || s.status === 'starting'
  ).length

  // Track which processes have pending interactions (waiting for user input)
  const activeProcessPathsMemo = useMemo(() => activeProcesses.map(p => p.path), [activeProcesses])
  const { hasPendingInteraction } = usePendingInteractions(activeProcessPathsMemo)

  // Periodically discover external Claude Code sessions
  // Use refs to avoid re-triggering the interval on every render
  const activeProcessesRef = useRef(activeProcesses)
  const getProcessRef = useRef(getProcess)
  const discoverExternalRef = useRef(discoverExternal)
  activeProcessesRef.current = activeProcesses
  getProcessRef.current = getProcess
  discoverExternalRef.current = discoverExternal

  const hasActiveProcesses = activeProcesses.length > 0

  useEffect(() => {
    if (!hasActiveProcesses) return

    const doDiscover = () => {
      const procs = activeProcessesRef.current
      const getProc = getProcessRef.current
      const discover = discoverExternalRef.current

      // Pass all active processes — the main process reads .session files
      // from disk to get the real Claude Code session IDs
      const activeProcessInfos = procs.map(p => {
        const full = getProc(p.path)
        return {
          path: p.path,
          projectPaths: full?.metadata?.projectPaths || (full?.metadata?.projectPath ? [full.metadata.projectPath] : undefined)
        }
      })
      if (activeProcessInfos.length > 0) {
        discover(activeProcessInfos)
      }
    }

    doDiscover()
    const interval = setInterval(doDiscover, 15000)
    return () => clearInterval(interval)
  }, [hasActiveProcesses])

  // Handle session migration from Dashboard
  const handleMigrateSession = useCallback((processPath: string) => {
    const full = getProcess(processPath)
    const workDir = full?.metadata?.projectPaths?.[0] || full?.metadata?.projectPath || projectPaths[0] || ''
    migrateSession(processPath, workDir, { permissionMode: settingsState.settings.agent.permissionMode })
  }, [getProcess, projectPaths, migrateSession, settingsState.settings.agent.permissionMode])

  const [currentView, setCurrentView] = useState<AppView>('dashboard')
  const [selectedProcessPath, setSelectedProcessPath] = useState<string | null>(null)
  const [navigatedFromPath, setNavigatedFromPath] = useState<string | null>(null)
  const [overviewInitialPaths, setOverviewInitialPaths] = useState<string[] | null>(null)
  const [initialSelectedTemplate, setInitialSelectedTemplate] = useState<ProcessTemplate | null>(null)
  const selectedProcess = selectedProcessPath ? getProcess(selectedProcessPath) : null

  // New Process Modal state
  const [showNewProcessModal, setShowNewProcessModal] = useState(false)
  const [preSelectedTemplate, setPreSelectedTemplate] = useState<ProcessTemplate | null>(null)

  // Handle navigation between processes, tracking the source
  const handleNavigateToProcess = useCallback((targetPath: string) => {
    setCurrentView('dashboard')
    setNavigatedFromPath(selectedProcessPath) // Remember where we came from
    setSelectedProcessPath(targetPath)
  }, [selectedProcessPath])

  // Handle back to dashboard (clear navigation source)
  const handleBackToDashboard = useCallback(() => {
    setSelectedProcessPath(null)
    setNavigatedFromPath(null)
  }, [])

  // Navigation handlers
  const handleNavigateToSettings = useCallback(() => {
    setCurrentView('settings')
    setSelectedProcessPath(null)
    setNavigatedFromPath(null)
  }, [])

  const handleNavigateToDashboard = useCallback(() => {
    setCurrentView('dashboard')
  }, [])

  const handleNavigateToTemplates = useCallback(() => {
    setCurrentView('templates')
    setSelectedProcessPath(null)
    setNavigatedFromPath(null)
  }, [])

  const handleNavigateToTemplate = useCallback((templateName: string, templateCategory: string) => {
    const matched = processTemplates.find(t => t.name === templateName && t.category === templateCategory)
    if (matched) {
      setInitialSelectedTemplate(matched)
      setCurrentView('templates')
      setSelectedProcessPath(null)
      setNavigatedFromPath(null)
    }
  }, [processTemplates])

  const handleNavigateToAgentSessions = useCallback(() => {
    setCurrentView('agent-sessions')
    setSelectedProcessPath(null)
    setNavigatedFromPath(null)
  }, [])

  const handleNavigateToProcessesOverview = useCallback(() => {
    setCurrentView('processes-overview')
    setSelectedProcessPath(null)
    setNavigatedFromPath(null)
  }, [])

  const handleOpenInOverview = useCallback((paths: string[]) => {
    setCurrentView('processes-overview')
    setOverviewInitialPaths(paths)
    setSelectedProcessPath(null)
    setNavigatedFromPath(null)
  }, [])

  const handlePopOutOverview = useCallback(() => {
    window.electronAPI.openOverviewWindow(projectPaths)
  }, [projectPaths])

  // New Process Modal handlers
  const handleOpenNewProcess = useCallback(() => {
    setPreSelectedTemplate(null)
    setShowNewProcessModal(true)
  }, [])

  const handleUseTemplate = useCallback((template: ProcessTemplate) => {
    setPreSelectedTemplate(template)
    setShowNewProcessModal(true)
  }, [])

  const handleCloseNewProcessModal = useCallback(() => {
    setShowNewProcessModal(false)
    setPreSelectedTemplate(null)
  }, [])

  // Listen for navigation requests from external overview windows
  useEffect(() => {
    const unsub = window.electronAPI.onNavigateToProcessRequest((processPath: string) => {
      setCurrentView('dashboard')
      setSelectedProcessPath(processPath)
      setNavigatedFromPath(null)
    })
    return unsub
  }, [])

  // Global Ctrl+Shift+N keyboard shortcut to open New Process modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        e.preventDefault()
        handleOpenNewProcess()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleOpenNewProcess])

  return (
    <ToastProvider>
      <SettingsContext.Provider value={settingsState}>
        <div className="h-screen flex bg-background text-text-primary">
        {/* Sidebar */}
        <Sidebar
          frameworkPath={frameworkPath}
          projectPaths={projectPaths}
          isWatching={isWatching}
          onAddFolder={addFolder}
          onSelectFolder={selectFolder}
          processCount={processes.length}
          activeCount={activeProcesses.length}
          runningSessionCount={runningSessionCount}
          currentView={currentView}
          onNavigateToSettings={handleNavigateToSettings}
          onNavigateToDashboard={handleNavigateToDashboard}
          onNavigateToTemplates={handleNavigateToTemplates}
          onNavigateToAgentSessions={handleNavigateToAgentSessions}
          onNavigateToProcessesOverview={handleNavigateToProcessesOverview}
          attentionCount={activeProcesses.filter(p => {
            if (hasPendingInteraction(p.path)) return true
            const full = getProcess(p.path)
            if (!full) return false
            return full.status === 'failed' || full.status === 'paused' ||
              full.steps.some(s => s.status === 'awaiting_approval') ||
              full.steps.some(s => s.status === 'in_progress' && s.approvalRequired)
          }).length}
        />

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          <ErrorBoundary>
            {currentView === 'settings' ? (
              <Settings 
                onBack={handleNavigateToDashboard}
                frameworkPath={frameworkPath}
                projectPaths={projectPaths}
                onSelectFolder={selectFolder}
                onRemoveProject={removeProject}
                onChangeFramework={selectFolder}
              />
            ) : currentView === 'templates' ? (
              <Templates
                frameworkPath={frameworkPath}
                projectPaths={projectPaths}
                onBack={handleNavigateToDashboard}
                onUseTemplate={handleUseTemplate}
                initialSelectedTemplate={initialSelectedTemplate}
                onInitialTemplateConsumed={() => setInitialSelectedTemplate(null)}
              />
            ) : currentView === 'processes-overview' ? (
              <ProcessesOverview
                processes={processes}
                getProcess={getProcess}
                onNavigateToProcess={handleNavigateToProcess}
                onNewProcess={handleOpenNewProcess}
                onPopOut={handlePopOutOverview}
                initialPaths={overviewInitialPaths}
                onInitialPathsConsumed={() => setOverviewInitialPaths(null)}
                hasPendingInteraction={hasPendingInteraction}
              />
            ) : currentView === 'agent-sessions' ? (
              <AgentSessions
                onBack={handleNavigateToDashboard}
                onNavigateToProcess={handleNavigateToProcess}
                getProcess={getProcess}
              />
            ) : error ? (
              <ErrorDisplay
                error={error}
                projectPaths={projectPaths}
                onRetry={retryWatching}
                onAddFolder={addFolder}
                onSelectFolder={selectFolder}
              />
            ) : selectedProcess ? (
              <DiagramView
                process={selectedProcess}
                processPath={selectedProcessPath}
                onBack={handleBackToDashboard}
                onNavigateToProcess={handleNavigateToProcess}
                onOpenInOverview={handleOpenInOverview}
                getProcess={getProcess}
                navigatedFromPath={navigatedFromPath}
                externalSession={selectedProcessPath ? externalSessions[selectedProcessPath] || null : null}
                onMigrateSession={selectedProcessPath && externalSessions[selectedProcessPath]
                  ? async () => { await migrateSession(selectedProcessPath, selectedProcess.metadata.projectPaths?.[0] || selectedProcess.metadata.projectPath || projectPaths[0] || '', { permissionMode: settingsState.settings.agent.permissionMode }) }
                  : undefined
                }
                onNavigateToTemplate={handleNavigateToTemplate}
                hasPendingInteraction={selectedProcessPath ? hasPendingInteraction(selectedProcessPath) : false}
              />
            ) : (
              <Dashboard
                processes={processes}
                activeProcesses={activeProcesses}
                completedProcesses={completedProcesses}
                failedProcesses={failedProcesses}
                selectedProcess={selectedProcessPath}
                onSelectProcess={setSelectedProcessPath}
                getProcess={getProcess}
                processErrors={processErrors}
                onNewProcess={handleOpenNewProcess}
                externalSessions={externalSessions}
                onMigrateSession={handleMigrateSession}
              />
            )}
          </ErrorBoundary>
        </div>

        {/* New Process Modal */}
        <NewProcessModal
          isOpen={showNewProcessModal}
          onClose={handleCloseNewProcessModal}
          templates={processTemplates}
          projectPaths={projectPaths}
          agentSettings={settingsState.settings.agent}
          preSelectedTemplate={preSelectedTemplate}
          onSelectFolder={selectFolder}
          onAddFolder={addFolder}
        />
        </div>
      </SettingsContext.Provider>
    </ToastProvider>
  )
}

export default App
