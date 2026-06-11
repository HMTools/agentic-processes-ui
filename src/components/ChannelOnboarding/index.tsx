import { useState } from 'react'

interface ChannelOnboardingProps {
  /** Render inline (collapsed by default) or expanded */
  defaultExpanded?: boolean
  /** Compact mode for embedding in other components */
  compact?: boolean
}

/**
 * Reusable onboarding/help component that explains what channels are
 * and how to use them. Can be rendered inline in ChannelSection or
 * as a standalone help panel.
 */
export function ChannelOnboarding({ defaultExpanded = false, compact = false }: ChannelOnboardingProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Learn about Channels
      </button>
    )
  }

  return (
    <div className={`rounded-lg border border-border bg-background ${compact ? 'p-3' : 'p-4'} space-y-4`}>
      {/* Header with collapse */}
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold text-text-primary ${compact ? 'text-xs' : 'text-sm'}`}>
          About Channels
        </h3>
        <button
          onClick={() => setExpanded(false)}
          className="p-1 rounded hover:bg-surface-elevated transition-colors text-text-muted hover:text-text-primary"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      {/* What are Channels? */}
      <div>
        <h4 className="text-xs font-medium text-text-secondary mb-1">What are Channels?</h4>
        <p className="text-xs text-text-muted leading-relaxed">
          Channels let this app communicate with any Claude Code session running on your machine
          -- in your terminal, VS Code, or any other tool. They use the MCP protocol to deliver
          prompts and receive replies.
        </p>
      </div>

      {/* How it works */}
      <div>
        <h4 className="text-xs font-medium text-text-secondary mb-2">How it works</h4>
        <div className="flex items-center gap-2">
          <Step number={1} label="Install" description="Install the channel server" />
          <Arrow />
          <Step number={2} label="Connect" description="Claude Code picks up the channel" />
          <Arrow />
          <Step number={3} label="Send" description="App sends prompts & gets replies" />
        </div>
      </div>

      {/* One-way vs Two-way */}
      <div>
        <h4 className="text-xs font-medium text-text-secondary mb-2">Communication modes</h4>
        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-accent/20 text-accent flex-shrink-0 mt-0.5">
              One-way
            </span>
            <span className="text-xs text-text-muted">
              App pushes prompts to Claude Code sessions (e.g., continue process, select option)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-status-active/20 text-status-active flex-shrink-0 mt-0.5">
              Two-way
            </span>
            <span className="text-xs text-text-muted">
              Claude Code can also send replies back via SSE (Server-Sent Events)
            </span>
          </div>
        </div>
      </div>

      {/* Getting started */}
      <div>
        <h4 className="text-xs font-medium text-text-secondary mb-2">Getting started</h4>
        <ol className="space-y-1.5">
          <ChecklistItem checked={false} text="Install the channel server (above)" />
          <ChecklistItem checked={false} text="Start a Claude Code session (new sessions auto-connect)" />
          <ChecklistItem checked={false} text='Set delivery mode to "Channel" in Lazy Prompts settings' />
        </ol>
      </div>
    </div>
  )
}

function Step({ number, label, description }: { number: number; label: string; description: string }) {
  return (
    <div className="flex-1 text-center">
      <div className="w-7 h-7 mx-auto rounded-full bg-accent/20 text-accent text-xs font-semibold flex items-center justify-center mb-1">
        {number}
      </div>
      <div className="text-xs font-medium text-text-primary">{label}</div>
      <div className="text-[10px] text-text-muted mt-0.5">{description}</div>
    </div>
  )
}

function Arrow() {
  return (
    <svg className="w-4 h-4 text-text-muted flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function ChecklistItem({ checked, text }: { checked: boolean; text: string }) {
  return (
    <li className="flex items-start gap-2 text-xs text-text-muted">
      <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 ${
        checked ? 'bg-status-completed/20 border-status-completed/30' : 'border-border'
      }`}>
        {checked && (
          <svg className="w-3 h-3 text-status-completed" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span>{text}</span>
    </li>
  )
}
