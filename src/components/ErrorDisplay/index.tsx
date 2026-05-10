interface ErrorDisplayProps {
  error: string
  /** All configured project paths */
  projectPaths?: string[]
  onRetry: () => void
  /** Add a folder (auto-detects type) */
  onAddFolder: (path: string) => Promise<void>
  /** Opens folder picker dialog */
  onSelectFolder: () => void
}

export function ErrorDisplay({ 
  error, 
  projectPaths = [], 
  onRetry, 
  onAddFolder,
  onSelectFolder 
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

          {/* Project Paths if available */}
          {projectPaths.length > 0 && (
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider block mb-2">
                Configured Project Folders ({projectPaths.length})
              </label>
              <div className="bg-background rounded-lg p-3 border border-border space-y-2">
                {projectPaths.map((path, idx) => (
                  <code key={idx} className="block text-sm text-text-secondary font-mono break-all">
                    {path}
                  </code>
                ))}
              </div>
            </div>
          )}

          {/* Troubleshooting Tips */}
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider block mb-2">
              Troubleshooting Tips
            </label>
            <ul className="text-sm text-text-secondary space-y-2 list-disc list-inside">
              <li>The <code className="text-accent">~/.claude/agentic-processes</code> directory structure will be created automatically if it doesn't exist</li>
              <li>Verify you have write permissions for the selected folders</li>
              <li>Check that the paths are valid and accessible</li>
              <li>Try adding a different project folder</li>
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
              onClick={onSelectFolder}
              className="px-4 py-2 bg-surface-elevated text-text-primary text-sm font-medium rounded-md hover:bg-surface-elevated/80 transition-colors border border-border"
            >
              Add Folder
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

