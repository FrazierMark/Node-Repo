import { useLoaderData } from '@remix-run/react'
import { loader } from '#app/routes/diagram+/index.tsx'
import { cn } from '#app/utils/misc.js'
import CodeEditorCard from './code-editor-card.tsx'

const CodeEditorPanel = () => {
	const { panelState } = useLoaderData<typeof loader>()

	return (
		<div
			className={cn(
				'top-18 max-w-1/2 fixed right-0 h-[calc(100vh-4rem)] w-1/3',
				'transition-transform duration-300 ease-in-out',
				panelState === 'open' ? 'translate-x-0' : 'translate-x-full',
			)}
		>
			<CodeEditorCard />
		</div>
	)
}

export default CodeEditorPanel
