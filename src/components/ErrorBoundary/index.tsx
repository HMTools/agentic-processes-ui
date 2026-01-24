import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('React Error:', error)
    console.error('Component Stack:', errorInfo.componentStack)
    this.setState({ errorInfo })
  }

  handleReload = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-background p-8">
          <div className="max-w-3xl w-full bg-surface border border-status-failed/30 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-status-failed/10 border-b border-status-failed/30">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-status-failed" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-lg font-semibold text-status-failed">Something went wrong</h2>
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
                    {this.state.error?.message || 'Unknown error'}
                  </code>
                </div>
              </div>

              {/* Error Stack */}
              {this.state.error?.stack && (
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider block mb-2">
                    Stack Trace
                  </label>
                  <div className="bg-background rounded-lg p-4 border border-border max-h-48 overflow-auto">
                    <pre className="text-xs text-text-secondary font-mono whitespace-pre-wrap break-all">
                      {this.state.error.stack}
                    </pre>
                  </div>
                </div>
              )}

              {/* Component Stack */}
              {this.state.errorInfo?.componentStack && (
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider block mb-2">
                    Component Stack
                  </label>
                  <div className="bg-background rounded-lg p-4 border border-border max-h-48 overflow-auto">
                    <pre className="text-xs text-text-secondary font-mono whitespace-pre-wrap break-all">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={this.handleReload}
                  className="px-4 py-2 bg-accent text-background text-sm font-medium rounded-md hover:bg-accent/90 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-surface-elevated text-text-primary text-sm font-medium rounded-md hover:bg-surface-elevated/80 transition-colors border border-border"
                >
                  Reload App
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

