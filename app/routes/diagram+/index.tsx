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
	NodeToolbar,
	ReactFlowProvider,
	Panel,
	useReactFlow,
} from '@xyflow/react'
import { useState } from 'react'
import CodeEditorPanel from '#app/components/ui/code-editor-panel.js'
import { Button } from '#app/components/ui/button.js'
import CodeEditorNode from '../../components/CustomNodes/CodeEditorNode/CodeEditorNode'
import { useSearchParams } from '@remix-run/react'
import {
	ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { prisma } from '#app/utils/db.server'
import { requireUserId } from '#app/utils/auth.server'
import React, { useCallback, useMemo } from 'react'
import { type RepoTree } from '#app/utils/helpers/repo-engine-helper'
import { NodeType } from '#app/utils/enums/nodeTypeEnum'
import { cn } from '#app/utils/misc.js'
import PrimitiveNode from '#app/components/CustomNodes/RepoNodeTypes/PrimitiveNode'
import DirectoryNode from '#app/components/CustomNodes/RepoNodeTypes/DirectoryNode.js'
import { IconChevronRight } from '../_marketing+/logos/IconChevronRight'
import { useFetcher } from '@remix-run/react'
import { getPanelState, PanelState } from '#app/utils/panel.server.js'
import { getTheme, Theme } from '#app/utils/theme.server.js'
import { PanelSwitch } from '../resources+/panel-switch'

type LoaderData = {
  treeData: RepoTree;
  panelState: PanelState;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request)

  const repoTree = await prisma.repoTree.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { treeData: true },
  })

	const panelState = getPanelState(request)

  if (!repoTree) {
    throw new Response('No repo data found', { status: 404 })
  }

	if (!panelState) {
		throw new Response('No panel state found', { status: 404 })
	}

  return json<LoaderData>({
    treeData: JSON.parse(repoTree.treeData) as RepoTree,
    panelState,
  })
}



const nodeTypes: NodeTypes = {
	[NodeType.Directory]: DirectoryNode,
	[NodeType.Primitive]: PrimitiveNode,
	[NodeType.CodeEditor]: CodeEditorNode,
}

export default function Diagram() {
	const { treeData } = useLoaderData<typeof loader>()
	const { panelState } = useLoaderData<typeof loader>()
	const [searchParams] = useSearchParams()

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

	return (
		<>
			<ReactFlowProvider>
				<Panel className={cn('absolute right-[4px] top-[50%]')}>
					<CodeEditorPanel />
					<PanelSwitch userPreference={panelState} />
				</Panel>
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
			</ReactFlowProvider>
		</>
	)
}
