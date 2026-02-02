interface ErrorDisplayProps {
  error: string
  projectPath?: string | null
  onRetry: () => void
  onSelectDifferent: () => void
}

export function ErrorDisplay({ 
  error, 
  projectPath, 
  onRetry, 
  onSelectDifferent 
}: ErrorDisplayProps) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-background p-8">
      <div className="max-w-2xl w-full bg-surface border border-status-failed/30 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-status-failed/10 border-b border-status-failed/30">
          <div className="flex items-center gap-3">
            <svg 
              className="w-6 h-6 text-status-failed" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <h2 className="text-lg font-semibold text-status-failed">
              Error Loading Processes
            </h2>
          </div>
        </div>

        {/* Error Details */}
        <div className="p-6 space-y-4">
          {/* Error Message */}
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider block mb-2">
              Error Message
            </label>
            <div className="bg-background rounded-lg p-4 border border-border">
              <code className="text-sm text-status-failed font-mono break-all">
                {error}
              </code>
            </div>
          </div>

          {/* Project Path if available */}
          {projectPath && (
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider block mb-2">
                Selected Folder
              </label>
              <div className="bg-background rounded-lg p-4 border border-border">
                <code className="text-sm text-text-secondary font-mono break-all">
                  {projectPath}
                </code>
              </div>
            </div>
          )}

          {/* Troubleshooting Tips */}
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider block mb-2">
              Troubleshooting Tips
            </label>
            <ul className="text-sm text-text-secondary space-y-2 list-disc list-inside">
              <li>Ensure the selected folder contains a <code className="text-accent">.user-processes</code> directory</li>
              <li>Check that the folder has <code className="text-accent">active</code>, <code className="text-accent">completed</code>, or <code className="text-accent">failed</code> subdirectories</li>
              <li>Verify you have read permissions for the selected folder</li>
              <li>Try selecting a different project folder</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-accent text-background text-sm font-medium rounded-md hover:bg-accent/90 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onSelectDifferent}
              className="px-4 py-2 bg-surface-elevated text-text-primary text-sm font-medium rounded-md hover:bg-surface-elevated/80 transition-colors border border-border"
            >
              Select Different Folder
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

