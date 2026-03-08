import type { ProcessInstance, LazyPromptType, LazyPromptConfig, InteractionOption, PendingInteractionFile } from '../types'
import * as agentService from './agentService'

// Available lazy prompt configurations
export const LAZY_PROMPT_CONFIGS: Record<LazyPromptType, LazyPromptConfig> = {
  'select-option': {
    type: 'select-option',
    label: 'Select Option',
    description: 'Choose from available options for the current step',
    availableActions: [
      { type: 'clipboard', label: 'Copy to Clipboard' },
      { type: 'agent-apply', label: 'Send to Agent' }
    ]
  },
  'continue-process': {
    type: 'continue-process',
    label: 'Continue Process',
    description: 'Generate a prompt to continue working on this process',
    availableActions: [
      { type: 'clipboard', label: 'Copy to Clipboard' },
      { type: 'agent-apply', label: 'Send to Agent' }
    ]
  },
  'new-process': {
    type: 'new-process',
    label: 'New Process',
    description: 'Create a new process from a template via the agent',
    availableActions: [
      { type: 'clipboard', label: 'Copy to Clipboard' },
      { type: 'agent-apply', label: 'Send to Agent' }
    ]
  }
}

/**
 * Get the interaction options by reading pending-interaction.json from the process folder.
 * Returns null if the file does not exist or cannot be parsed.
 * The processPath parameter must be the absolute path to the process folder.
 */
export async function getInteractionOptions(processPath: string): Promise<InteractionOption[] | null> {
  try {
    const data = await window.electronAPI.readProcessFile(processPath, 'pending-interaction.json')
    if (!data) return null
    const parsed = data as PendingInteractionFile
    if (parsed.type !== 'pending-interaction' || !Array.isArray(parsed.options)) return null
    return parsed.options
  } catch {
    return null
  }
}

/**
 * Get the active step of a process
 */
export function getActiveStep(process: ProcessInstance) {
  return process.steps.find(s => s.id === process.currentState.activeStepId)
}

/**
 * Generate a prompt for selecting an option
 */
export function generateSelectOptionPrompt(option: InteractionOption): string {
  return option.label
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
  processPath: string,
  option?: InteractionOption
): string {
  switch (type) {
    case 'continue-process':
      return generateContinueProcessPrompt(process, processPath)
    case 'select-option':
      if (option) {
        return generateSelectOptionPrompt(option)
      }
      // Return placeholder if no option specified
      return 'Select an option...'
    case 'new-process':
      return '/process-new'
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
 * Check if there's an active agent session for a process
 */
export async function hasActiveAgentSession(processPath: string): Promise<boolean> {
  return agentService.hasActiveSession(processPath)
}

/**
 * Execute a lazy prompt action
 */
export async function executeLazyPrompt(
  type: LazyPromptType,
  action: 'clipboard' | 'agent-apply',
  process: ProcessInstance,
  processPath: string,
  option?: InteractionOption
): Promise<{ success: boolean; message: string; noSession?: boolean }> {
  const prompt = generateLazyPrompt(type, process, processPath, option)

  switch (action) {
    case 'clipboard':
      const success = await copyToClipboard(prompt)
      return {
        success,
        message: success ? 'Copied to clipboard!' : 'Failed to copy to clipboard'
      }
    case 'agent-apply':
      // Send prompt to active agent session
      const result = await agentService.sendLazyPromptToProcess(processPath, prompt)
      
      if (result.noSession) {
        return {
          success: false,
          message: 'No active agent session. Start an agent session first.',
          noSession: true
        }
      }
      
      if (!result.success) {
        return {
          success: false,
          message: result.error || 'Failed to send prompt to agent'
        }
      }
      
      return {
        success: true,
        message: 'Prompt sent to agent!'
      }
    default:
      return {
        success: false,
        message: `Unknown action: ${action}`
      }
  }
}


