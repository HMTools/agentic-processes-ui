import { useMemo, useEffect } from 'react'
import {
  ReactFlow,
  Background,
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

import { SubstepNode } from './SubstepNode'
import type { StepSubstep } from '../../types'

interface SubstepFlowDiagramProps {
  substeps: StepSubstep[]
  currentSubstepNumber?: number
  totalSubsteps: number
  flowDescription?: string
}

const nodeTypes: NodeTypes = {
  substep: SubstepNode
}

function generateSubstepDiagram(
  substeps: StepSubstep[],
  currentSubstepNumber?: number
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  const nodeWidth = 200
  const nodeHeight = 60
  const verticalGap = 80

  substeps.forEach((substep, index) => {
    let status: 'completed' | 'active' | 'pending' = 'pending'
    if (currentSubstepNumber !== undefined) {
      if (substep.number < currentSubstepNumber) {
        status = 'completed'
      } else if (substep.number === currentSubstepNumber) {
        status = 'active'
      }
    }

    nodes.push({
      id: `substep-${substep.number}`,
      type: 'substep',
      position: {
        x: 50,
        y: index * (nodeHeight + verticalGap)
      },
      data: {
        substep: {
          number: substep.number,
          name: substep.name,
          conditional: substep.conditional,
          description: substep.description,
        },
        status,
      }
    })

    if (index < substeps.length - 1) {
      const nextSubstep = substeps[index + 1]
      const isCompleted = status === 'completed'
      const isActive = status === 'active'

      edges.push({
        id: `edge-substep-${substep.number}-${nextSubstep.number}`,
        source: `substep-${substep.number}`,
        target: `substep-${nextSubstep.number}`,
        type: 'smoothstep',
        animated: isActive,
        style: {
          stroke: isCompleted ? '#10b981' : isActive ? '#22d3ee' : '#30363d',
          strokeWidth: 2
        }
      })
    }
  })

  return { nodes, edges }
}

function SubstepFlowDiagramInner({
  substeps,
  currentSubstepNumber,
  totalSubsteps,
  flowDescription,
}: SubstepFlowDiagramProps) {
  const { fitView } = useReactFlow()

  const { initialNodes, initialEdges } = useMemo(() => {
    const { nodes, edges } = generateSubstepDiagram(substeps, currentSubstepNumber)
    return { initialNodes: nodes, initialEdges: edges }
  }, [substeps, currentSubstepNumber])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = generateSubstepDiagram(substeps, currentSubstepNumber)
    setNodes(newNodes)
    setEdges(newEdges)
    setTimeout(() => fitView({ padding: 0.2 }), 50)
  }, [substeps, currentSubstepNumber, setNodes, setEdges, fitView])

  return (
    <div className="w-full h-full flex flex-col">
      {flowDescription && (
        <div className="px-3 py-1.5 text-[10px] text-text-muted border-b border-border bg-surface">
          {flowDescription}
        </div>
      )}
      <div className="flex-1 text-[10px] text-text-muted">
        <div className="absolute top-2 right-2 z-10 text-[10px] text-text-muted">
          {currentSubstepNumber ?? 0}/{totalSubsteps} substeps
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={true}
          zoomOnScroll={true}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#30363d" />
        </ReactFlow>
      </div>
    </div>
  )
}

export function SubstepFlowDiagram(props: SubstepFlowDiagramProps) {
  return (
    <ReactFlowProvider>
      <SubstepFlowDiagramInner {...props} />
    </ReactFlowProvider>
  )
}
