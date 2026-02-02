import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      return (
        <div className="h-full flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-status-failed/10 border border-status-failed/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-status-failed" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h2 className="text-lg font-semibold text-status-failed">Something went wrong</h2>
                <p className="text-sm text-text-muted">The application encountered an error</p>
              </div>
            </div>
            
            {this.state.error && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Error Message</h3>
                <div className="bg-background rounded p-3 font-mono text-sm text-status-failed break-all">
                  {this.state.error.message}
                </div>
              </div>
            )}
            
            {this.state.errorInfo?.componentStack && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Component Stack</h3>
                <pre className="bg-background rounded p-3 font-mono text-xs text-text-secondary overflow-auto max-h-48">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="px-4 py-2 bg-accent text-background rounded-md text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-surface border border-border rounded-md text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
