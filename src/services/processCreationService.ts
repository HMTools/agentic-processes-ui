import type { ProcessTemplate, AgentSettings } from '../types'
import * as agentService from './agentService'

/**
 * Generate a /process-new prompt with template and parameter values
 * formatted for the agent to process.
 */
export function generateNewProcessPrompt(
  template: ProcessTemplate,
  params: Record<string, string>
): string {
  const lines: string[] = ['/process-new', '']
  lines.push(`Template: ${template.name}`)

  const filledParams = Object.entries(params).filter(([, value]) => value.trim() !== '')
  if (filledParams.length > 0) {
    lines.push('Parameters:')
    for (const [key, value] of filledParams) {
      lines.push(`- ${key}: ${value}`)
    }
  }

  return lines.join('\n')
}

/**
 * Validate that all required parameters have non-empty values.
 */
export function validateParameters(
  template: ProcessTemplate,
  params: Record<string, string>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const paramName of template.parameters.required) {
    const value = params[paramName]
    if (!value || value.trim() === '') {
      const def = template.parameters.definitions[paramName]
      const label = def?.description || paramName
      errors.push(`Required parameter "${paramName}" is missing (${label})`)
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Build the initial parameter values from a template's defaults.
 */
export function getDefaultParameterValues(template: ProcessTemplate): Record<string, string> {
  const values: Record<string, string> = {}

  // Initialize all parameters (required + optional) with empty strings
  for (const paramName of [...template.parameters.required, ...template.parameters.optional]) {
    values[paramName] = ''
  }

  // Apply defaults from template
  if (template.parameters.defaults) {
    for (const [key, value] of Object.entries(template.parameters.defaults)) {
      values[key] = value
    }
  }

  // Apply defaults from individual parameter definitions
  for (const [key, def] of Object.entries(template.parameters.definitions)) {
    if (def.default && !values[key]) {
      values[key] = def.default
    }
  }

  return values
}

/**
 * Create a new process via an agent session.
 * Always creates a NEW agent session (sessions are per-process-instance).
 */
export async function createProcessViaAgent(
  template: ProcessTemplate,
  params: Record<string, string>,
  projectPath: string,
  settings: AgentSettings
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  // Validate parameters first
  const validation = validateParameters(template, params)
  if (!validation.valid) {
    return { success: false, error: validation.errors.join('; ') }
  }

  // Generate the prompt
  const prompt = generateNewProcessPrompt(template, params)

  // Always create a new agent session (never reuse — sessions are 1:1 with process instances)
  const createResult = await agentService.createAgentSession(
    settings.defaultAgentType,
    projectPath
    // No processPath yet — the process doesn't exist until the agent creates it
  )

  if (!createResult.success || !createResult.session) {
    return {
      success: false,
      error: createResult.error || 'Failed to create agent session'
    }
  }

  const sessionId = createResult.session.id

  // Send the /process-new prompt to the new session
  const sendResult = await agentService.sendPrompt(sessionId, prompt)

  if (!sendResult.success) {
    return {
      success: false,
      sessionId,
      error: sendResult.error || 'Failed to send prompt to agent'
    }
  }

  return { success: true, sessionId }
}
