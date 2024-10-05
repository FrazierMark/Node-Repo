import { useTheme } from '#app/routes/resources+/theme-switch.js'
import { DEFAULT_CODE } from '#app/utils/providers/constants.js'
import { Editor } from '@monaco-editor/react'


const CodeEditorCard = ({ nodeId, nodeCode }: { nodeId: string; nodeCode: string })  => {
	const theme = useTheme()

  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs'

	return (
		<div className="h-full w-full flex-auto">
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
				defaultValue={nodeCode}
			/>
		</div>
	)
}

export default CodeEditorCard
