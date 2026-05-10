import { useState, useEffect, useCallback, useMemo } from 'react'
import type { ProcessTemplate, StepTemplate, TemplateSummary, StepSummary } from '../types'
import {
  toTemplateSummary,
  toStepSummary,
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
  const [stepTemplates, setStepTemplates] = useState<StepTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load templates from unified ~/.claude/agentic-processes/ location
  const loadTemplates = useCallback(async () => {
    if (!isElectron()) {
      setProcessTemplates([])
      setStepTemplates([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('[useTemplates] Loading templates from ~/.claude/agentic-processes/')
      const [processResults, stepResults] = await Promise.all([
        window.electronAPI.loadProcessTemplates(),
        window.electronAPI.loadStepTemplates()
      ])

      const loadedProcessTemplates = processResults as ProcessTemplate[]
      const loadedStepTemplates = stepResults as StepTemplate[]

      setProcessTemplates(loadedProcessTemplates)
      setStepTemplates(loadedStepTemplates)
      console.log('[useTemplates] Loaded', loadedProcessTemplates.length, 'process templates,', loadedStepTemplates.length, 'step templates')
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

  // Get step template summaries
  const stepTemplateSummaries = useMemo((): StepSummary[] => {
    return stepTemplates.map(toStepSummary)
  }, [stepTemplates])

  // Get unique categories
  const processCategories = useMemo(() => {
    return getCategories(processTemplates)
  }, [processTemplates])

  const stepCategories = useMemo(() => {
    return getCategories(stepTemplates)
  }, [stepTemplates])

  // Get a specific process template by name
  const getProcessTemplate = useCallback((name: string): ProcessTemplate | undefined => {
    return processTemplates.find(t => t.name === name)
  }, [processTemplates])

  // Get a specific step template by name
  const getStepTemplate = useCallback((name: string): StepTemplate | undefined => {
    return stepTemplates.find(s => s.name === name)
  }, [stepTemplates])

  // Filter process templates by category
  const filterProcessTemplates = useCallback((category: string | null): ProcessTemplate[] => {
    return filterByCategory(processTemplates, category)
  }, [processTemplates])

  // Filter step templates by category
  const filterStepTemplates = useCallback((category: string | null): StepTemplate[] => {
    return filterByCategory(stepTemplates, category)
  }, [stepTemplates])

  // Search process templates
  const searchProcessTemplates = useCallback((query: string): ProcessTemplate[] => {
    return searchTemplates(processTemplates, query)
  }, [processTemplates])

  // Search step templates
  const searchStepTemplates = useCallback((query: string): StepTemplate[] => {
    return searchTemplates(stepTemplates, query)
  }, [stepTemplates])

  return {
    processTemplates,
    stepTemplates,
    processTemplateSummaries,
    stepTemplateSummaries,
    processCategories,
    stepCategories,
    isLoading,
    error,
    loadTemplates,
    getProcessTemplate,
    getStepTemplate,
    filterProcessTemplates,
    filterStepTemplates,
    searchProcessTemplates,
    searchStepTemplates
  }
}
