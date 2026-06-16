import type {
  ProcessTemplate,
  TemplateSummary,
  MemoryFlowMapping,
  MemoryFlowStep
} from '../types'

// Convert ProcessTemplate to TemplateSummary for list display
export function toTemplateSummary(template: ProcessTemplate): TemplateSummary {
  return {
    name: template.name,
    category: template.category,
    title: template.metadata.title,
    purpose: template.metadata.purposeAndUsage,
    stepCount: template.steps.length,
    filePath: template.filePath || '',
    lastUpdated: template.metadata.lastUpdated
  }
}

// Group templates by category
export function groupByCategory<T extends { category: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const category = item.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

// Get unique categories from templates
export function getCategories<T extends { category: string }>(items: T[]): string[] {
  const categories = new Set(items.map(item => item.category))
  return Array.from(categories).sort()
}

// Filter templates by category
export function filterByCategory<T extends { category: string }>(
  items: T[], 
  category: string | null
): T[] {
  if (!category || category === 'all') {
    return items
  }
  return items.filter(item => item.category === category)
}

// Search templates by name or title
export function searchTemplates<T extends { name: string; metadata: { title: string; purposeAndUsage: string } }>(
  items: T[],
  query: string
): T[] {
  if (!query.trim()) {
    return items
  }
  const lowerQuery = query.toLowerCase()
  return items.filter(item => 
    item.name.toLowerCase().includes(lowerQuery) ||
    item.metadata.title.toLowerCase().includes(lowerQuery) ||
    item.metadata.purposeAndUsage.toLowerCase().includes(lowerQuery)
  )
}

// Format category name for display
export function formatCategoryName(category: string): string {
  if (!category) return ''
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Get step reference display name
export function getStepRefDisplayName(stepRef: string): string {
  if (!stepRef) return ''

  // Simple name format (new): "understand-context" -> "Understand Context"
  if (!stepRef.startsWith('@')) {
    return stepRef
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // @framework-step:name -> extract name and titleize
  const fwMatch = stepRef.match(/@framework-step:([\w-]+)/)
  if (fwMatch) {
    return fwMatch[1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Legacy @step:category/step-name -> extract name and titleize
  const legacyMatch = stepRef.match(/@(?:step|user-step):[\w-]+\/([\w-]+)/)
  if (legacyMatch) {
    return legacyMatch[1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return stepRef
}

// Parse step reference to get category and name
export function parseStepRef(stepRef: string): { category: string; name: string } | null {
  if (!stepRef) return null

  // Simple name format (new): treat as name with empty category
  if (!stepRef.startsWith('@')) {
    return { category: '', name: stepRef }
  }

  // @framework-step:name
  const fwMatch = stepRef.match(/@framework-step:([\w-]+)/)
  if (fwMatch) {
    return { category: 'framework', name: fwMatch[1] }
  }

  // Legacy @step:category/step-name and @user-step:category/step-name
  const legacyMatch = stepRef.match(/@(?:step|user-step):([\w-]+)\/([\w-]+)/)
  if (legacyMatch) {
    return { category: legacyMatch[1], name: legacyMatch[2] }
  }

  return null
}

// Extract memory flow mapping from a process template
export function extractTemplateMemoryFlow(template: ProcessTemplate): MemoryFlowMapping {
  const topicSet = new Set<string>()
  const normalizeTopics = (topics: string[]) => topics.map(t => t.replace(/\.json$/, ''))

  const steps: MemoryFlowStep[] = template.steps.map(step => {
    const mfu = (step.stepDefinition as Record<string, unknown>)?.memoryFileUsage as
      | { readFrom?: unknown; writeTo?: unknown }
      | undefined
    const readFrom: string[] = Array.isArray(mfu?.readFrom) ? (mfu.readFrom as string[]) : []
    const writeTo: string[] = Array.isArray(mfu?.writeTo) ? (mfu.writeTo as string[]) : []
    const normalizedRead = normalizeTopics(readFrom)
    const normalizedWrite = normalizeTopics(writeTo)
    normalizedRead.forEach(t => topicSet.add(t))
    normalizedWrite.forEach(t => topicSet.add(t))
    return {
      stepNumber: step.number,
      stepName: step.name,
      readFrom: normalizedRead,
      writeTo: normalizedWrite,
    }
  })

  return {
    steps,
    allTopics: Array.from(topicSet).sort(),
  }
}
