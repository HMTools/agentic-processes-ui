interface ErrorDisplayProps {
  error: string
  projectPath?: string | null
  onRetry?: () => void
  onSelectDifferent?: () => void
}

export function ErrorDisplay({ error, projectPath, onRetry, onSelectDifferent }: ErrorDisplayProps) {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="max-w-lg w-full bg-status-failed/10 border border-status-failed/30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-8 h-8 text-status-failed" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h2 className="text-lg font-semibold text-status-failed">Error</h2>
            {projectPath && (
              <p className="text-xs text-text-muted font-mono truncate max-w-[300px]">{projectPath}</p>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <div className="bg-background rounded p-3 text-sm text-text-secondary whitespace-pre-wrap">
            {error}
          </div>
        </div>
        
        <div className="flex gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-accent text-background rounded-md text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              Retry
            </button>
          )}
          {onSelectDifferent && (
            <button
              onClick={onSelectDifferent}
              className="px-4 py-2 bg-surface border border-border rounded-md text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Select Different Folder
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
