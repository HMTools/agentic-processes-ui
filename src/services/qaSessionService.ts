import type { QASessionFile, QASessionQuestion, SessionStatus, AnswerIteration } from '../types'

/**
 * Read the Q&A session file for a process via IPC
 * @param processPath - Absolute path to the process.json file
 * @returns QASessionFile or null if not found
 */
export async function readQASession(processPath: string): Promise<QASessionFile | null> {
  try {
    const session = await window.electronAPI.readQASession(processPath)
    return session as QASessionFile | null
  } catch (error) {
    console.error('Error reading Q&A session:', error)
    return null
  }
}

/**
 * Submit an answer to a question via IPC
 * @param processPath - Absolute path to the process.json file
 * @param questionId - ID of the question to answer
 * @param answer - The answer text
 * @returns Success status
 */
export async function answerQuestion(
  processPath: string,
  questionId: string,
  answer: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await window.electronAPI.answerQuestion(processPath, questionId, answer)
    return result
  } catch (error) {
    console.error('Error answering question:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Mark a question as complete via IPC
 * @param processPath - Absolute path to the process.json file
 * @param questionId - ID of the question to mark complete
 * @returns Success status
 */
export async function completeQuestion(
  processPath: string,
  questionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await window.electronAPI.completeQuestion(processPath, questionId)
    return result
  } catch (error) {
    console.error('Error completing question:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get the most recent answer from a question's answer history
 * @param question - The question with answer history
 * @returns The most recent answer iteration or null if no answers
 */
export function getCurrentAnswer(question: QASessionQuestion): AnswerIteration | null {
  if (question.answerHistory.length === 0) {
    return null
  }

  // Answer history is sorted by timestamp, so the last one is most recent
  return question.answerHistory[question.answerHistory.length - 1]
}

/**
 * Check if a Q&A session is ready to complete
 * A session is ready when all required questions are answered/completed
 * @param session - The Q&A session file
 * @returns True if all required questions are answered
 */
export function isSessionReadyToComplete(session: QASessionFile): boolean {
  const requiredQuestions = session.questions.filter(q => q.priority === 'required')

  if (requiredQuestions.length === 0) {
    return true
  }

  return requiredQuestions.every(q =>
    q.status === 'answered' || q.status === 'refined' || q.status === 'completed'
  )
}

/**
 * Group questions by priority for display
 * @param session - The Q&A session file
 * @returns Object with required and optional question arrays
 */
export function groupQuestionsByPriority(session: QASessionFile): {
  required: QASessionQuestion[]
  optional: QASessionQuestion[]
} {
  return {
    required: session.questions.filter(q => q.priority === 'required'),
    optional: session.questions.filter(q => q.priority === 'optional')
  }
}

/**
 * Format an ISO timestamp for display
 * @param isoTimestamp - ISO-8601 timestamp string
 * @returns Formatted timestamp string
 */
export function formatTimestamp(isoTimestamp: string): string {
  const date = new Date(isoTimestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
