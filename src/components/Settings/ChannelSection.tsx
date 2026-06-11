import { useChannels } from '../../hooks/useChannels'
import { ChannelOnboarding } from '../ChannelOnboarding'

interface ChannelSectionProps {
  /** Callback to highlight/scroll to the delivery mode section in Settings */
  onDeliveryModeHint?: () => void
}

/**
 * Self-contained Settings section for the Channel Server.
 * Includes install/uninstall, status display, active channels list,
 * and always-accessible onboarding content.
 */
export function ChannelSection({ onDeliveryModeHint }: ChannelSectionProps) {
  const { isInstalled, installedPath, channels, channelCount, isLoading, error, install, uninstall } = useChannels()

  const handleInstall = async () => {
    const result = await install()
    if (result.success && onDeliveryModeHint) {
      // After successful install, hint the user to set delivery mode
      onDeliveryModeHint()
    }
  }

  return (
    <section className="bg-surface rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-surface-elevated">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/20">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-text-primary">Channel Server</h2>
            <p className="text-xs text-text-muted">MCP channel for sending prompts to Claude Code sessions</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status and Install/Uninstall */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-primary">Status</span>
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                isInstalled
                  ? 'bg-status-completed/20 text-status-completed'
                  : 'bg-text-muted/20 text-text-muted'
              }`}>
                {isInstalled ? 'Installed' : 'Not Installed'}
              </span>
            </div>
            {installedPath && (
              <p className="text-[10px] text-text-muted mt-1 font-mono truncate max-w-md" title={installedPath}>
                {installedPath}
              </p>
            )}
            <p className="text-xs text-text-muted mt-1">
              {isInstalled
                ? 'All new Claude Code sessions will include the channel. Restart existing sessions for changes to take effect.'
                : 'Install to enable sending prompts to any Claude Code session (terminal, VS Code, etc.) via MCP channels.'}
            </p>
          </div>
          <button
            onClick={isInstalled ? uninstall : handleInstall}
            disabled={isLoading}
            className={`ml-4 px-4 py-2 text-sm font-medium rounded-lg transition-colors flex-shrink-0 ${
              isInstalled
                ? 'text-status-failed hover:bg-status-failed/10 border border-status-failed/30'
                : 'text-white bg-accent hover:bg-accent/90'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Working...' : isInstalled ? 'Uninstall' : 'Install'}
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="px-3 py-2 text-xs text-status-failed bg-status-failed/10 border border-status-failed/20 rounded-lg">
            {error}
          </div>
        )}

        {/* Active channels list */}
        {isInstalled && channelCount > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-text-secondary">Active Channels</span>
              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-status-completed/20 text-status-completed">
                {channelCount}
              </span>
            </div>
            <div className="space-y-1">
              {channels.map((ch, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded bg-background text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-status-completed flex-shrink-0" />
                  <span className="font-mono text-text-secondary">Port {ch.port}</span>
                  <span className="text-text-muted">PID {ch.parentPid}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isInstalled && channelCount === 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-text-muted">
              No active Claude Code sessions with channels detected. Start a new Claude Code session to connect.
            </p>
          </div>
        )}

        {/* Onboarding content */}
        <div className="pt-2 border-t border-border">
          <ChannelOnboarding compact />
        </div>
      </div>
    </section>
  )
}
