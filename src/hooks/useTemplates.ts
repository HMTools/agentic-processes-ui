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

// Helper to extract folder name from path
const getFolderName = (path: string): string => {
  const normalized = path.replace(/\\/g, '/')
  const parts = normalized.split('/').filter(Boolean)
  return parts[parts.length - 1] || path
}

/**
 * Multi-source template loading hook
 * @param frameworkPath - Path to framework repo containing .processes/
 * @param projectPaths - Paths to project repos containing .user-processes/
 */
export function useTemplates(frameworkPath: string | null, projectPaths: string[] = []) {
  const [processTemplates, setProcessTemplates] = useState<ProcessTemplate[]>([])
  const [stepTemplates, setStepTemplates] = useState<StepTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load templates from framework and all projects
  const loadTemplates = useCallback(async () => {
    if (!isElectron()) {
      setProcessTemplates([])
      setStepTemplates([])
      return
    }
    
    // Need at least one source
    if (!frameworkPath && projectPaths.length === 0) {
      setProcessTemplates([])
      setStepTemplates([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const allProcessTemplates: ProcessTemplate[] = []
      const allStepTemplates: StepTemplate[] = []

      // 1. Load framework templates (from .processes/)
      if (frameworkPath) {
        console.log('[useTemplates] Loading framework templates from:', frameworkPath)
        const [fwProcessResults, fwStepResults] = await Promise.all([
          window.electronAPI.loadProcessTemplates(frameworkPath),
          window.electronAPI.loadStepTemplates(frameworkPath)
        ])

        // Add with source label
        const fwProcessTemplates = (fwProcessResults as ProcessTemplate[]).map(t => ({
          ...t,
          source: 'framework'
        }))
        const fwStepTemplates = (fwStepResults as StepTemplate[]).map(t => ({
          ...t,
          source: 'framework'
        }))

        allProcessTemplates.push(...fwProcessTemplates)
        allStepTemplates.push(...fwStepTemplates)
        console.log('[useTemplates] Loaded', fwProcessTemplates.length, 'process templates,', fwStepTemplates.length, 'step templates from framework')
      }

      // 2. Load user templates from each project (from .user-processes/)
      for (const projectPath of projectPaths) {
        console.log('[useTemplates] Loading user templates from:', projectPath)
        const projectName = getFolderName(projectPath)
        
        try {
          const [userProcessResults, userStepResults] = await Promise.all([
            window.electronAPI.loadUserTemplates(projectPath),
            window.electronAPI.loadUserSteps(projectPath)
          ])

          // Add with source label (project folder name)
          const userProcessTemplates = (userProcessResults as ProcessTemplate[]).map(t => ({
            ...t,
            source: projectName
          }))
          const userStepTemplates = (userStepResults as StepTemplate[]).map(t => ({
            ...t,
            source: projectName
          }))

          allProcessTemplates.push(...userProcessTemplates)
          allStepTemplates.push(...userStepTemplates)
          console.log('[useTemplates] Loaded', userProcessTemplates.length, 'process templates,', userStepTemplates.length, 'step templates from', projectName)
        } catch (err) {
          // Log but don't fail - some projects may not have templates
          console.warn('[useTemplates] Failed to load user templates from', projectPath, ':', err)
        }
      }

      setProcessTemplates(allProcessTemplates)
      setStepTemplates(allStepTemplates)
      console.log('[useTemplates] Total loaded:', allProcessTemplates.length, 'process templates,', allStepTemplates.length, 'step templates')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to load templates: ${errorMessage}`)
      console.error('Error loading templates:', err)
    } finally {
      setIsLoading(false)
    }
  }, [frameworkPath, projectPaths])

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
