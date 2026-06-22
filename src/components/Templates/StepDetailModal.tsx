import { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { TemplateStep } from '../../types'
import { getStepRefDisplayName } from '../../services/templatesService'
import { parseStepDefinition } from './TemplateDetail'
import { OutputSection, SubstepsSection, FlowSection, GuidanceSection, MemoryFileUsageSection, ContextSection, SubProcessSection } from './StepModalSections'

interface StepDetailModalProps {
  steps: TemplateStep[]
  currentIndex: number
  onNavigate: (index: number) => void
  onClose: () => void
}

export function StepDetailModal({ steps, currentIndex, onNavigate, onClose }: StepDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const step = steps[currentIndex]
  const parsed = parseStepDefinition(step.stepDefinition)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < steps.length - 1

  const handlePrev = useCallback(() => {
    if (hasPrev) onNavigate(currentIndex - 1)
  }, [hasPrev, currentIndex, onNavigate])

  const handleNext = useCallback(() => {
    if (hasNext) onNavigate(currentIndex + 1)
  }, [hasNext, currentIndex, onNavigate])

  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, handlePrev, handleNext])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-[95vw] h-[92vh] bg-background border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col outline-none animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-elevated flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-accent/20 text-accent text-sm font-semibold flex-shrink-0">
              {step.number}
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-text-primary truncate">{step.name}</h2>
              <p className="text-xs font-mono text-text-muted truncate" title={step.stepRef || undefined}>{getStepRefDisplayName(step.stepRef, step.stepRefName)}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {step.approvalRequired && (
                <span className="px-1.5 py-0.5 text-[10px] rounded bg-status-paused/20 text-status-paused font-medium">
                  Approval Required
                </span>
              )}
              {step.conditional && (
                <span className="px-1.5 py-0.5 text-[10px] rounded bg-status-active/20 text-status-active font-medium">
                  Conditional
                </span>
              )}
              {step.subProcessTrigger && (
                <span className="px-1.5 py-0.5 text-[10px] rounded bg-purple-500/20 text-purple-400 font-medium">
                  Sub-Process
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Step navigation */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className="p-1.5 rounded-md hover:bg-surface transition-colors disabled:opacity-30 disabled:cursor-default"
              >
                <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-xs text-text-muted whitespace-nowrap">
                Step {currentIndex + 1} of {steps.length}
              </span>
              <button
                onClick={handleNext}
                disabled={!hasNext}
                className="p-1.5 rounded-md hover:bg-surface transition-colors disabled:opacity-30 disabled:cursor-default"
              >
                <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-surface transition-colors"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-6">
              <OutputSection output={parsed.output} />
              <SubstepsSection substeps={parsed.substeps} />
              <FlowSection flow={parsed.flow} />
            </div>

            {/* Sidebar column */}
            <div className="space-y-6">
              <GuidanceSection guidance={parsed.guidance} />
              <MemoryFileUsageSection memoryFileUsage={parsed.memoryFileUsage} />
              {step.context && Object.keys(step.context).length > 0 && (
                <ContextSection context={step.context} />
              )}
              {step.subProcessTrigger && (
                <SubProcessSection trigger={step.subProcessTrigger} />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 bg-surface-elevated border-t border-border flex items-center gap-4 text-xs text-text-muted flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-mono">Esc</kbd>
            <span>close</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-mono">&larr;</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-mono">&rarr;</kbd>
            <span>navigate steps</span>
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}
