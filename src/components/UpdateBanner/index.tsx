import type { UpdateState } from '../../hooks/useAutoUpdate'

interface UpdateBannerProps {
  updateState: UpdateState
  onDismiss: () => void
  onRestart: () => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function UpdateBanner({ updateState, onDismiss, onRestart }: UpdateBannerProps) {
  const { status, newVersion, downloadPercent, dismissed } = updateState

  if (dismissed || status === 'idle' || status === 'error') return null

  const isDownloading = status === 'downloading' || status === 'available'
  const isReady = status === 'downloaded'

  return (
    <div
      className={`animate-slide-down flex items-center gap-3 px-4 py-2 border-b border-border ${
        isReady ? 'bg-status-completed/10 border-l-4 border-l-status-completed' : 'bg-surface-elevated border-l-4 border-l-accent'
      }`}
    >
      {/* Icon */}
      {status === 'checking' && (
        <svg className="w-4 h-4 text-accent animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {isDownloading && (
        <svg className="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      )}
      {isReady && (
        <svg className="w-4 h-4 text-status-completed shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}

      {/* Text */}
      <span className="text-sm text-text-secondary">
        {status === 'checking' && 'Checking for updates...'}
        {status === 'available' && `Update v${newVersion} available — downloading...`}
        {status === 'downloading' && (
          <>Downloading v{newVersion}... {downloadPercent.toFixed(0)}%</>
        )}
        {isReady && (
          <>
            v{newVersion} ready to install
          </>
        )}
      </span>

      {/* Progress bar */}
      {isDownloading && (
        <div className="flex-1 max-w-xs h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${downloadPercent}%` }}
          />
        </div>
      )}

      {/* Spacer */}
      {!isDownloading && <div className="flex-1" />}

      {/* Actions */}
      {isReady && (
        <button
          onClick={onRestart}
          className="text-xs font-medium px-3 py-1 rounded bg-status-completed text-black hover:bg-status-completed/80 transition-colors"
        >
          Restart Now
        </button>
      )}

      <button
        onClick={onDismiss}
        className="text-text-muted hover:text-text-secondary transition-colors p-0.5"
        title="Dismiss"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
