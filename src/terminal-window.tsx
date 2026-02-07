import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { TerminalWindowApp } from './components/TerminalWindow'
import { useSettingsState, SettingsContext } from './hooks/useSettings'

function Root() {
  const settingsState = useSettingsState()

  return (
    <SettingsContext.Provider value={settingsState}>
      <TerminalWindowApp />
    </SettingsContext.Provider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
