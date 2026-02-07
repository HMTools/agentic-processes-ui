import { useState, useCallback } from 'react'
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
  const {
    projectPath,
    isWatching,
    processes,
    activeProcesses,
    completedProcesses,
    failedProcesses,
    selectProject,
    getProcess,
    error,
    processErrors,
    retryWatching
  } = useProcesses()

  const settingsState = useSettingsState()

  // Lift templates to App level so Dashboard and Templates page can both access them
  const { processTemplates } = useTemplates(projectPath)

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

  return (
    <ToastProvider>
      <SettingsContext.Provider value={settingsState}>
        <div className="h-screen flex bg-background text-text-primary">
        {/* Sidebar */}
        <Sidebar
          projectPath={projectPath}
          isWatching={isWatching}
          onSelectProject={selectProject}
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
              <Settings onBack={handleNavigateToDashboard} />
            ) : currentView === 'templates' ? (
              <Templates
                projectPath={projectPath}
                onBack={handleNavigateToDashboard}
                onUseTemplate={handleUseTemplate}
              />
            ) : currentView === 'agent-sessions' ? (
              <AgentSessions
                onBack={handleNavigateToDashboard}
                onNavigateToProcess={handleNavigateToProcess}
              />
            ) : !projectPath ? (
              <WelcomeScreen onSelectProject={selectProject} />
            ) : error ? (
              <ErrorDisplay
                error={error}
                projectPath={projectPath}
                onRetry={retryWatching}
                onSelectDifferent={selectProject}
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
                onNewProcess={projectPath ? handleOpenNewProcess : undefined}
              />
            )}
          </ErrorBoundary>
        </div>

        {/* New Process Modal */}
        {projectPath && (
          <NewProcessModal
            isOpen={showNewProcessModal}
            onClose={handleCloseNewProcessModal}
            templates={processTemplates}
            projectPath={projectPath}
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
