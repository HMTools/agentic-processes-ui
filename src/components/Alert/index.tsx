import { useEffect } from 'react'

interface AlertProps {
  message: string
  onClose: () => void
  autoCloseMs?: number
}

export function Alert({ message, onClose, autoCloseMs = 5000 }: AlertProps) {
  // Auto-close after specified duration
  useEffect(() => {
    if (autoCloseMs > 0) {
      const timer = setTimeout(onClose, autoCloseMs)
      return () => clearTimeout(timer)
    }
  }, [onClose, autoCloseMs])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-elevated border border-border shadow-lg max-w-md">
        {/* Info icon */}
        <div className="flex-shrink-0">
          <svg 
            className="w-5 h-5 text-amber-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        
        {/* Message */}
        <p className="text-sm text-text-primary flex-1">
          {message}
        </p>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded hover:bg-surface transition-colors"
          aria-label="Close alert"
        >
          <svg 
            className="w-4 h-4 text-text-muted hover:text-text-secondary" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

