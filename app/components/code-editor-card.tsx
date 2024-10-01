import { useTheme } from '#app/routes/resources+/theme-switch.js'
import { DEFAULT_CODE } from '#app/utils/providers/constants.js'
import { Editor } from '@monaco-editor/react'


const CodeEditorCard = () => {
	const theme = useTheme()

  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs'

	return (
		<div className="relative h-full w-full border-l border-solid border-l-border bg-background">
			<Editor
				theme={monacoTheme}
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
	)
}

export default CodeEditorCard
