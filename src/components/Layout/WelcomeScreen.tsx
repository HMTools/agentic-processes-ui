import logo from '../../assets/logo.png'

interface WelcomeScreenProps {
  /** Path to the framework folder (contains .processes/) */
  frameworkPath: string | null
  /** Paths to project folders (contain .user-processes/) */
  projectPaths: string[]
  /** Add a folder - auto-detects if it's a framework or project folder */
  onAddFolder: (path: string) => Promise<void>
  /** Opens folder picker dialog and returns selected path */
  onSelectFolder: () => Promise<string | null>
}

/** Extract folder name from full path */
function getFolderName(path: string): string {
  const parts = path.replace(/\\/g, '/').split('/')
  return parts[parts.length - 1] || path
}

export function WelcomeScreen({ frameworkPath, projectPaths, onAddFolder, onSelectFolder }: WelcomeScreenProps) {
  const hasFramework = Boolean(frameworkPath)
  const hasProjects = projectPaths.length > 0
  const isSetupComplete = hasFramework && hasProjects
  
  // Determine what step user is on
  const setupStep = !hasFramework && !hasProjects ? 1 : hasFramework && !hasProjects ? 2 : 2

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
          <p className="text-text-secondary mb-4">
            Visual process viewer for the Agentic Process System.
          </p>

          {/* Workspace Setup Progress */}
          <div className="mb-6 p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-text-primary">Workspace Setup</h4>
              {(hasFramework || hasProjects) && (
                <span className="text-xs text-text-muted">
                  Step {setupStep} of 2
                </span>
              )}
            </div>

            {/* Setup checklist */}
            <div className="space-y-3">
              {/* Framework folder item */}
              <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                hasFramework ? 'bg-status-active/10 border border-status-active/20' : 'bg-background/50'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  hasFramework 
                    ? 'bg-status-active text-background' 
                    : 'border-2 border-text-muted'
                }`}>
                  {hasFramework && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${hasFramework ? 'text-text-primary' : 'text-text-secondary'}`}>
                      Framework folder
                    </span>
                    <code className="px-1 py-0.5 bg-background rounded text-accent font-mono text-[10px]">.processes/</code>
                  </div>
                  {hasFramework ? (
                    <p className="text-xs text-text-muted mt-1 truncate" title={frameworkPath!}>
                      {getFolderName(frameworkPath!)}
                    </p>
                  ) : (
                    <p className="text-xs text-text-muted mt-1">
                      Contains templates and step definitions
                    </p>
                  )}
                </div>
              </div>

              {/* Project folder item */}
              <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                hasProjects ? 'bg-status-active/10 border border-status-active/20' : 'bg-background/50'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  hasProjects 
                    ? 'bg-status-active text-background' 
                    : 'border-2 border-text-muted'
                }`}>
                  {hasProjects && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${hasProjects ? 'text-text-primary' : 'text-text-secondary'}`}>
                      Project folder
                    </span>
                    <code className="px-1 py-0.5 bg-background rounded text-accent font-mono text-[10px]">.user-processes/</code>
                  </div>
                  {hasProjects ? (
                    <p className="text-xs text-text-muted mt-1 truncate" title={projectPaths[0]}>
                      {getFolderName(projectPaths[0])}
                      {projectPaths.length > 1 && ` +${projectPaths.length - 1} more`}
                    </p>
                  ) : (
                    <p className="text-xs text-text-muted mt-1">
                      Contains your processes
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Next step guidance */}
            {!isSetupComplete && (
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs text-accent font-medium mb-2">
                  {!hasFramework && !hasProjects 
                    ? 'Add a folder to get started'
                    : hasFramework && !hasProjects 
                    ? 'Now add a project folder to view processes'
                    : 'Add a framework folder for templates (optional)'}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={async () => {
              const path = await onSelectFolder()
              if (path) {
                await onAddFolder(path)
              }
            }}
            className="
              inline-flex items-center gap-2 px-6 py-3 
              bg-accent hover:bg-accent-hover text-background 
              font-medium rounded-lg transition-colors
              shadow-lg shadow-accent/20
            "
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {!hasFramework && !hasProjects 
              ? 'Add Folder' 
              : hasFramework && !hasProjects 
              ? 'Add Project Folder'
              : 'Add Another Folder'}
          </button>

          {(hasFramework || hasProjects) && (
            <p className="text-xs text-text-muted mt-3">
              You can manage folders later in Settings
            </p>
          )}

          {/* How it works - only show when nothing configured yet */}
          {!hasFramework && !hasProjects && (
            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="text-sm font-medium text-text-primary mb-4">How it works</h3>
              <div className="grid grid-cols-3 gap-4 text-left">
                <div className="p-3 rounded-lg bg-surface">
                  <div className="w-8 h-8 rounded-lg bg-status-active/20 flex items-center justify-center mb-2">
                    <span className="text-status-active font-mono font-bold">1</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Add your framework and project folders
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-surface">
                  <div className="w-8 h-8 rounded-lg bg-status-active/20 flex items-center justify-center mb-2">
                    <span className="text-status-active font-mono font-bold">2</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    View all processes across all projects
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
          )}
        </div>
      </div>
    </div>
  )
}
