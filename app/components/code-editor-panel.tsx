import { useLoaderData, useSearchParams } from '@remix-run/react'
import { loader } from '#app/routes/diagram+/$username_+/repos.$repoId.tsx'
import { cn } from '#app/utils/misc.js'
import CodeEditorCard from './code-editor-card.tsx'
import { DEFAULT_CODE } from '#app/utils/providers/constants.js'

const CodeEditorPanel = () => {
	const { panelState, nodeCodeData } = useLoaderData<typeof loader>()
	const [searchParams] = useSearchParams()
	const selectedNodes = searchParams.get('selectedNodes')?.split(',').filter(Boolean) || []

	console.log(selectedNodes)
	console.log(nodeCodeData)

	return (
		<div
		className={cn(
			'flex h-screen flex-col max-w-1/2 fixed right-0 w-1/3',
			'transition-transform duration-300 ease-in-out',
				panelState === 'open' ? 'translate-x-0' : 'translate-x-full',
			)}
		>
			
				{nodeCodeData.map(({ nodeId, code }) => {
					return (
						<div key={nodeId} >
							<CodeEditorCard nodeId={nodeId} nodeCode={code} />
						</div>
					)
				})}
			
		</div>
	)
}

export default CodeEditorPanel
