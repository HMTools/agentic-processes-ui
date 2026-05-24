import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { OverviewWindowApp } from './components/OverviewWindow'
import { useSettingsState, SettingsContext } from './hooks/useSettings'
import { ToastProvider } from './components/Toast'

function Root() {
  const settingsState = useSettingsState()

  return (
    <SettingsContext.Provider value={settingsState}>
      <ToastProvider>
        <OverviewWindowApp />
      </ToastProvider>
    </SettingsContext.Provider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
