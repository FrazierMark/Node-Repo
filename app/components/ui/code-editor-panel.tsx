import { Resizable } from 're-resizable'
import { useLoaderData } from '@remix-run/react'
import { PanelSwitch } from '#app/routes/resources+/panel-switch.js'
import { loader } from '#app/routes/diagram+/index.tsx'
import Editor from '@monaco-editor/react'
import { useTheme } from '#app/routes/resources+/theme-switch.js'
import { DEFAULT_CODE } from '#app/utils/providers/constants.js'
import { cn } from '#app/utils/misc.js'

const CodeEditorPanel = () => {
	const { panelState } = useLoaderData<typeof loader>()
	const theme = useTheme()

	return (
		<div className={cn('w-1/3 relative absolute right-10 h-full')}>
			<Resizable
				style={{
					overflow: 'hidden',
					display:
						panelState === 'open'
							? 'initial'
							: panelState === 'closed'
								? 'none'
								: 'none',
				}}
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
				<div className="relative h-full w-full border-r-1 border-solid border-r-border">
					<Editor
						theme={theme}
					defaultLanguage="typescript"
					options={{
						minimap: {
							enabled: false,
						},
						scrollbar: {
							horizontal: 'hidden',
						},
						overviewRulerLanes: 0,
					}}
					defaultValue={DEFAULT_CODE}
					className="h-full"
					/>
				</div>
			</Resizable>

			
		</div>
	)
}

export default CodeEditorPanel
