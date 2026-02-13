import { useState, useEffect } from 'react'
import { useSettings } from '../../hooks/useSettings'
import type { AgentType } from '../../types'

interface SettingsProps {
  onBack: () => void
  /** Path to the framework folder */
  frameworkPath?: string | null
  /** Paths to project folders */
  projectPaths?: string[]
  /** Callback to add a folder (opens folder picker) */
  onSelectFolder?: () => void
  /** Callback to remove a project folder */
  onRemoveProject?: (path: string) => Promise<void>
  /** Callback to change framework folder */
  onChangeFramework?: () => void
}

// Available agent types for the dropdown
const AGENT_TYPES: { value: AgentType; label: string; available: boolean }[] = [
  { value: 'cursor', label: 'Cursor Agent', available: true },
  { value: 'github-copilot', label: 'GitHub Copilot', available: false },
  { value: 'claude-code', label: 'Claude Code', available: true }
]

export function Settings({ 
  onBack, 
  frameworkPath, 
  projectPaths = [], 
  onSelectFolder,
  onRemoveProject,
  onChangeFramework 
}: SettingsProps) {
  const { settings, updateLazyPromptsSettings, updateAgentSettings, resetSettings } = useSettings()
  const [availableAgents, setAvailableAgents] = useState(AGENT_TYPES)
  
  // Load available agents from electron
  useEffect(() => {
    if (window.electronAPI?.agentGetAvailable) {
      window.electronAPI.agentGetAvailable().then(agents => {
        setAvailableAgents(agents.map(a => ({
          value: a.type as AgentType,
          label: a.displayName,
          available: a.available
        })))
      })
    }
  }, [])

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-md hover:bg-surface transition-colors"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">Settings</h1>
            <p className="text-xs text-text-muted">Configure application preferences</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Lazy Prompts Section */}
          <section className="bg-surface rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-surface-elevated">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">Lazy Prompts</h2>
                  <p className="text-xs text-text-muted">Quick access to contextual process prompts</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="lazy-prompts-enabled" className="text-sm font-medium text-text-primary">
                    Enable Lazy Prompts
                  </label>
                  <p className="text-xs text-text-muted mt-0.5">
                    Show quick prompt buttons on processes and diagrams
                  </p>
                </div>
                <Toggle
                  id="lazy-prompts-enabled"
                  checked={settings.lazyPrompts.enabled}
                  onChange={(checked) => updateLazyPromptsSettings({ enabled: checked })}
                />
              </div>

              {/* Default Action */}
              <div className={`transition-opacity ${settings.lazyPrompts.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <label className="text-sm font-medium text-text-primary block mb-2">
                  Default Action
                </label>
                <p className="text-xs text-text-muted mb-3">
                  What happens when you click a lazy prompt button
                </p>
                <div className="space-y-2">
                  <RadioOption
                    id="action-clipboard"
                    name="default-action"
                    value="clipboard"
                    checked={settings.lazyPrompts.defaultAction === 'clipboard'}
                    onChange={() => updateLazyPromptsSettings({ defaultAction: 'clipboard' })}
                    label="Copy to Clipboard"
                    description="Copy the generated prompt to your clipboard"
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    }
                  />
                  <RadioOption
                    id="action-agent"
                    name="default-action"
                    value="agent-apply"
                    checked={settings.lazyPrompts.defaultAction === 'agent-apply'}
                    onChange={() => updateLazyPromptsSettings({ defaultAction: 'agent-apply' })}
                    label="Send to Agent"
                    description="Send the prompt directly to an active agent session"
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Workspace Section */}
          {(onSelectFolder || onRemoveProject) && (
            <section className="bg-surface rounded-lg border border-border overflow-hidden">
              <div className="p-4 border-b border-border bg-surface-elevated">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/20">
                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-text-primary">Workspace</h2>
                    <p className="text-xs text-text-muted">Manage framework and project folders</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Framework Path */}
                <div>
                  <label className="text-sm font-medium text-text-primary block mb-1">
                    Framework Folder
                  </label>
                  <p className="text-xs text-text-muted mb-2">
                    Contains <code className="px-1 py-0.5 bg-background rounded text-accent font-mono text-[10px]">.processes/</code> with templates and step definitions
                  </p>
                  {frameworkPath ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg text-text-secondary font-mono truncate">
                        {frameworkPath}
                      </div>
                      {onChangeFramework && (
                        <button
                          onClick={onChangeFramework}
                          className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary bg-surface-elevated border border-border rounded-lg hover:border-accent/50 transition-colors"
                        >
                          Change
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg text-text-muted italic">
                        No framework folder configured
                      </div>
                      {onSelectFolder && (
                        <button
                          onClick={onSelectFolder}
                          className="px-3 py-2 text-sm bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Project Paths */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-text-primary">
                      Project Folders ({projectPaths.length})
                    </label>
                    {onSelectFolder && (
                      <button
                        onClick={onSelectFolder}
                        className="text-xs text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Project
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mb-2">
                    Contains <code className="px-1 py-0.5 bg-background rounded text-accent font-mono text-[10px]">.user-processes/</code> with your processes
                  </p>
                  {projectPaths.length > 0 ? (
                    <div className="space-y-2">
                      {projectPaths.map((path) => (
                        <div key={path} className="flex items-center gap-2">
                          <div className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg text-text-secondary font-mono truncate">
                            {path}
                          </div>
                          {onRemoveProject && (
                            <button
                              onClick={() => onRemoveProject(path)}
                              className="p-2 text-text-muted hover:text-status-failed transition-colors"
                              title="Remove project"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-4 text-sm bg-background border border-border rounded-lg text-center text-text-muted">
                      No project folders added yet
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Agent Settings Section */}
          <section className="bg-surface rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-surface-elevated">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">Agent Sessions</h2>
                  <p className="text-xs text-text-muted">Configure AI agent CLI integration</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Default Agent Type */}
              <div>
                <label htmlFor="default-agent-type" className="text-sm font-medium text-text-primary block mb-1">
                  Default Agent Type
                </label>
                <p className="text-xs text-text-muted mb-2">
                  The agent CLI to use when starting new sessions
                </p>
                <select
                  id="default-agent-type"
                  value={settings.agent.defaultAgentType}
                  onChange={(e) => updateAgentSettings({ defaultAgentType: e.target.value as AgentType })}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
                >
                  {availableAgents.map(agent => (
                    <option 
                      key={agent.value} 
                      value={agent.value}
                      disabled={!agent.available}
                    >
                      {agent.label} {!agent.available && '(Coming Soon)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto-attach Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="auto-attach" className="text-sm font-medium text-text-primary">
                    Auto-attach to Process
                  </label>
                  <p className="text-xs text-text-muted mt-0.5">
                    Automatically attach agent session when viewing a process
                  </p>
                </div>
                <Toggle
                  id="auto-attach"
                  checked={settings.agent.autoAttach}
                  onChange={(checked) => updateAgentSettings({ autoAttach: checked })}
                />
              </div>

              {/* Terminal Font Size */}
              <div>
                <label htmlFor="terminal-font-size" className="text-sm font-medium text-text-primary block mb-1">
                  Terminal Font Size
                </label>
                <p className="text-xs text-text-muted mb-2">
                  Font size for the embedded terminal ({settings.agent.terminalFontSize}px)
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    id="terminal-font-size"
                    min="10"
                    max="24"
                    step="1"
                    value={settings.agent.terminalFontSize}
                    onChange={(e) => updateAgentSettings({ terminalFontSize: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                  <span className="text-sm text-text-secondary w-12 text-right font-mono">
                    {settings.agent.terminalFontSize}px
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Available Prompts Info */}
          <section className="bg-surface rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-surface-elevated">
              <h2 className="text-sm font-semibold text-text-primary">Available Lazy Prompts</h2>
              <p className="text-xs text-text-muted mt-0.5">Prompts you can generate for your processes</p>
            </div>
            
            <div className="p-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border">
                <div className="p-1.5 rounded bg-status-active/20 flex-shrink-0">
                  <svg className="w-4 h-4 text-status-active" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-text-primary">Continue Process</h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Generates a <code className="px-1 py-0.5 rounded bg-surface-elevated text-accent font-mono text-[10px]">/process-continue</code> prompt 
                    with full context including current state, active step, and parameters.
                  </p>
                </div>
              </div>
              
              <p className="text-xs text-text-muted mt-3 italic">
                More prompts will be added in future updates.
              </p>
            </div>
          </section>

          {/* Reset Section */}
          <section className="flex justify-end">
            <button
              onClick={resetSettings}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
            >
              Reset to Defaults
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}

// Toggle component
function Toggle({ id, checked, onChange }: { id: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${checked ? 'bg-accent' : 'bg-border'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  )
}

// Radio option component
interface RadioOptionProps {
  id: string
  name: string
  value: string
  checked: boolean
  onChange: () => void
  label: string
  description: string
  icon: React.ReactNode
  disabled?: boolean
}

function RadioOption({ id, name, value, checked, onChange, label, description, icon, disabled }: RadioOptionProps) {
  return (
    <label
      htmlFor={id}
      className={`
        flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
        ${checked ? 'border-accent bg-accent/10' : 'border-border bg-background hover:border-border-muted'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      <div className={`p-1.5 rounded ${checked ? 'bg-accent/20 text-accent' : 'bg-surface-elevated text-text-muted'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${checked ? 'text-accent' : 'text-text-primary'}`}>
            {label}
          </span>
          {disabled && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-surface-elevated text-text-muted">
              Coming Soon
            </span>
          )}
        </div>
        <p className="text-xs text-text-muted mt-0.5">{description}</p>
      </div>
      <div className={`
        w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
        ${checked ? 'border-accent' : 'border-text-muted'}
      `}>
        {checked && <div className="w-2 h-2 rounded-full bg-accent" />}
      </div>
    </label>
  )
}



