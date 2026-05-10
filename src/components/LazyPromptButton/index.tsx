import { useState, useCallback } from 'react'
import { useSettings } from '../../hooks/useSettings'
import { LazyPromptModal } from '../LazyPromptModal'
import type { ProcessInstance } from '../../types'

interface LazyPromptButtonProps {
  process: ProcessInstance
  processPath: string
  projectPath: string
  variant?: 'default' | 'compact' | 'icon-only'
  className?: string
}

export function LazyPromptButton({
  process,
  processPath,
  projectPath,
  variant = 'default',
  className = ''
}: LazyPromptButtonProps) {
  const { settings } = useSettings()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering parent click handlers
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  // Don't render if lazy prompts are disabled
  if (!settings.lazyPrompts.enabled) {
    return null
  }

  const getButtonContent = () => {
    return (
      <>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {variant === 'default' && <span>Prompts</span>}
        {variant === 'compact' && <span className="text-xs">Prompts</span>}
      </>
    )
  }

  const getButtonClasses = () => {
    const baseClasses = 'flex items-center gap-1.5 transition-all duration-200 text-accent hover:text-accent-hover'

    switch (variant) {
      case 'icon-only':
        return `${baseClasses} p-1.5 rounded-md hover:bg-accent/10 ${className}`
      case 'compact':
        return `${baseClasses} px-2 py-1 rounded-md hover:bg-accent/10 text-xs font-medium ${className}`
      default:
        return `${baseClasses} px-3 py-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-sm font-medium border border-accent/30 hover:border-accent/50 ${className}`
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={getButtonClasses()}
        title="Open lazy prompts"
      >
        {getButtonContent()}
      </button>

      {isModalOpen && (
        <LazyPromptModal
          process={process}
          processPath={processPath}
          projectPath={projectPath}
          onClose={handleCloseModal}
        />
      )}
    </>
  )
}
