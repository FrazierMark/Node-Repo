import { Resizable } from 're-resizable'
import { Button, buttonVariants } from './button'
import { IconChevronRight } from '#app/routes/_marketing+/logos/IconChevronRight.js'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { cn } from '#app/utils/misc.js'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { PanelSwitch } from '#app/routes/resources+/panel-switch.js'
import { getPanelState } from '#app/utils/panel.server.js'

async function action({ request }: ActionFunctionArgs) {
	const data = await getPanelState(request)

	return data
}

const CodeEditorPanel = () => {
	const isPanelOpen = useActionData<typeof action>()

	console.log(isPanelOpen)
	return (
		<>
			<Resizable
				// style={{
				// 	overflow: 'hidden',
				// 	display: sidebarIsOpen ? 'initial' : 'none',
				// }}
				defaultSize={{
					width: 320,
					height: '100%',
				}}
				minWidth={272}
				maxWidth={
					typeof window !== 'undefined' ? window.innerWidth / 2 : undefined
				}
				enable={{
					right: true,
				}}
			>
				<div>TEST TEST TEST</div>
			</Resizable>

			<PanelSwitch />
		</>
	)
}

export default CodeEditorPanel
