import type { ProcessSummary, ProcessInstance } from '../types'

export interface ProcessTreeNode {
  process: ProcessSummary
  children: ProcessTreeNode[]
}

export function buildProcessTree(
  processes: ProcessSummary[],
  getProcess: (path: string) => ProcessInstance | undefined
): { tree: ProcessTreeNode[]; childPathSet: Set<string> } {
  const childPaths = new Set<string>()

  for (const proc of processes) {
    const full = getProcess(proc.path)
    if (full?.subProcessState?.childProcesses) {
      for (const child of full.subProcessState.childProcesses) {
        const childProc = processes.find(p => {
          const childFull = getProcess(p.path)
          return childFull?.id === child.id
        })
        if (childProc) {
          childPaths.add(childProc.path)
        }
      }
    }
  }

  const nodeMap = new Map<string, ProcessTreeNode>()
  for (const proc of processes) {
    nodeMap.set(proc.path, { process: proc, children: [] })
  }

  for (const proc of processes) {
    const full = getProcess(proc.path)
    if (full?.subProcessState?.childProcesses) {
      const parentNode = nodeMap.get(proc.path)
      if (parentNode) {
        for (const child of full.subProcessState.childProcesses) {
          const childProc = processes.find(p => {
            const childFull = getProcess(p.path)
            return childFull?.id === child.id
          })
          if (childProc) {
            const childNode = nodeMap.get(childProc.path)
            if (childNode) {
              parentNode.children.push(childNode)
            }
          }
        }
      }
    }
  }

  const roots = processes
    .filter(p => !childPaths.has(p.path))
    .map(p => nodeMap.get(p.path)!)
    .filter(Boolean)

  return { tree: roots, childPathSet: childPaths }
}
