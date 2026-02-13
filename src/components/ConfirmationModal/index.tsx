import { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
  loading = false
}: ConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Keyboard handling
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      } else if (e.key === 'Enter' && !loading) {
        e.preventDefault()
        await onConfirm()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onConfirm, onCancel, loading])

  // Focus trap
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus()
    }
  }, [isOpen])

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation()
      e.preventDefault()
      onCancel()
    }
  }, [onCancel])

  // Handle confirm click
  const handleConfirm = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!loading) {
      await onConfirm()
    }
  }, [onConfirm, loading])

  // Handle cancel click
  const handleCancel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onCancel()
  }, [onCancel])

  if (!isOpen) return null

  const variantStyles = {
    danger: {
      icon: 'text-status-failed',
      iconBg: 'bg-status-failed/20',
      confirmButton: 'bg-status-failed hover:bg-status-failed/90 text-white'
    },
    warning: {
      icon: 'text-amber-400',
      iconBg: 'bg-amber-400/20',
      confirmButton: 'bg-amber-500 hover:bg-amber-600 text-white'
    },
    info: {
      icon: 'text-accent',
      iconBg: 'bg-accent/20',
      confirmButton: 'bg-accent hover:bg-accent/90 text-white'
    }
  }

  const styles = variantStyles[variant]

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-md mx-4 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-surface-elevated">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${styles.iconBg} ${styles.icon}`}>
              {variant === 'danger' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {variant === 'warning' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {variant === 'info' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              {title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-sm text-text-secondary leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-elevated border-t border-border flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-surface hover:bg-surface-elevated border border-border text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 ${styles.confirmButton}`}
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>

        {/* Footer hint */}
        <div className="px-6 py-2 bg-surface border-t border-border flex items-center justify-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border font-mono text-[10px]">enter</kbd>
            <span>confirm</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border font-mono text-[10px]">esc</kbd>
            <span>cancel</span>
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}
