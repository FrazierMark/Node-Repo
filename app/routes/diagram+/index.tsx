import '@xyflow/react/dist/style.css'
import CodeEditorPanel from '#app/components/code-editor-panel.js'
import { useSearchParams } from '@remix-run/react'
import {
	json,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { prisma } from '#app/utils/db.server'
import { requireUserId } from '#app/utils/auth.server'
import { type RepoTree } from '#app/utils/helpers/repo-engine-helper'
import { cn } from '#app/utils/misc.js'
import { getPanelState, PanelState } from '#app/utils/panel.server.js'
import { PanelSwitch } from '../resources+/panel-switch'
import FlowDiagram from '#app/components/react-flow.js'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const url = new URL(request.url)
  const selectedNodeIds = url.searchParams.get('selectedNodes')
	const panelState = getPanelState(request)

	const repoTree = await prisma.repoTree.findFirst({
		where: { userId },
		orderBy: { createdAt: 'desc' },
		select: { treeData: true },
	})

	const selectedNodes = selectedNodeIds ? selectedNodeIds.split(',').map(id => ({ id })) : []

	if (!panelState) {
		throw new Response('No panel state found', { status: 404 })
	}

	if (!repoTree) {
		throw new Response('No repo data found', { status: 404 })
	}

	

	return json<LoaderData>({
		treeData: JSON.parse(repoTree.treeData) as RepoTree,
		panelState,
	})
}

type LoaderData = {
	treeData: RepoTree
	panelState: PanelState
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
