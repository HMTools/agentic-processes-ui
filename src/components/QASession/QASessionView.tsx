import { useMemo } from 'react'
import type { QASessionFile } from '../../types'
import { QuestionCard } from './QuestionCard'
import { groupQuestionsByPriority, isSessionReadyToComplete } from '../../services/qaSessionService'

interface QASessionViewProps {
  processPath: string
  session: QASessionFile
  onSessionUpdate: () => void
}

export function QASessionView({ processPath, session, onSessionUpdate }: QASessionViewProps) {
  // Group questions by priority
  const { required, optional } = useMemo(
    () => groupQuestionsByPriority(session),
    [session]
  )

  // Calculate completion status
  const totalQuestions = session.questions.length
  const answeredQuestions = session.questions.filter(
    q => q.status === 'answered' || q.status === 'refined' || q.status === 'completed'
  ).length
  const completedQuestions = session.questions.filter(q => q.status === 'completed').length

  const readyToComplete = isSessionReadyToComplete(session)

  // Get session status color and label
  const getSessionStatusDisplay = () => {
    switch (session.status) {
      case 'pending':
        return {
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/30',
          label: 'Pending'
        }
      case 'partial':
        return {
          color: 'text-blue-400',
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/30',
          label: 'In Progress'
        }
      case 'completed':
        return {
          color: 'text-status-active',
          bg: 'bg-status-active/20',
          border: 'border-status-active/30',
          label: 'Completed'
        }
      default:
        return {
          color: 'text-text-muted',
          bg: 'bg-surface-elevated',
          border: 'border-border',
          label: 'Unknown'
        }
    }
  }

  const statusDisplay = getSessionStatusDisplay()

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-surface-elevated">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-accent/20">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-text-primary">Q&A Session</h2>
          <span
            className={`ml-auto px-2 py-1 text-xs font-medium rounded border ${statusDisplay.bg} ${statusDisplay.color} ${statusDisplay.border}`}
          >
            {statusDisplay.label}
          </span>
        </div>

        {/* Step Info */}
        <div className="text-xs text-text-muted">
          Step: {session.stepName}
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-text-muted mb-1">
            <span>Progress</span>
            <span>
              {answeredQuestions}/{totalQuestions} answered
              {completedQuestions > 0 && ` (${completedQuestions} finalized)`}
            </span>
          </div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Ready to Complete Badge */}
        {readyToComplete && session.status !== 'completed' && (
          <div className="mt-3 px-3 py-2 bg-status-active/10 border border-status-active/20 rounded flex items-center gap-2">
            <svg className="w-4 h-4 text-status-active flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs text-status-active">
              All required questions answered. The agent can now continue.
            </span>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Required Questions Section */}
        {required.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                Required Questions
              </h3>
              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-red-500/20 text-red-400">
                {required.length}
              </span>
            </div>
            <div className="space-y-3">
              {required.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  processPath={processPath}
                  onAnswerUpdate={onSessionUpdate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Optional Questions Section */}
        {optional.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                Optional Questions
              </h3>
              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-surface-elevated text-text-muted">
                {optional.length}
              </span>
            </div>
            <div className="space-y-3">
              {optional.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  processPath={processPath}
                  onAnswerUpdate={onSessionUpdate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalQuestions === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-surface-elevated mb-4">
              <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-text-primary mb-1">No Questions</h3>
            <p className="text-xs text-text-muted max-w-xs">
              This Q&A session has no questions. This might be an error.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
