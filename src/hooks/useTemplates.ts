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

export function useTemplates(projectPath: string | null) {
  const [processTemplates, setProcessTemplates] = useState<ProcessTemplate[]>([])
  const [stepTemplates, setStepTemplates] = useState<StepTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load templates when project path changes
  const loadTemplates = useCallback(async () => {
    if (!projectPath || !isElectron()) {
      setProcessTemplates([])
      setStepTemplates([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [processResults, stepResults] = await Promise.all([
        window.electronAPI.loadProcessTemplates(projectPath),
        window.electronAPI.loadStepTemplates(projectPath)
      ])

      setProcessTemplates(processResults as ProcessTemplate[])
      setStepTemplates(stepResults as StepTemplate[])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to load templates: ${errorMessage}`)
      console.error('Error loading templates:', err)
    } finally {
      setIsLoading(false)
    }
  }, [projectPath])

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
