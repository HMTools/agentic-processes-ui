import { useMemo, useCallback, useEffect, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  type NodeTypes,
  BackgroundVariant
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { StepNode } from './StepNode'
import { SubProcessNode } from './SubProcessNode'
import { ParentProcessNode } from './ParentProcessNode'
import type { ProcessInstance, ProcessStep, ChildProcessRef, ParentProcessRef } from '../../types'

interface ProcessDiagramProps {
  process: ProcessInstance
  onStepClick?: (step: ProcessStep) => void
  onSubProcessClick?: (subProcess: ChildProcessRef, ctrlKey: boolean) => void
  onParentClick?: (parent: ParentProcessRef, ctrlKey: boolean) => void
  focusNodeId?: string | null
  // For lazy prompts on subprocesses
  getSubProcess?: (relativePath: string) => { process: ProcessInstance; absolutePath: string } | undefined
}

const nodeTypes: NodeTypes = {
  step: StepNode,
  subprocess: SubProcessNode,
  parent: ParentProcessNode
}

// Generate nodes and edges from process steps and sub-processes
function generateDiagram(
  process: ProcessInstance,
  onSubProcessNavigate?: (subProcess: ChildProcessRef, ctrlKey: boolean) => void,
  onParentNavigate?: (parent: ParentProcessRef, ctrlKey: boolean) => void,
  highlightedNodeId?: string | null,
  getSubProcess?: (relativePath: string) => { process: ProcessInstance; absolutePath: string } | undefined
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []
  
  const nodeWidth = 240
  const nodeHeight = 100
  const verticalGap = 120
  const parentNodeHeight = 120
  const subProcessXOffset = 350 // Horizontal offset for sub-processes
  const subProcessVerticalGap = 140 // Vertical gap between stacked sub-processes

  // Check if this process has a parent
  const hasParent = process.subProcessState?.parentProcess !== null && process.subProcessState?.parentProcess !== undefined
  const startY = hasParent ? parentNodeHeight + verticalGap : 50

  // Add parent process node if this is a sub-process
  if (hasParent && process.subProcessState?.parentProcess) {
    const parent = process.subProcessState.parentProcess
    nodes.push({
      id: 'parent-process',
      type: 'parent',
      position: {
        x: 100,
        y: 50
      },
      data: {
        id: parent.id,
        name: parent.name,
        processPath: parent.processPath,
        returnToStep: parent.returnToStep,
        onNavigate: onParentNavigate ? (ctrlKey: boolean) => onParentNavigate(parent, ctrlKey) : undefined,
        isHighlighted: highlightedNodeId === 'parent-process'
      }
    })

    // Create edge from parent to first step
    edges.push({
      id: 'edge-parent-to-step1',
      source: 'parent-process',
      target: 'step-1',
      animated: false,
      style: {
        stroke: '#f59e0b', // amber-500
        strokeWidth: 2,
        strokeDasharray: '8,4'
      }
    })
  }

  // Group sub-processes by the step that spawned them (using StepId or step number)
  const subProcessesByStepId: Record<string, ChildProcessRef[]> = {}
  const subProcessesByStepNumber: Record<number, ChildProcessRef[]> = {}
  
  if (process.subProcessState?.childProcesses) {
    for (const child of process.subProcessState.childProcesses) {
      const spawnedAt = child.spawnedAtStep as any
      // Handle both string (StepId) and number formats
      if (typeof spawnedAt === 'string') {
        if (!subProcessesByStepId[spawnedAt]) {
          subProcessesByStepId[spawnedAt] = []
        }
        subProcessesByStepId[spawnedAt].push(child)
      } else if (typeof spawnedAt === 'number') {
        if (!subProcessesByStepNumber[spawnedAt]) {
          subProcessesByStepNumber[spawnedAt] = []
        }
        subProcessesByStepNumber[spawnedAt].push(child)
      }
    }
  }

  process.steps.forEach((step, index) => {
    // Handle both new format (activeStepId) and old format (activeStepNumber)
    const currentState = process.currentState as any
    const isActive = currentState.activeStepId 
      ? step.id === currentState.activeStepId
      : step.number === currentState.activeStepNumber
    const stepY = startY + index * (nodeHeight + verticalGap)
    
    nodes.push({
      id: `step-${step.number}`,
      type: 'step',
      position: { 
        x: 100,
        y: stepY
      },
      data: {
        step,
        isActive,
        processStatus: process.status
      }
    })

    // Create edge to next step
    if (index < process.steps.length - 1) {
      const isCompleted = step.status === 'completed'
      const nextStep = process.steps[index + 1]
      // Handle both new format (activeStepId) and old format (activeStepNumber)
      const isNextActive = currentState.activeStepId 
        ? nextStep.id === currentState.activeStepId
        : nextStep.number === currentState.activeStepNumber
      
      edges.push({
        id: `edge-${step.number}-${nextStep.number}`,
        source: `step-${step.number}`,
        target: `step-${nextStep.number}`,
        animated: isActive || isNextActive,
        style: {
          stroke: isCompleted ? '#10b981' : isActive || isNextActive ? '#22d3ee' : '#30363d',
          strokeWidth: 2
        }
      })
    }

    // Add sub-process nodes for this step (try both step.id and step.number)
    const stepSubProcesses = step.id 
      ? subProcessesByStepId[step.id] 
      : subProcessesByStepNumber[step.number]
    if (stepSubProcesses) {
      stepSubProcesses.forEach((subProcess, subIndex) => {
        const subProcessNodeId = `subprocess-${subProcess.id}`
        
        // Get subprocess data for lazy prompts if available
        const subProcessData = getSubProcess?.(subProcess.processPath)
        
        // Position sub-processes to the right of the step, stacked vertically if multiple
        nodes.push({
          id: subProcessNodeId,
          type: 'subprocess',
          position: {
            x: 100 + subProcessXOffset,
            y: stepY + subIndex * subProcessVerticalGap
          },
          data: {
            id: subProcess.id,
            name: subProcess.name,
            status: subProcess.status,
            spawnedAtStep: subProcess.spawnedAtStep,
            onNavigate: onSubProcessNavigate ? (ctrlKey: boolean) => onSubProcessNavigate(subProcess, ctrlKey) : undefined,
            isHighlighted: highlightedNodeId === subProcessNodeId,
            // For lazy prompts
            subProcess: subProcessData?.process,
            subProcessPath: subProcessData?.absolutePath
          }
        })

        // Create edge from step to sub-process
        edges.push({
          id: `edge-${step.number}-to-${subProcess.id}`,
          source: `step-${step.number}`,
          target: subProcessNodeId,
          sourceHandle: 'subprocess',
          animated: subProcess.status === 'running',
          style: {
            stroke: subProcess.status === 'completed' ? '#10b981' : 
                   subProcess.status === 'running' ? '#8b5cf6' : 
                   subProcess.status === 'failed' ? '#ef4444' : '#30363d',
            strokeWidth: 2,
            strokeDasharray: '5,5'
          }
        })
      })
    }
  })

  return { nodes, edges }
}

// Inner component that has access to useReactFlow
function ProcessDiagramInner({ process, onStepClick, onSubProcessClick, onParentClick, focusNodeId, getSubProcess }: ProcessDiagramProps) {
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(focusNodeId || null)
  const { fitBounds, getNode } = useReactFlow()

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => generateDiagram(process, onSubProcessClick, onParentClick, highlightedNodeId, getSubProcess),
    [process, onSubProcessClick, onParentClick, highlightedNodeId, getSubProcess]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes when process or highlight changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = generateDiagram(process, onSubProcessClick, onParentClick, highlightedNodeId, getSubProcess)
    setNodes(newNodes)
    setEdges(newEdges)
  }, [process, onSubProcessClick, onParentClick, highlightedNodeId, getSubProcess, setNodes, setEdges])

  // Focus on the target node when focusNodeId is provided
  useEffect(() => {
    if (focusNodeId) {
      setHighlightedNodeId(focusNodeId)
      
      // Small delay to ensure nodes are rendered
      const focusTimer = setTimeout(() => {
        const node = getNode(focusNodeId)
        if (node) {
          // Calculate bounds for the node with generous padding for less zoom
          const bounds = {
            x: node.position.x - 150,
            y: node.position.y - 150,
            width: 700,
            height: 500
          }
          fitBounds(bounds, { duration: 500, padding: 0.3 })
        }
      }, 100)

      // Clear highlight after animation
      const clearTimer = setTimeout(() => {
        setHighlightedNodeId(null)
      }, 3000)

      return () => {
        clearTimeout(focusTimer)
        clearTimeout(clearTimer)
      }
    }
  }, [focusNodeId, fitBounds, getNode])

  // Handle single click - only for step nodes
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // Only handle step node clicks with single click
      if (node.id.startsWith('step-')) {
        const stepNumber = parseInt(node.id.replace('step-', ''))
        const step = process.steps.find(s => s.number === stepNumber)
        if (step && onStepClick) {
          onStepClick(step)
        }
      }
    },
    [process.steps, onStepClick]
  )

  // Handle double click - for subprocess and parent nodes
  const handleNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const ctrlKey = event.ctrlKey || event.metaKey
      if (node.id.startsWith('subprocess-') && onSubProcessClick) {
        const subProcessId = node.id.replace('subprocess-', '')
        const subProcess = process.subProcessState?.childProcesses?.find(c => c.id === subProcessId)
        if (subProcess) {
          onSubProcessClick(subProcess, ctrlKey)
        }
      }
      else if (node.id === 'parent-process' && onParentClick) {
        const parent = process.subProcessState?.parentProcess
        if (parent) {
          onParentClick(parent, ctrlKey)
        }
      }
    },
    [process.subProcessState?.childProcesses, process.subProcessState?.parentProcess, onSubProcessClick, onParentClick]
  )

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.05 }}
        minZoom={0.5}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: 'smoothstep'
        }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1} 
          color="#21262d"
        />
        <Controls 
          className="!bg-surface !border-border !rounded-lg !shadow-lg"
          showInteractive={false}
        />
        <MiniMap 
          className="!bg-surface !border-border !rounded-lg"
          nodeColor={(node) => {
            const data = node.data as any
            // Handle parent process node
            if (node.id === 'parent-process') {
              return '#f59e0b' // amber-500
            }
            // Handle step nodes
            if (node.id.startsWith('step-')) {
              if (data?.step?.status === 'completed') return '#10b981'
              if (data?.isActive) return '#22d3ee'
              return '#30363d'
            }
            // Handle sub-process nodes
            if (node.id.startsWith('subprocess-')) {
              if (data?.status === 'completed') return '#10b981'
              if (data?.status === 'running') return '#8b5cf6'
              if (data?.status === 'failed') return '#ef4444'
              return '#30363d'
            }
            return '#30363d'
          }}
          maskColor="rgba(13, 17, 23, 0.8)"
        />
      </ReactFlow>
    </div>
  )
}

// Wrapper component that provides ReactFlowProvider
export function ProcessDiagram(props: ProcessDiagramProps) {
  return (
    <ReactFlowProvider>
      <ProcessDiagramInner {...props} />
    </ReactFlowProvider>
  )
}

