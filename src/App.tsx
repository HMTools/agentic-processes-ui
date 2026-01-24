import { useState, useCallback } from 'react'
import { useProcesses } from './hooks/useProcesses'
import { useSettingsState, SettingsContext } from './hooks/useSettings'
import { Dashboard } from './components/Dashboard'
import { DiagramView } from './components/DiagramView'
import { Settings } from './components/Settings'
import { Sidebar } from './components/Layout/Sidebar'
import { WelcomeScreen } from './components/Layout/WelcomeScreen'
import { ToastProvider } from './components/Toast'
import { ErrorBoundary } from './components/ErrorBoundary'

type AppView = 'dashboard' | 'settings'

function App() {
  const {
    projectPath,
    isWatching,
    processes,
    activeProcesses,
    completedProcesses,
    failedProcesses,
    selectProject,
    getProcess
  } = useProcesses()

  const settingsState = useSettingsState()

  const [currentView, setCurrentView] = useState<AppView>('dashboard')
  const [selectedProcessPath, setSelectedProcessPath] = useState<string | null>(null)
  const [navigatedFromPath, setNavigatedFromPath] = useState<string | null>(null)
  const selectedProcess = selectedProcessPath ? getProcess(selectedProcessPath) : null

  // Handle navigation between processes, tracking the source
  const handleNavigateToProcess = useCallback((targetPath: string) => {
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
          currentView={currentView}
          onNavigateToSettings={handleNavigateToSettings}
          onNavigateToDashboard={handleNavigateToDashboard}
        />

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          <ErrorBoundary>
            {currentView === 'settings' ? (
              <Settings onBack={handleNavigateToDashboard} />
            ) : !projectPath ? (
              <WelcomeScreen onSelectProject={selectProject} />
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
              />
            )}
          </ErrorBoundary>
        </div>
        </div>
      </SettingsContext.Provider>
    </ToastProvider>
  )
}

export default App
