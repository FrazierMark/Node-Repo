import { useLoaderData, useNavigation } from '@remix-run/react'
import { loader } from '#app/routes/diagram+/$username_+/repos.$repoId.tsx'
import { cn } from '#app/utils/misc.js'
import CodeEditorCard from './code-editor-card.tsx'

const CodeEditorPanel = () => {
	const { panelState, nodeCodeData, selectedNodes } =
		useLoaderData<typeof loader>()
	const navigation = useNavigation()

	return (
		<div
			className={cn(
				' max-w-1/2 fixed right-0 flex h-screen w-2/5 flex-col bg-background',
				'duration-250 transition-transform ease-in-out shadow-lg',
				panelState === 'open' ? 'translate-x-0' : 'translate-x-full',
			)}
		>
			<div className="p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
				<h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Code Viewer</h2>
			</div>
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{navigation.state === 'loading' ? (
					<div className="flex items-center justify-center h-full">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
					</div>
				) : (
					nodeCodeData
						.filter(({ nodeId }) => selectedNodes.includes(nodeId))
						.map(({ nodeId, path, code }) => (
							<CodeEditorCard key={nodeId} nodePath={path} nodeId={nodeId} nodeCode={code} />
						))
				)}
			</div>
		</div>
	)
}

export default CodeEditorPanel
