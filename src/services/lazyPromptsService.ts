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
    const parsed = data as Record<string, unknown>
    if (!Array.isArray(parsed.options) || parsed.options.length === 0) return null

    if (parsed.type !== 'pending-interaction') {
      console.warn(`pending-interaction.json has non-canonical type "${parsed.type}" (expected "pending-interaction")`)
    }

    // Normalize options: map "value" → "id" when id is missing (agents sometimes use "value" instead)
    const options: InteractionOption[] = parsed.options.map((opt: Record<string, unknown>) => ({
      id: (opt.id ?? opt.value ?? opt.label) as string,
      label: opt.label as string,
      description: opt.description as string | undefined,
      isDefault: opt.isDefault as boolean | undefined
    }))

    return options
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
 * Generate a continue process prompt with context.
 * processPath is now absolute (under ~/.claude/agentic-processes/), so we pass it directly.
 */
export function generateContinueProcessPrompt(_process: ProcessInstance, processPath: string): string {
  return `/process-continue ${processPath}`
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
 * Send a prompt via MCP channel to a Claude Code session.
 * Finds the channel endpoint for the process's Claude Code session by PID.
 */
async function sendViaChannel(
  prompt: string,
  meta?: Record<string, string>
): Promise<{ success: boolean; message: string; noChannel?: boolean }> {
  try {
    const channels = await window.electronAPI.channelList()
    if (!channels || channels.length === 0) {
      return {
        success: false,
        message: 'No channel endpoints available. Make sure the channel server is installed and a Claude Code session is running.',
        noChannel: true,
      }
    }

    // For now, send to the first available channel.
    // TODO: Match by PID when external session discovery provides Claude Code PID
    const channel = channels[0]
    const result = await window.electronAPI.channelSendPrompt(channel.port, prompt, meta)

    if (!result.ok) {
      return {
        success: false,
        message: result.error || 'Failed to send prompt via channel',
      }
    }

    return {
      success: true,
      message: 'Prompt sent via channel!',
    }
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Unknown channel error',
    }
  }
}

/**
 * Execute a lazy prompt action
 */
export async function executeLazyPrompt(
  type: LazyPromptType,
  action: 'clipboard' | 'agent-apply',
  process: ProcessInstance,
  processPath: string,
  option?: InteractionOption,
  deliveryMode: 'pty' | 'channel' = 'pty'
): Promise<{ success: boolean; message: string; noSession?: boolean; noChannel?: boolean }> {
  const prompt = generateLazyPrompt(type, process, processPath, option)

  switch (action) {
    case 'clipboard':
      const success = await copyToClipboard(prompt)
      return {
        success,
        message: success ? 'Copied to clipboard!' : 'Failed to copy to clipboard'
      }
    case 'agent-apply':
      if (deliveryMode === 'channel') {
        return sendViaChannel(prompt, { processPath, promptType: type })
      }

      // PTY delivery (existing path)
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


