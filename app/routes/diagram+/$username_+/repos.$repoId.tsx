import '@xyflow/react/dist/style.css'
import CodeEditorPanel from '#app/components/code-editor-panel.js'
import { useSearchParams } from '@remix-run/react'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { prisma } from '#app/utils/db.server'
import { requireUserId } from '#app/utils/auth.server'
import { type RepoTree } from '#app/utils/helpers/repo-engine-helper'
import { cn } from '#app/utils/misc.js'
import { getPanelState, PanelState } from '#app/utils/panel.server.js'
import { PanelSwitch } from '#app/routes/resources+/panel-switch'
import FlowDiagram from '#app/components/react-flow.js'
import {
	checkNodesInCache,
	saveNodeToCache,
} from '#app/utils/providers/github.server.js'
import { fetchNodeCode, getNodeCodeUrl } from '#app/utils/github-repo.server.js'

export async function loader({ request, params }: LoaderFunctionArgs) {
	const url = new URL(request.url)

	const repoId = params.repoId
	const selectedNodes =
		url.searchParams.get('selectedNodes')?.split(',').filter(Boolean) || []
	const panelState = getPanelState(request)

	if (!repoId) {
		throw new Response('No repoId provided', { status: 400 })
	}

	const repo = await prisma.repo.findUnique({
		where: { id: repoId },
		select: { id: true, content: true },
	})

	if (!repo) {
		throw new Response('No repo data found', { status: 404 })
	}

	const nodesInCache = await checkNodesInCache(repoId, selectedNodes)

	// For nodes not in cache, fetch data and save to cache
	const nodeCodeData: Record<string, string> = {}

	await Promise.all(
		selectedNodes.map(async (nodeId) => {
			if (!nodesInCache[nodeId]) {
				try {
					const nodeUrl = await getNodeCodeUrl(repo.content, nodeId)
					console.log('Index.tsx: Node URL:', nodeUrl)
					if (nodeUrl) {
						const fetchedNodeData = await fetchNodeCode(request, nodeUrl)
						console.log('Fetched node data:', fetchedNodeData)
						await saveNodeToCache(repoId, nodeId, fetchedNodeData)
						nodeCodeData[nodeId] = fetchedNodeData
					} else {
						console.warn(`No URL found for node ${nodeId}`)
					}
				} catch (error) {
					console.error(`Error processing node ${nodeId}:`, error)
				}
			} else {
				// If the node is in cache, retrieve it
				try {
					nodeCodeData[nodeId] = await fetchNodeCode(request, nodeId)
				} catch (error) {
					console.error(`Error fetching cached data for node ${nodeId}:`, error)
				}
			}
		}),
	)

	if (!panelState) {
		throw new Response('No panel state found', { status: 404 })
	}

	return json<LoaderData>({
		treeData: JSON.parse(repo.content) as RepoTree,
		panelState,
		nodeCodeData,
	})
}

type LoaderData = {
	treeData: RepoTree
	panelState: PanelState
	nodeCodeData: Record<string, string>
}

export default function Diagram() {
	const { panelState } = useLoaderData<typeof loader>()

	return (
		<div className={cn('flex h-full w-full flex-col')}>
			<FlowDiagram />
			<PanelSwitch userPreference={panelState} />
			<CodeEditorPanel />
		</div>
	)
}
