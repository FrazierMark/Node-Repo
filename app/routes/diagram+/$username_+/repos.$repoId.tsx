import '@xyflow/react/dist/style.css'
import CodeEditorPanel from '#app/components/code-editor-panel.js'
import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import { useLoaderData, useSearchParams, useFetcher } from '@remix-run/react'
import { prisma } from '#app/utils/db.server'
import { type RepoTree } from '#app/utils/helpers/repo-engine-helper'
import { cn } from '#app/utils/misc.js'
import { getPanelState, PanelState } from '#app/utils/panel.server.js'
import { PanelSwitch } from '#app/routes/resources+/panel-switch'
import FlowDiagram from '#app/components/react-flow.js'
import {
	fetchNodeCode,
	getNodeCodeUrl,
	getNodeFromCache,
	saveNodeToCache,
} from '#app/utils/github-repo.server.js'

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

	const nodeCodeData: Array<{ nodeId: string; code: string }> = []

	await Promise.all(
		selectedNodes.map(async (nodeId) => {
			try {
				const cachedData = await getNodeFromCache(repoId, nodeId)

				if (cachedData) {
					nodeCodeData.push({ nodeId, code: cachedData })
				} else {
					const nodeUrl = await getNodeCodeUrl(repo.content, nodeId)
					if (nodeUrl) {
						const fetchedNodeData = await fetchNodeCode(
							request,
							nodeId,
							nodeUrl,
						)
						await saveNodeToCache(repoId, nodeId, fetchedNodeData)
						nodeCodeData.push({ nodeId, code: fetchedNodeData })
					} else {
						console.warn(`No URL found for node ${nodeId}`)
					}
				}
			} catch (error) {
				console.error(`Error processing node ${nodeId}:`, error)
			}
		}),
	)

	if (!panelState) {
		throw new Response('No panel state found', { status: 404 })
	}

	if (!nodeCodeData) {
		throw new Response('No node code data found', { status: 404 })
	}

	return json<LoaderData>({
		treeData: JSON.parse(repo.content) as RepoTree,
		panelState,
		selectedNodes,
		nodeCodeData,
	})
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const nodeId = formData.get('nodeId')
	const action = formData.get('action')

	// You can perform any server-side logic here if needed
	// For now, we'll just return the received data
	return json({ nodeId, action })
}

type LoaderData = {
	treeData: RepoTree
	panelState: PanelState
	selectedNodes: string[]
	nodeCodeData: Array<{ nodeId: string; code: string }>
}

export default function Diagram() {
	const { panelState } = useLoaderData<typeof loader>()
	const [searchParams, setSearchParams] = useSearchParams()


	return (
		<div className={cn('flex h-full w-full')}>
			<FlowDiagram />
			<PanelSwitch userPreference={panelState} />
			<CodeEditorPanel />
		</div>
	)
}
