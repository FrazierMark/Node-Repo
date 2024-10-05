import { useTheme } from '#app/routes/resources+/theme-switch.js'
import { Editor } from '@monaco-editor/react'

const CodeEditorCard = ({ nodeId, nodeCode }: { nodeId: string; nodeCode: string })  => {
	const theme = useTheme()
	const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs'

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
			<div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
				<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{nodeId}</h3>
			</div>
			<div className="h-64">
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
						fontSize: 12,
						lineNumbers: 'on',
						renderLineHighlight: 'all',
						lineDecorationsWidth: 0,
						lineNumbersMinChars: 3,
						folding: false,
					}}
					defaultValue={nodeCode}
				/>
			</div>
		</div>
	)
}

export default CodeEditorCard
