# Agentic Processes UI

A visual Electron-based UI for the [Agentic Process System](../agentic-processes/README.md). View and monitor your running processes with interactive diagrams.

## Features

- **Process Dashboard**: View all active, completed, and failed processes
- **Interactive Diagrams**: Visualize process steps using React Flow
- **Real-time Updates**: Automatic refresh when process.json files change
- **Step Details**: Click on diagram nodes to see step information
- **Dark Theme**: Modern IDE-like dark interface

## Screenshots

The app displays processes in a clean dashboard with status cards. Clicking a process opens an interactive diagram view showing all steps with their current status.

## Installation

Download the latest release for your platform from
[GitHub Releases](https://github.com/matan-h/agentic-processes-ui/releases/latest).

| Platform | Download | Notes |
|----------|----------|-------|
| **Windows** | `.exe` installer | Run the installer and follow the prompts |
| **macOS** | `.dmg` disk image | Open the DMG and drag the app to Applications |
| **Linux** | `.AppImage` | Make executable with `chmod +x` and run |

### macOS Gatekeeper Notice

Since the macOS build is not notarized, you may see a "cannot be opened" warning on first launch.
To open the app:
1. Right-click (or Control-click) the app icon
2. Select **Open** from the context menu
3. Click **Open** in the dialog that appears

This only needs to be done once. Subsequent launches work normally.

### Automatic Updates

The app checks for updates on launch and will notify you when a new version is available.
Updates are downloaded in the background and installed when you restart the app.

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
cd agentic-processes-ui
npm install
```

### Development

```bash
npm run dev
```

This will start the Vite dev server with Electron and open the application.

### Build

```bash
npm run electron:build
```

This creates a distributable package in the `release/` folder.

## Usage

1. **Select Project**: Click the folder icon to add a project working directory
2. **View Processes**: The dashboard shows all processes found in `~/.claude/agentic-processes/active/`, `completed/`, and `failed/` folders
3. **Filter**: Use the tabs to filter by status (All, Active, Completed, Failed)
4. **View Diagram**: Click on a process card to see the interactive step diagram
5. **Step Details**: Click on a step node in the diagram to see detailed information

## Data Source

The UI reads exclusively from `process.json` files located in:

```
~/.claude/agentic-processes/
├── active/
│   └── process-{name}-{date}-{shortid}/
│       └── process.json        <- Primary data source
├── completed/
│   └── process-{name}-{date}-{shortid}/
│       └── process.json
└── failed/
    └── process-{name}-{date}-{shortid}/
        └── process.json
```

### process.json Structure

```typescript
interface ProcessInstance {
  type: 'process-instance'
  id: string                    // "process-user-auth-20260120"
  name: string                  // "User Authentication"
  metadata: ProcessMetadata     // template, timestamps, paths
  status: ProcessStatus         // running | completed | failed | paused
  parameters: Record<string, string>
  currentState: {
    activeStep: {
      id: StepId
      name: string
      actionSummary: string
      actionDetails?: string
      totalSubsteps: number
      currentSubstep?: {
        number: number
        name: string
      }
    }
  }
  steps: ProcessStep[]          // All steps with status
}
```

## Tech Stack

- **Electron** - Desktop app framework
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Flow** - Diagram visualization
- **Tailwind CSS v4** - Styling
- **Chokidar** - File watching

## Project Structure

```
agentic-processes-ui/
├── electron/
│   ├── main.ts              # Electron main process
│   ├── preload.ts           # IPC bridge
│   └── fileWatcher.ts       # File system watcher
├── src/
│   ├── components/
│   │   ├── Dashboard/       # Process list
│   │   ├── DiagramView/     # React Flow diagram
│   │   └── Layout/          # App layout
│   ├── hooks/
│   │   └── useProcesses.ts  # Process data management
│   ├── services/
│   │   └── processService.ts
│   └── types/
│       └── index.ts         # TypeScript types
└── package.json
```

## License

MIT
