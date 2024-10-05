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
	OnConnect,
	OnEdgesChange,
	OnNodesChange,
	NodeChange,
	applyNodeChanges,
	applyEdgeChanges,
	Edge,
	NodeTypes,
} from '@xyflow/react'
import { useNavigate, useSearchParams } from '@remix-run/react'
import { useLoaderData } from '@remix-run/react'
import React, { useCallback, useMemo } from 'react'
import { type RepoTree } from '#app/utils/helpers/repo-engine-helper'
import { NodeType } from '#app/utils/enums/nodeTypeEnum'
import { cn } from '#app/utils/misc.js'
import PrimitiveNode from '#app/components/CustomNodes/RepoNodeTypes/PrimitiveNode'
import DirectoryNode from '#app/components/CustomNodes/RepoNodeTypes/DirectoryNode.js'
import CodeEditorNode from './CustomNodes/CodeEditorNode/CodeEditorNode'
import { RepoNode } from '#app/utils/node-types.js'
import { loader } from '#app/routes/diagram+/$username_+/repos.$repoId.js'

const nodeTypes: NodeTypes = {
	[NodeType.Directory]: DirectoryNode,
	[NodeType.Primitive]: PrimitiveNode,
	[NodeType.CodeEditor]: CodeEditorNode,
}

export default function FlowDiagram({ onNodeClick }: { onNodeClick: (nodeId: string) => void }) {
	const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const {treeData} = useLoaderData<typeof loader>()

	const initialNodes = treeData ? treeData.repoNodes : []
	const initialEdges = treeData ? treeData.edges : []

	const [nodes, setNodes] = useNodesState(initialNodes)
	const [edges, setEdges] = useEdgesState(initialEdges as Edge[])

	const onNodesChange: OnNodesChange = useCallback(
		(changes: NodeChange[]) =>
			setNodes((nds) => applyNodeChanges(changes, nds) as typeof nds),
		[setNodes],
	)
	const onEdgesChange: OnEdgesChange = useCallback(
		(changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
		[setEdges],
	)
	const onConnect: OnConnect = useCallback(
		(connection) => setEdges((eds) => addEdge(connection, eds)),
		[setEdges],
	)

	const handleNodeClick = useCallback((event: React.MouseEvent, node: RepoNode) => {
		onNodeClick(node.id)
	}, [onNodeClick])

	return (
		<>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onNodeClick={handleNodeClick}
			>
				<Controls />
				<MiniMap />
				<Background variant={BackgroundVariant.Dots} gap={12} size={1} />
			</ReactFlow>
		</>
	)
}
