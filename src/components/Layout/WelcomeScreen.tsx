import logo from '../../assets/logo.png'

interface WelcomeScreenProps {
  onSelectProject: () => void
}

export function WelcomeScreen({ onSelectProject }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="flex items-center gap-16 px-12 max-w-6xl">
        {/* Left: Logo */}
        <div className="flex-1 flex justify-center">
          <div className="w-[450px] h-[450px] p-[2px] rounded-2xl bg-gradient-to-br from-accent/60 via-accent/20 to-transparent shadow-glow-cyan">
            <div className="w-full h-full rounded-2xl bg-surface overflow-hidden">
              <img 
                src={logo} 
                alt="Agentic Processes" 
                className="w-full h-full object-contain" 
              />
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div className="flex-1 text-left max-w-md">
          <p className="text-text-secondary mb-8">
            Visual process viewer for the Agentic Process System. 
            Select a project folder containing <code className="px-1.5 py-0.5 bg-surface rounded text-accent font-mono text-sm">.user-processes</code> to get started.
          </p>

          <button
            onClick={onSelectProject}
            className="
              inline-flex items-center gap-2 px-6 py-3 
              bg-accent hover:bg-accent-hover text-background 
              font-medium rounded-lg transition-colors
              shadow-lg shadow-accent/20
            "
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Select Project Folder
          </button>

          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-sm font-medium text-text-primary mb-4">How it works</h3>
            <div className="grid grid-cols-3 gap-4 text-left">
              <div className="p-3 rounded-lg bg-surface">
                <div className="w-8 h-8 rounded-lg bg-status-active/20 flex items-center justify-center mb-2">
                  <span className="text-status-active font-mono font-bold">1</span>
                </div>
                <p className="text-xs text-text-secondary">
                  Select a project with <code className="text-accent">.user-processes</code> folder
                </p>
              </div>
              <div className="p-3 rounded-lg bg-surface">
                <div className="w-8 h-8 rounded-lg bg-status-active/20 flex items-center justify-center mb-2">
                  <span className="text-status-active font-mono font-bold">2</span>
                </div>
                <p className="text-xs text-text-secondary">
                  View all processes and their current status
                </p>
              </div>
              <div className="p-3 rounded-lg bg-surface">
                <div className="w-8 h-8 rounded-lg bg-status-active/20 flex items-center justify-center mb-2">
                  <span className="text-status-active font-mono font-bold">3</span>
                </div>
                <p className="text-xs text-text-secondary">
                  Explore step diagrams with real-time updates
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
