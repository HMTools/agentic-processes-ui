import { useSettings } from '../../hooks/useSettings'

interface SettingsProps {
  onBack: () => void
}

export function Settings({ onBack }: SettingsProps) {
  const { settings, updateLazyPromptsSettings, resetSettings } = useSettings()

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
                    label="Apply with Agent"
                    description="Send the prompt directly to an AI agent (coming soon)"
                    disabled
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



