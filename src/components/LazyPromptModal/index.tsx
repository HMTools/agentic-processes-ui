import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSettings } from '../../hooks/useSettings'
import { useToast } from '../Toast'
import { LAZY_PROMPT_CONFIGS, generateLazyPrompt, executeLazyPrompt } from '../../services/lazyPromptsService'
import type { ProcessInstance, LazyPromptType } from '../../types'

interface LazyPromptModalProps {
  process: ProcessInstance
  processPath: string
  onClose: () => void
}

export function LazyPromptModal({ process, processPath, onClose }: LazyPromptModalProps) {
  const { settings } = useSettings()
  const { showToast } = useToast()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const modalRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Get list of available prompts
  const promptTypes = useMemo(() => Object.keys(LAZY_PROMPT_CONFIGS) as LazyPromptType[], [])
  const selectedPromptType = promptTypes[selectedIndex]
  const selectedConfig = LAZY_PROMPT_CONFIGS[selectedPromptType]

  // Generate preview for the selected prompt
  const previewPrompt = useMemo(() => {
    return generateLazyPrompt(selectedPromptType, process, processPath)
  }, [selectedPromptType, process, processPath])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, promptTypes.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          handleSelect(selectedPromptType)
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedPromptType, promptTypes.length, onClose])

  // Focus trap
  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  // Handle prompt selection
  const handleSelect = useCallback(async (type: LazyPromptType) => {
    const result = await executeLazyPrompt(
      type,
      settings.lazyPrompts.defaultAction,
      process,
      processPath
    )

    if (result.success) {
      showToast('Prompt copied to clipboard', 'success')
      onClose()
    } else {
      showToast('Failed to copy prompt', 'error')
    }
  }, [settings.lazyPrompts.defaultAction, process, processPath, onClose, showToast])

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-3xl mx-4 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-elevated">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-accent/20">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-text-primary">Lazy Prompts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface transition-colors text-text-muted hover:text-text-primary"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Prompt List */}
        <div ref={listRef} className="border-b border-border">
          {promptTypes.map((type, index) => {
            const config = LAZY_PROMPT_CONFIGS[type]
            const isSelected = index === selectedIndex

            return (
              <button
                key={type}
                onClick={() => handleSelect(type)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`
                  w-full px-4 py-3 flex items-center gap-3 text-left transition-colors
                  ${isSelected ? 'bg-accent/10' : 'hover:bg-surface-elevated'}
                `}
              >
                {/* Icon */}
                <div className={`
                  p-2 rounded-lg transition-colors
                  ${isSelected ? 'bg-accent/20 text-accent' : 'bg-surface-elevated text-text-muted'}
                `}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${isSelected ? 'text-accent' : 'text-text-primary'}`}>
                    {config.label}
                  </div>
                  <div className="text-xs text-text-muted truncate">
                    {config.description}
                  </div>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border font-mono text-[10px]">
                      ↵
                    </kbd>
                    <span>to select</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Preview Section */}
        <div className="flex flex-col" style={{ maxHeight: '40vh' }}>
          <div className="px-4 py-2 bg-surface-elevated border-b border-border">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Preview</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-background">
            <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap break-words leading-relaxed">
              {previewPrompt}
            </pre>
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 bg-surface-elevated border-t border-border flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono text-[10px]">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono text-[10px]">esc</kbd>
              <span>close</span>
            </span>
          </div>
          <span className="text-text-muted">
            Action: {settings.lazyPrompts.defaultAction === 'clipboard' ? 'Copy to Clipboard' : 'Apply with Agent'}
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}


