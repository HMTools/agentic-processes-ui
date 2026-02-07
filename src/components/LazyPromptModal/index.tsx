import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSettings } from '../../hooks/useSettings'
import { useToast } from '../Toast'
import { 
  LAZY_PROMPT_CONFIGS, 
  generateLazyPrompt, 
  executeLazyPrompt,
  getInteractionOptions,
  getActiveStep,
  generateSelectOptionPrompt
} from '../../services/lazyPromptsService'
import type { ProcessInstance, LazyPromptType, InteractionOption } from '../../types'

interface LazyPromptModalProps {
  process: ProcessInstance
  processPath: string
  onClose: () => void
}

// Item types for the flattened list
type ListItem = 
  | { type: 'select-option-header'; expanded: boolean }
  | { type: 'interaction-option'; option: InteractionOption }
  | { type: 'prompt'; promptType: LazyPromptType }

export function LazyPromptModal({ process, processPath, onClose }: LazyPromptModalProps) {
  const { settings } = useSettings()
  const { showToast } = useToast()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [optionsExpanded, setOptionsExpanded] = useState(true) // Expanded by default
  const modalRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Get interaction options from active step
  const interactionOptions = useMemo(() => getInteractionOptions(process), [process])
  const activeStep = useMemo(() => getActiveStep(process), [process])
  const hasOptions = interactionOptions && interactionOptions.length > 0

  // Build the list of items
  const listItems = useMemo(() => {
    const items: ListItem[] = []
    
    // Add Select Option section if options exist
    if (hasOptions) {
      items.push({ type: 'select-option-header', expanded: optionsExpanded })
      if (optionsExpanded) {
        interactionOptions.forEach(option => {
          items.push({ type: 'interaction-option', option })
        })
      }
    }
    
    // Add Continue Process
    items.push({ type: 'prompt', promptType: 'continue-process' })
    
    return items
  }, [hasOptions, interactionOptions, optionsExpanded])

  // Get currently selected item
  const selectedItem = listItems[selectedIndex]

  // Generate preview for the selected item
  const previewPrompt = useMemo(() => {
    if (!selectedItem) return ''
    
    switch (selectedItem.type) {
      case 'select-option-header':
        return 'Select an option from the list below...'
      case 'interaction-option':
        return generateSelectOptionPrompt(selectedItem.option)
      case 'prompt':
        return generateLazyPrompt(selectedItem.promptType, process, processPath)
      default:
        return ''
    }
  }, [selectedItem, process, processPath])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, listItems.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'ArrowRight':
          // Expand options if on header
          if (selectedItem?.type === 'select-option-header' && !optionsExpanded) {
            e.preventDefault()
            setOptionsExpanded(true)
          }
          break
        case 'ArrowLeft':
          // Collapse options if on header
          if (selectedItem?.type === 'select-option-header' && optionsExpanded) {
            e.preventDefault()
            setOptionsExpanded(false)
            setSelectedIndex(0) // Reset to header
          }
          break
        case 'Enter':
          e.preventDefault()
          handleItemSelect(selectedItem)
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedItem, listItems.length, onClose, optionsExpanded])

  // Focus trap
  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  // Handle item selection
  const handleItemSelect = useCallback(async (item: ListItem | undefined) => {
    if (!item) return

    const isAgentAction = settings.lazyPrompts.defaultAction === 'agent-apply'

    switch (item.type) {
      case 'select-option-header':
        // Toggle expansion
        setOptionsExpanded(prev => !prev)
        break
      case 'interaction-option':
        // Execute action for option
        const optionResult = await executeLazyPrompt(
          'select-option',
          settings.lazyPrompts.defaultAction,
          process,
          processPath,
          item.option
        )
        if (optionResult.success) {
          const message = isAgentAction 
            ? `"${item.option.label}" sent to agent`
            : `"${item.option.label}" copied to clipboard`
          showToast(message, 'success')
          onClose()
        } else if (optionResult.noSession) {
          showToast('No active agent session. Start an agent first.', 'info')
        } else {
          showToast(optionResult.message || 'Failed to execute action', 'error')
        }
        break
      case 'prompt':
        const result = await executeLazyPrompt(
          item.promptType,
          settings.lazyPrompts.defaultAction,
          process,
          processPath
        )
        if (result.success) {
          const message = isAgentAction 
            ? 'Prompt sent to agent!'
            : 'Prompt copied to clipboard!'
          showToast(message, 'success')
          onClose()
        } else if (result.noSession) {
          showToast('No active agent session. Start an agent first.', 'info')
        } else {
          showToast(result.message || 'Failed to execute action', 'error')
        }
        break
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

        {/* List */}
        <div ref={listRef} className="border-b border-border max-h-[40vh] overflow-y-auto">
          {listItems.map((item, index) => {
            const isSelected = index === selectedIndex

            if (item.type === 'select-option-header') {
              return (
                <button
                  key="select-option-header"
                  onClick={() => {
                    setSelectedIndex(index)
                    setOptionsExpanded(prev => !prev)
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    w-full px-4 py-3 flex items-center gap-3 text-left transition-colors
                    ${isSelected ? 'bg-accent/10' : 'hover:bg-surface-elevated'}
                  `}
                >
                  {/* Expand/Collapse Icon */}
                  <div className={`
                    p-2 rounded-lg transition-colors
                    ${isSelected ? 'bg-accent/20 text-accent' : 'bg-surface-elevated text-text-muted'}
                  `}>
                    <svg 
                      className={`w-4 h-4 transition-transform ${optionsExpanded ? 'rotate-90' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${isSelected ? 'text-accent' : 'text-text-primary'}`}>
                      {LAZY_PROMPT_CONFIGS['select-option'].label}
                    </div>
                    <div className="text-xs text-text-muted truncate">
                      {activeStep?.name ? `Step: ${activeStep.name}` : LAZY_PROMPT_CONFIGS['select-option'].description}
                    </div>
                  </div>

                  {/* Options count badge */}
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent/20 text-accent">
                    {interactionOptions?.length} options
                  </span>
                </button>
              )
            }

            if (item.type === 'interaction-option') {
              const isDefault = item.option.isDefault
              
              return (
                <button
                  key={`option-${item.option.id}`}
                  onClick={() => {
                    setSelectedIndex(index)
                    handleItemSelect(item)
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    w-full pl-12 pr-4 py-2.5 flex items-center gap-3 text-left transition-colors
                    ${isSelected ? 'bg-accent/10' : 'hover:bg-surface-elevated'}
                  `}
                >
                  {/* Option icon */}
                  <div className={`
                    p-1.5 rounded-lg transition-colors
                    ${isSelected ? 'bg-accent/20 text-accent' : 'bg-surface-elevated text-text-muted'}
                  `}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${isSelected ? 'text-accent' : 'text-text-primary'}`}>
                      {item.option.label}
                    </div>
                    {item.option.description && (
                      <div className="text-xs text-text-muted truncate">
                        {item.option.description}
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5">
                    {isDefault && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-status-active/20 text-status-active">
                        default
                      </span>
                    )}
                  </div>

                  {/* Selection hint */}
                  {isSelected && (
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border font-mono text-[10px]">
                        ↵
                      </kbd>
                    </div>
                  )}
                </button>
              )
            }

            if (item.type === 'prompt') {
              const config = LAZY_PROMPT_CONFIGS[item.promptType]
              
              return (
                <button
                  key={`prompt-${item.promptType}`}
                  onClick={() => {
                    setSelectedIndex(index)
                    handleItemSelect(item)
                  }}
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
            }

            return null
          })}
        </div>

        {/* Preview Section */}
        <div className="flex flex-col" style={{ maxHeight: '30vh' }}>
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
            {hasOptions && (
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono text-[10px]">←</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono text-[10px]">→</kbd>
                <span>expand/collapse</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono text-[10px]">esc</kbd>
              <span>close</span>
            </span>
          </div>
          <span className="text-text-muted">
            Action: {settings.lazyPrompts.defaultAction === 'clipboard' ? 'Copy to Clipboard' : 'Send to Agent'}
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}
