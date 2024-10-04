import { useLoaderData, useSearchParams } from '@remix-run/react'
import { loader } from '#app/routes/diagram+/$username_+/repos.$repoId.tsx'
import { cn } from '#app/utils/misc.js'
import CodeEditorCard from './code-editor-card.tsx'
import { DEFAULT_CODE } from '#app/utils/providers/constants.js'

const CodeEditorPanel = () => {
	const { panelState, nodeCodeData } = useLoaderData<typeof loader>()
	const [searchParams] = useSearchParams()
	const selectedNodes = searchParams.get('selectedNodes')?.split(',').filter(Boolean) || []

	return (
		<div
		className={cn(
			'top-18 max-w-1/2 h-full fixed right-0 w-1/3',
			'transition-transform duration-300 ease-in-out',
				panelState === 'open' ? 'translate-x-0' : 'translate-x-full',
			)}
		>
			
				{selectedNodes.map(nodeId => {
					const nodeCode = nodeCodeData[nodeId]
					return nodeCode ? (
						<div key={nodeId} >
							<CodeEditorCard nodeId={nodeId} nodeCode={nodeCode} />
						</div>
					) : <CodeEditorCard nodeId="1" nodeCode={DEFAULT_CODE} />
				})}
			
		</div>
	)
}

export default CodeEditorPanel
