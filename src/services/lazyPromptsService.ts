import type { ProcessInstance, LazyPromptType, LazyPromptConfig } from '../types'

// Available lazy prompt configurations
export const LAZY_PROMPT_CONFIGS: Record<LazyPromptType, LazyPromptConfig> = {
  'continue-process': {
    type: 'continue-process',
    label: 'Continue Process',
    description: 'Generate a prompt to continue working on this process',
    availableActions: [
      { type: 'clipboard', label: 'Copy to Clipboard' },
      // Future: { type: 'agent-apply', label: 'Apply with Agent' }
    ]
  }
}

/**
 * Generate a continue process prompt with context
 */
export function generateContinueProcessPrompt(process: ProcessInstance, processPath: string): string {
  // Make path relative to project
  const projectPath = process.metadata.projectPath
  let relativePath = processPath
  
  if (projectPath && processPath.startsWith(projectPath)) {
    relativePath = processPath.slice(projectPath.length)
    // Remove leading slash/backslash
    if (relativePath.startsWith('/') || relativePath.startsWith('\\')) {
      relativePath = relativePath.slice(1)
    }
  }
  
  return `/process-continue ${relativePath}`
}

/**
 * Generate a lazy prompt based on type
 */
export function generateLazyPrompt(
  type: LazyPromptType, 
  process: ProcessInstance, 
  processPath: string
): string {
  switch (type) {
    case 'continue-process':
      return generateContinueProcessPrompt(process, processPath)
    default:
      throw new Error(`Unknown lazy prompt type: ${type}`)
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Execute a lazy prompt action
 */
export async function executeLazyPrompt(
  type: LazyPromptType,
  action: 'clipboard' | 'agent-apply',
  process: ProcessInstance,
  processPath: string
): Promise<{ success: boolean; message: string }> {
  const prompt = generateLazyPrompt(type, process, processPath)

  switch (action) {
    case 'clipboard':
      const success = await copyToClipboard(prompt)
      return {
        success,
        message: success ? 'Prompt copied to clipboard!' : 'Failed to copy to clipboard'
      }
    case 'agent-apply':
      // Future implementation
      return {
        success: false,
        message: 'Agent apply is not yet implemented'
      }
    default:
      return {
        success: false,
        message: `Unknown action: ${action}`
      }
  }
}


