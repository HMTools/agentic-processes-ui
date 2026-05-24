import { useState, useCallback, useEffect, useRef } from 'react'
import type { ProcessInstance } from '../../types'
import { TileHeader } from './TileHeader'
import { CondensedDiagram } from './CondensedDiagram'
import { needsAttention as checkNeedsAttention } from './ProcessTree'
import { toProcessSummary } from '../../services/processService'

export type LayoutPreset = '1' | '2v' | '2h' | '4'

interface TileSlot {
  processPath: string | null
  navigatedFromPath: string | null
}

interface TileManagerProps {
  getProcess: (path: string) => ProcessInstance | undefined
  onNavigateToProcess: (path: string) => void
  /** Paths requested to be opened in tiles */
  openRequests: { path: string; addNew: boolean }[]
  onRequestHandled: () => void
  onPopOut?: () => void
}

const DIVIDER_SIZE = 4

export function TileManager({
  getProcess,
  onNavigateToProcess,
  openRequests,
  onRequestHandled,
  onPopOut
}: TileManagerProps) {
  const [layout, setLayout] = useState<LayoutPreset>('1')
  const [tiles, setTiles] = useState<TileSlot[]>([{ processPath: null, navigatedFromPath: null }])
  const [activeTileIndex, setActiveTileIndex] = useState(0)

  // Resize state
  const [splitRatio, setSplitRatio] = useState(0.5)
  const [splitRatioSecondary, setSplitRatioSecondary] = useState(0.5)
  const [isResizing, setIsResizing] = useState<'primary' | 'secondary' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (openRequests.length === 0) return

    let currentTiles = [...tiles]
    let currentActiveTile = activeTileIndex
    let currentLayout = layout

    for (const req of openRequests) {
      if (req.addNew) {
        const existingIndex = currentTiles.findIndex(t => t.processPath === req.path)
        if (existingIndex >= 0) {
          currentActiveTile = existingIndex
          continue
        }
        const emptyIndex = currentTiles.findIndex(t => t.processPath === null)
        if (emptyIndex >= 0) {
          currentTiles[emptyIndex] = { processPath: req.path, navigatedFromPath: null }
          currentActiveTile = emptyIndex
        } else {
          currentTiles = [...currentTiles, { processPath: req.path, navigatedFromPath: null }]
          currentActiveTile = currentTiles.length - 1
          if (currentTiles.length === 2 && currentLayout === '1') currentLayout = '2v'
          else if (currentTiles.length > 2 && currentLayout !== '4') currentLayout = '4'
        }
      } else {
        currentTiles[currentActiveTile] = { processPath: req.path, navigatedFromPath: null }
      }
    }

    setTiles(currentTiles)
    setActiveTileIndex(currentActiveTile)
    setLayout(currentLayout)
    onRequestHandled()
  }, [openRequests])

  const handleClose = useCallback((index: number) => {
    if (tiles.length <= 1) {
      setTiles([{ processPath: null, navigatedFromPath: null }])
      setActiveTileIndex(0)
      return
    }
    const newTiles = tiles.filter((_, i) => i !== index)
    setTiles(newTiles)
    if (activeTileIndex >= newTiles.length) {
      setActiveTileIndex(newTiles.length - 1)
    }
    // Auto-shrink layout
    if (newTiles.length <= 1) setLayout('1')
    else if (newTiles.length <= 2 && layout === '4') setLayout('2v')
  }, [tiles, activeTileIndex, layout])

  const handleExpand = useCallback((path: string) => {
    onNavigateToProcess(path)
  }, [onNavigateToProcess])

  const handleTileNavigate = useCallback((tileIndex: number, path: string, addNew: boolean) => {
    if (addNew) {
      const existingIndex = tiles.findIndex(t => t.processPath === path)
      if (existingIndex >= 0) {
        setActiveTileIndex(existingIndex)
        return
      }
      const sourcePath = tiles[tileIndex]?.processPath || null
      const emptyIndex = tiles.findIndex(t => t.processPath === null)
      if (emptyIndex >= 0) {
        setTiles(prev => prev.map((t, i) => i === emptyIndex ? { processPath: path, navigatedFromPath: sourcePath } : t))
        setActiveTileIndex(emptyIndex)
      } else {
        const newTiles = [...tiles, { processPath: path, navigatedFromPath: sourcePath }]
        setTiles(newTiles)
        setActiveTileIndex(newTiles.length - 1)
        if (newTiles.length === 2 && layout === '1') setLayout('2v')
        else if (newTiles.length > 2 && layout !== '4') setLayout('4')
      }
    } else {
      const currentPath = tiles[tileIndex]?.processPath || null
      setTiles(prev => prev.map((t, i) =>
        i === tileIndex ? { processPath: path, navigatedFromPath: currentPath } : t
      ))
      setActiveTileIndex(tileIndex)
    }
  }, [tiles, layout])

  // Change layout preset
  const changeLayout = useCallback((preset: LayoutPreset) => {
    setLayout(preset)
    const neededTiles =
      preset === '1' ? 1 :
      preset === '2v' || preset === '2h' ? 2 : 4

    setTiles(prev => {
      if (prev.length >= neededTiles) return prev.slice(0, neededTiles)
      const extended = [...prev]
      while (extended.length < neededTiles) {
        extended.push({ processPath: null, navigatedFromPath: null })
      }
      return extended
    })
    if (activeTileIndex >= neededTiles) {
      setActiveTileIndex(neededTiles - 1)
    }
  }, [activeTileIndex])

  // Resize handlers
  const handleResizeStart = useCallback((type: 'primary' | 'secondary') => (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(type)
  }, [])

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()

    if (isResizing === 'primary') {
      if (layout === '2v' || layout === '4') {
        const ratio = (e.clientX - rect.left) / rect.width
        setSplitRatio(Math.min(0.8, Math.max(0.2, ratio)))
      } else if (layout === '2h') {
        const ratio = (e.clientY - rect.top) / rect.height
        setSplitRatio(Math.min(0.8, Math.max(0.2, ratio)))
      }
    } else if (isResizing === 'secondary' && layout === '4') {
      const ratio = (e.clientY - rect.top) / rect.height
      setSplitRatioSecondary(Math.min(0.8, Math.max(0.2, ratio)))
    }
  }, [isResizing, layout])

  const handleResizeEnd = useCallback(() => {
    setIsResizing(null)
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
      document.body.style.cursor = layout === '2h' ? 'ns-resize' : 'col-resize'
      document.body.style.userSelect = 'none'
    }
    return () => {
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, handleResizeMove, handleResizeEnd, layout])

  const renderTile = (index: number) => {
    const tile = tiles[index]
    if (!tile) return <EmptyTile key={index} />

    const process = tile.processPath ? getProcess(tile.processPath) : null

    if (!process || !tile.processPath) {
      return <EmptyTile key={index} onClick={() => setActiveTileIndex(index)} isActive={index === activeTileIndex} />
    }

    const summary = toProcessSummary(process, tile.processPath)
    const attention = checkNeedsAttention(summary, process)

    const tileNavigate = (path: string, addNew: boolean) => handleTileNavigate(index, path, addNew)

    return (
      <div
        key={tile.processPath || index}
        className={`flex flex-col flex-1 overflow-hidden ${index === activeTileIndex ? 'ring-1 ring-accent/30' : ''}`}
        onClick={() => setActiveTileIndex(index)}
      >
        <TileHeader
          process={process}
          processPath={tile.processPath!}
          needsAttention={attention}
          onClose={() => handleClose(index)}
          onExpand={() => handleExpand(tile.processPath!)}
        />
        <div className="flex-1 overflow-hidden">
          <CondensedDiagram
            process={process}
            processPath={tile.processPath}
            getProcess={getProcess}
            onNavigateToProcess={onNavigateToProcess}
            onTileNavigate={tileNavigate}
            navigatedFromPath={tile.navigatedFromPath}
          />
        </div>
      </div>
    )
  }

  const renderDivider = (type: 'primary' | 'secondary', direction: 'vertical' | 'horizontal') => (
    <div
      onMouseDown={handleResizeStart(type)}
      className={`
        flex-shrink-0 z-10
        ${direction === 'vertical'
          ? `w-[${DIVIDER_SIZE}px] cursor-col-resize hover:bg-accent/30`
          : `h-[${DIVIDER_SIZE}px] cursor-ns-resize hover:bg-accent/30`
        }
        ${isResizing === type ? 'bg-accent/50' : 'bg-border'}
        transition-colors
      `}
      style={direction === 'vertical' ? { width: DIVIDER_SIZE } : { height: DIVIDER_SIZE }}
    />
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Layout preset toolbar */}
      <div className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-surface border-b border-border">
        <span className="text-[10px] text-text-muted mr-2 uppercase tracking-wider">Layout</span>
        {([
          { id: '1' as LayoutPreset, label: '1', icon: '▣' },
          { id: '2v' as LayoutPreset, label: '2 Vertical', icon: '◫' },
          { id: '2h' as LayoutPreset, label: '2 Horizontal', icon: '⬒' },
          { id: '4' as LayoutPreset, label: '4 Grid', icon: '⊞' }
        ]).map(preset => (
          <button
            key={preset.id}
            onClick={() => changeLayout(preset.id)}
            className={`
              px-2 py-0.5 text-xs rounded transition-colors
              ${layout === preset.id
                ? 'bg-accent text-background'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
              }
            `}
            title={preset.label}
          >
            {preset.icon}
          </button>
        ))}
        {onPopOut && (
          <>
            <div className="flex-1" />
            <button
              onClick={onPopOut}
              className="px-2 py-0.5 text-xs rounded transition-colors text-text-secondary hover:text-text-primary hover:bg-surface-elevated flex items-center gap-1"
              title="Open in external window"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
              </svg>
              <span>Pop out</span>
            </button>
          </>
        )}
      </div>

      {/* Tile area */}
      <div ref={containerRef} className="flex-1 overflow-hidden relative">
        {layout === '1' && (
          <div className="h-full flex flex-col">
            {renderTile(0)}
          </div>
        )}

        {layout === '2v' && (
          <div className="h-full flex">
            <div style={{ width: `calc(${splitRatio * 100}% - ${DIVIDER_SIZE / 2}px)` }} className="flex flex-col overflow-hidden">
              {renderTile(0)}
            </div>
            {renderDivider('primary', 'vertical')}
            <div style={{ width: `calc(${(1 - splitRatio) * 100}% - ${DIVIDER_SIZE / 2}px)` }} className="flex flex-col overflow-hidden">
              {renderTile(1)}
            </div>
          </div>
        )}

        {layout === '2h' && (
          <div className="h-full flex flex-col">
            <div style={{ height: `calc(${splitRatio * 100}% - ${DIVIDER_SIZE / 2}px)` }} className="flex flex-col overflow-hidden">
              {renderTile(0)}
            </div>
            {renderDivider('primary', 'horizontal')}
            <div style={{ height: `calc(${(1 - splitRatio) * 100}% - ${DIVIDER_SIZE / 2}px)` }} className="flex flex-col overflow-hidden">
              {renderTile(1)}
            </div>
          </div>
        )}

        {layout === '4' && (
          <div className="h-full flex flex-col">
            <div style={{ height: `calc(${splitRatioSecondary * 100}% - ${DIVIDER_SIZE / 2}px)` }} className="flex overflow-hidden">
              <div style={{ width: `calc(${splitRatio * 100}% - ${DIVIDER_SIZE / 2}px)` }} className="flex flex-col overflow-hidden">
                {renderTile(0)}
              </div>
              {renderDivider('primary', 'vertical')}
              <div style={{ width: `calc(${(1 - splitRatio) * 100}% - ${DIVIDER_SIZE / 2}px)` }} className="flex flex-col overflow-hidden">
                {renderTile(1)}
              </div>
            </div>
            {renderDivider('secondary', 'horizontal')}
            <div style={{ height: `calc(${(1 - splitRatioSecondary) * 100}% - ${DIVIDER_SIZE / 2}px)` }} className="flex overflow-hidden">
              <div style={{ width: `calc(${splitRatio * 100}% - ${DIVIDER_SIZE / 2}px)` }} className="flex flex-col overflow-hidden">
                {renderTile(2)}
              </div>
              {renderDivider('primary', 'vertical')}
              <div style={{ width: `calc(${(1 - splitRatio) * 100}% - ${DIVIDER_SIZE / 2}px)` }} className="flex flex-col overflow-hidden">
                {renderTile(3)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyTile({ onClick, isActive }: { onClick?: () => void; isActive?: boolean }) {
  return (
    <div
      className={`
        flex-1 flex flex-col items-center justify-center
        bg-background text-text-muted
        ${isActive ? 'ring-1 ring-accent/30' : ''}
      `}
      onClick={onClick}
    >
      <svg className="w-8 h-8 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
      </svg>
      <p className="text-xs">Select a process from the tree</p>
      <p className="text-[10px] mt-1 opacity-50">Click to select, Ctrl+Click to open in new tile</p>
    </div>
  )
}
