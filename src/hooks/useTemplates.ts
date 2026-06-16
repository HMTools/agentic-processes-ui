import { useState, useEffect, useCallback, useMemo } from 'react'
import type { ProcessTemplate, TemplateSummary } from '../types'
import {
  toTemplateSummary,
  filterByCategory,
  searchTemplates,
  getCategories
} from '../services/templatesService'

// Check if we're running in Electron
const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined
}

/**
 * Unified template loading hook.
 * Templates are loaded from a single location: ~/.claude/agentic-processes/
 * The frameworkPath and projectPaths params are kept for API compat but ignored
 * for template loading (templates come from the unified IPC call).
 */
export function useTemplates(_frameworkPath?: string | null, _projectPaths?: string[]) {
  const [processTemplates, setProcessTemplates] = useState<ProcessTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load templates from unified ~/.claude/agentic-processes/ location
  const loadTemplates = useCallback(async () => {
    if (!isElectron()) {
      setProcessTemplates([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('[useTemplates] Loading templates from ~/.claude/agentic-processes/')
      const processResults = await window.electronAPI.loadProcessTemplates()

      const loadedProcessTemplates = processResults as ProcessTemplate[]

      setProcessTemplates(loadedProcessTemplates)
      console.log('[useTemplates] Loaded', loadedProcessTemplates.length, 'process templates')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to load templates: ${errorMessage}`)
      console.error('Error loading templates:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load templates on mount and when project changes
  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  // Get process template summaries
  const processTemplateSummaries = useMemo((): TemplateSummary[] => {
    return processTemplates.map(toTemplateSummary)
  }, [processTemplates])

  // Get unique categories
  const processCategories = useMemo(() => {
    return getCategories(processTemplates)
  }, [processTemplates])

  // Get a specific process template by name
  const getProcessTemplate = useCallback((name: string): ProcessTemplate | undefined => {
    return processTemplates.find(t => t.name === name)
  }, [processTemplates])

  // Filter process templates by category
  const filterProcessTemplates = useCallback((category: string | null): ProcessTemplate[] => {
    return filterByCategory(processTemplates, category)
  }, [processTemplates])

  // Search process templates
  const searchProcessTemplates = useCallback((query: string): ProcessTemplate[] => {
    return searchTemplates(processTemplates, query)
  }, [processTemplates])

  return {
    processTemplates,
    processTemplateSummaries,
    processCategories,
    isLoading,
    error,
    loadTemplates,
    getProcessTemplate,
    filterProcessTemplates,
    searchProcessTemplates
  }
}
