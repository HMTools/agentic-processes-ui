import { useState, useRef, useCallback, useEffect } from 'react'
import type { ProcessInstance, ProcessMemory, ProcessLog, QASessionFile, FileChange } from '../../types'
import { MemoryView } from './MemoryView'
import { LogsView } from './LogsView'
import { FilesView } from './FilesView'
import { QASessionView } from '../QASession'

type TabId = 'memory' | 'logs' | 'files'

interface RightPanelProps {
  memory: ProcessMemory | null
  log: ProcessLog | null
  qaSession: QASessionFile | null
  memoryLoading?: boolean
  logLoading?: boolean
  processPath: string
  onQASessionUpdate: () => void
  filesChanged: FileChange[]
  process?: ProcessInstance
}

const MIN_WIDTH = 280
const MAX_WIDTH = 800
const DEFAULT_WIDTH = 384

export function RightPanel({ memory, log, qaSession, memoryLoading, logLoading, processPath, onQASessionUpdate, filesChanged, process }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('memory')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !panelRef.current) return
    
    const containerRect = panelRef.current.parentElement?.getBoundingClientRect()
    if (!containerRect) return

    // Calculate new width based on mouse position from the right edge
    const newWidth = containerRect.right - e.clientX
    
    // Clamp to min/max
    const clampedWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth))
    setWidth(clampedWidth)
  }, [isResizing])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  // Add/remove global mouse listeners for resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    {
      id: 'memory',
      label: 'Memory',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      )
    },
    {
      id: 'logs',
      label: 'Logs',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      id: 'files',
      label: 'Files',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    }
  ]

  // Show Q&A session when it exists (takes priority over pending interaction)
  const hasQASession = qaSession !== null

  return (
    <div
      ref={panelRef}
      className={`flex flex-col bg-background relative ${
        isCollapsed ? 'w-10' : ''
      }`}
      style={!isCollapsed ? { width: `${width}px` } : undefined}
    >
      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          onMouseDown={handleMouseDown}
          className={`absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-20 group
            ${isResizing ? 'bg-accent' : 'hover:bg-accent/50'}
          `}
        >
          {/* Visual indicator line */}
          <div className={`absolute left-0 top-0 bottom-0 w-px bg-border
            ${isResizing ? 'bg-accent' : 'group-hover:bg-accent/50'}
          `} />
        </div>
      )}

      {/* Left border (when not resizing) */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-border pointer-events-none" />

      {/* Q&A Session (appears above tabs when present) */}
      {hasQASession && !isCollapsed && (
        <div className="flex-shrink-0 border-b border-border" style={{ maxHeight: '40vh', minHeight: '200px' }}>
          <QASessionView
            processPath={processPath}
            session={qaSession}
            onSessionUpdate={onQASessionUpdate}
          />
        </div>
      )}

      {/* Tab Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-2 h-10 bg-surface border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-surface-elevated text-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded hover:bg-surface-elevated transition-colors text-text-muted hover:text-text-secondary ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
        >
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Tab Content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-hidden">
          {activeTab === 'memory' && (
            <MemoryView memory={memory} loading={memoryLoading} processPath={processPath} process={process} />
          )}
          {activeTab === 'logs' && (
            <LogsView log={log} loading={logLoading} />
          )}
          {activeTab === 'files' && (
            <FilesView processPath={processPath} filesChanged={filesChanged} />
          )}
        </div>
      )}

      {/* Collapsed state - show vertical tab icons */}
      {isCollapsed && (
        <div className="flex flex-col items-center gap-2 py-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setIsCollapsed(false)
              }}
              className={`p-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-surface-elevated text-text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50'
              }`}
              title={tab.label}
            >
              {tab.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
