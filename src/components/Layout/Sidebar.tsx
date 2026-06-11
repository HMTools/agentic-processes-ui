interface SidebarProps {
  processCount: number
  activeCount: number
  runningSessionCount?: number
  currentView: 'dashboard' | 'settings' | 'templates' | 'agent-sessions' | 'processes-overview'
  onNavigateToSettings: () => void
  onNavigateToDashboard: () => void
  onNavigateToTemplates: () => void
  onNavigateToAgentSessions: () => void
  onNavigateToProcessesOverview: () => void
  attentionCount?: number
}

export function Sidebar({
  processCount,
  activeCount,
  runningSessionCount = 0,
  currentView,
  onNavigateToSettings,
  onNavigateToDashboard,
  onNavigateToTemplates,
  onNavigateToAgentSessions,
  onNavigateToProcessesOverview,
  attentionCount = 0
}: SidebarProps) {

  return (
    <div className="w-16 bg-surface border-r border-border flex flex-col items-center py-4">
      {/* Logo */}
      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-6">
        <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col items-center gap-2">
        <NavButton 
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          }
          label="Dashboard"
          active={currentView === 'dashboard'}
          onClick={onNavigateToDashboard}
          badge={activeCount > 0 ? activeCount : undefined}
        />
        <NavButton
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          }
          label="Processes Overview"
          active={currentView === 'processes-overview'}
          onClick={onNavigateToProcessesOverview}
          badge={attentionCount > 0 ? attentionCount : undefined}
        />
        <NavButton
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          }
          label="Templates"
          active={currentView === 'templates'}
          onClick={onNavigateToTemplates}
        />
        <NavButton 
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          label="Agent Sessions"
          active={currentView === 'agent-sessions'}
          onClick={onNavigateToAgentSessions}
          badge={runningSessionCount > 0 ? runningSessionCount : undefined}
        />
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-2">
        {/* Settings button */}
        <NavButton
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          label="Settings"
          active={currentView === 'settings'}
          onClick={onNavigateToSettings}
        />
      </div>
    </div>
  )
}

interface NavButtonProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  badge?: number
  onClick?: () => void
}

function NavButton({ icon, label, active, badge, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative p-2 rounded-lg transition-colors
        ${active 
          ? 'bg-accent/20 text-accent' 
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
        }
      `}
      title={label}
    >
      {icon}
      {badge !== undefined && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-medium rounded-full bg-accent text-background flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  )
}

