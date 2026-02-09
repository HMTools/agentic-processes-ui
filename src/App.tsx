import { useState, useCallback, useEffect } from 'react'
import { useProcesses } from './hooks/useProcesses'
import { useSettingsState, SettingsContext } from './hooks/useSettings'
import { useTemplates } from './hooks/useTemplates'
import { useAgentSessions } from './hooks/useAgentSessions'
import { Dashboard } from './components/Dashboard'
import { DiagramView } from './components/DiagramView'
import { Settings } from './components/Settings'
import { Templates } from './components/Templates'
import { AgentSessions } from './components/AgentSessions'
import { NewProcessModal } from './components/NewProcessModal'
import { Sidebar } from './components/Layout/Sidebar'
import { WelcomeScreen } from './components/Layout/WelcomeScreen'
import { ToastProvider } from './components/Toast'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ErrorDisplay } from './components/ErrorDisplay'
import type { ProcessTemplate } from './types'

type AppView = 'dashboard' | 'settings' | 'templates' | 'agent-sessions'

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

  // Derived state: has at least one project folder configured
  // We require at least one project folder to show Dashboard (since that's where processes live)
  const hasProjectFolders = projectPaths.length > 0

  // Lift templates to App level so Dashboard and Templates page can both access them
  // Templates now load from framework + all project folders
  const { processTemplates } = useTemplates(frameworkPath, projectPaths)

  // Track running agent sessions for the sidebar badge
  const { sessions: allAgentSessions } = useAgentSessions()
  const runningSessionCount = allAgentSessions.filter(
    s => s.status === 'running' || s.status === 'starting'
  ).length

  const [currentView, setCurrentView] = useState<AppView>('dashboard')
  const [selectedProcessPath, setSelectedProcessPath] = useState<string | null>(null)
  const [navigatedFromPath, setNavigatedFromPath] = useState<string | null>(null)
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

  const handleNavigateToAgentSessions = useCallback(() => {
    setCurrentView('agent-sessions')
    setSelectedProcessPath(null)
    setNavigatedFromPath(null)
  }, [])

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

  // Global Ctrl+Shift+N keyboard shortcut to open New Process modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      // Only open modal if at least one project is loaded
      if (e.ctrlKey && e.shiftKey && e.key === 'N' && projectPaths.length > 0) {
        e.preventDefault()
        handleOpenNewProcess()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleOpenNewProcess, projectPaths.length])

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
              />
            ) : currentView === 'agent-sessions' ? (
              <AgentSessions
                onBack={handleNavigateToDashboard}
                onNavigateToProcess={handleNavigateToProcess}
                getProcess={getProcess}
              />
            ) : !hasProjectFolders ? (
              <WelcomeScreen 
                frameworkPath={frameworkPath}
                projectPaths={projectPaths}
                onAddFolder={addFolder}
                onSelectFolder={selectFolder}
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
                getProcess={getProcess}
                navigatedFromPath={navigatedFromPath}
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
                onNewProcess={projectPaths.length > 0 ? handleOpenNewProcess : undefined}
              />
            )}
          </ErrorBoundary>
        </div>

        {/* New Process Modal */}
        {projectPaths.length > 0 && (
          <NewProcessModal
            isOpen={showNewProcessModal}
            onClose={handleCloseNewProcessModal}
            templates={processTemplates}
            projectPaths={projectPaths}
            agentSettings={settingsState.settings.agent}
            preSelectedTemplate={preSelectedTemplate}
          />
        )}
        </div>
      </SettingsContext.Provider>
    </ToastProvider>
  )
}

export default App
