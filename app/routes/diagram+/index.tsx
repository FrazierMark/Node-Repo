import '@xyflow/react/dist/style.css'
import {
	ReactFlow,
	MiniMap,
	Controls,
	Background,
	useNodesState,
	useEdgesState,
	addEdge,
	BackgroundVariant,
} from '@xyflow/react'
import CodeEditorNode from '../../components/CustomNodes/CodeEditorNode'
import React, { useCallback, useMemo } from 'react'

const initialNodes = [
	{ id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
	{ id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
  { id: '3', type: 'codeEditorNode', position: { x: 0, y: 200 }, data: { label: '3' } },
  { id: '4', type: 'codeEditorNode', position: { x: 0, y: 300 }, data: { label: '4' } },
]
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }]

export default function App() {
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

	const onConnect = useCallback(
		(params: any) => setEdges((eds) => addEdge(params, eds)),
		[setEdges],
	)

  const nodeTypes = useMemo(() => ({ codeEditorNode: CodeEditorNode }), [])

	return (
		<ReactFlow
			nodes={nodes}
			edges={edges}
			nodeTypes={nodeTypes}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			onConnect={onConnect}
		>
			<Controls />
			<MiniMap />
			<Background variant={BackgroundVariant.Dots} gap={12} size={1} />
		</ReactFlow>
	)
}
