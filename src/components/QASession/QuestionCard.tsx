import { useState } from 'react'
import type { QASessionQuestion } from '../../types'
import { answerQuestion, completeQuestion, getCurrentAnswer, formatTimestamp } from '../../services/qaSessionService'

interface QuestionCardProps {
  question: QASessionQuestion
  processPath: string
  onAnswerUpdate: () => void
}

export function QuestionCard({ question, processPath, onAnswerUpdate }: QuestionCardProps) {
  const [answerText, setAnswerText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)

  const currentAnswer = getCurrentAnswer(question)
  const hasAnswer = currentAnswer !== null
  const iterationCount = question.answerHistory.length

  // Handle answer submission
  const handleSubmit = async () => {
    if (!answerText.trim()) {
      setError('Please enter an answer')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await answerQuestion(processPath, question.id, answerText.trim())

    if (result.success) {
      setAnswerText('')
      onAnswerUpdate()
    } else {
      setError(result.error || 'Failed to submit answer')
    }

    setIsSubmitting(false)
  }

  // Handle marking question as complete
  const handleComplete = async () => {
    setIsCompleting(true)
    setError(null)

    const result = await completeQuestion(processPath, question.id)

    if (result.success) {
      onAnswerUpdate()
    } else {
      setError(result.error || 'Failed to mark as complete')
    }

    setIsCompleting(false)
  }

  // Handle option selection (for multiple choice questions)
  const handleOptionSelect = (option: string) => {
    setAnswerText(option)
  }

  // Get status color and label
  const getStatusDisplay = () => {
    switch (question.status) {
      case 'unanswered':
        return { color: 'text-text-muted', bg: 'bg-surface-elevated', label: 'Unanswered' }
      case 'answered':
        return { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Answered' }
      case 'refined':
        return { color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Refined' }
      case 'completed':
        return { color: 'text-status-active', bg: 'bg-status-active/20', label: 'Completed' }
      default:
        return { color: 'text-text-muted', bg: 'bg-surface-elevated', label: 'Unknown' }
    }
  }

  const statusDisplay = getStatusDisplay()
  const isCompleted = question.status === 'completed'

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Question Header */}
      <div className="px-4 py-3 border-b border-border bg-surface-elevated">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                {question.topic}
              </span>
              {question.priority === 'required' && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-red-500/20 text-red-400">
                  Required
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-text-primary">
              {question.question}
            </h3>
            {question.context && (
              <p className="text-xs text-text-muted mt-1">
                {question.context}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <span className={`px-2 py-1 text-xs font-medium rounded ${statusDisplay.bg} ${statusDisplay.color} whitespace-nowrap`}>
            {statusDisplay.label}
          </span>
        </div>
      </div>

      {/* Current Answer Display */}
      {hasAnswer && (
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Current Answer {iterationCount > 1 && `(Iteration ${iterationCount})`}
            </span>
            {currentAnswer && (
              <span className="text-xs text-text-muted">
                {formatTimestamp(currentAnswer.timestamp)}
              </span>
            )}
          </div>
          <div className="px-3 py-2 bg-background rounded text-sm text-text-primary whitespace-pre-wrap">
            {currentAnswer?.answer}
          </div>
        </div>
      )}

      {/* Answer Input (only if not completed) */}
      {!isCompleted && (
        <div className="px-4 py-3">
          {/* Multiple Choice Options */}
          {question.options && question.options.length > 0 && (
            <div className="mb-3">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-2">
                Select an option:
              </span>
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    className={`w-full px-3 py-2 text-left rounded border transition-colors ${
                      answerText === option
                        ? 'border-accent bg-accent/10 text-text-primary'
                        : 'border-border bg-surface hover:bg-surface-elevated text-text-secondary'
                    }`}
                  >
                    <span className="text-sm">{option}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Text Input */}
          {(!question.options || question.options.length === 0) && (
            <div className="mb-3">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-2">
                {hasAnswer ? 'Refine your answer:' : 'Your answer:'}
              </label>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !answerText.trim()}
              className="flex-1 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : hasAnswer ? (
                'Refine Answer'
              ) : (
                'Submit Answer'
              )}
            </button>

            {hasAnswer && (
              <button
                onClick={handleComplete}
                disabled={isCompleting}
                className="px-4 py-2 bg-status-active/20 hover:bg-status-active/30 text-status-active text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCompleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Completing...
                  </span>
                ) : (
                  'Mark Complete'
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Answer History (show if multiple iterations) */}
      {iterationCount > 1 && (
        <div className="px-4 py-3 border-t border-border bg-surface-elevated">
          <details className="group">
            <summary className="cursor-pointer text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-2 hover:text-text-primary transition-colors">
              <svg
                className="w-3 h-3 transition-transform group-open:rotate-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Answer History ({iterationCount} iterations)
            </summary>
            <div className="mt-3 space-y-2">
              {question.answerHistory.map((iteration, index) => (
                <div key={index} className="px-3 py-2 bg-background rounded border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-text-muted">
                      Iteration {iteration.iteration}
                    </span>
                    <span className="text-xs text-text-muted">
                      {formatTimestamp(iteration.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-text-primary whitespace-pre-wrap">
                    {iteration.answer}
                  </p>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}
