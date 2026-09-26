import { useHerdrStatus } from '../../hooks/useHerdrStatus'

/**
 * Self-contained Settings section showing Herdr's local socket connection
 * status (connected/disconnected + socket path), with a manual refresh.
 */
export function HerdrStatusSection() {
  const { isConnected, socketPath, isLoading, error, refresh } = useHerdrStatus()

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
            <h2 className="text-sm font-semibold text-text-primary">Herdr Connection</h2>
            <p className="text-xs text-text-muted">Local socket connection used to control agent sessions</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-primary">Status</span>
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                isConnected
                  ? 'bg-status-completed/20 text-status-completed'
                  : 'bg-status-failed/20 text-status-failed'
              }`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {socketPath && (
              <p className="text-[10px] text-text-muted mt-1 font-mono truncate max-w-md" title={socketPath}>
                {socketPath}
              </p>
            )}
            <p className="text-xs text-text-muted mt-1">
              {isConnected
                ? 'Connected to Herdr. Agent sessions are sent through its local socket API.'
                : 'Not connected to Herdr. Start Herdr to enable agent sessions and lazy prompt delivery.'}
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="ml-4 px-4 py-2 text-sm font-medium rounded-lg transition-colors flex-shrink-0 text-text-secondary hover:text-text-primary border border-border hover:border-accent/50 disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="px-3 py-2 text-xs text-status-failed bg-status-failed/10 border border-status-failed/20 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </section>
  )
}
