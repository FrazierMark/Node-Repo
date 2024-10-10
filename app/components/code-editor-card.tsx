import { useTheme } from '#app/routes/resources+/theme-switch.js'
import { Editor } from '@monaco-editor/react'

const CodeEditorCard = ({
	nodeId,
	nodeCode,
	nodePath,
}: {
	nodeId: string
	nodeCode: string
	nodePath: string
}) => {
	const theme = useTheme()
	const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs'
	const title = nodePath.split('/').pop()

	return (
		<div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
			<div className="border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-600 dark:bg-gray-700">
				<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
					{title}
				</h3>
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
						folding: true,
					}}
					defaultValue={nodeCode}
				/>
			</div>
		</div>
	)
}

export default CodeEditorCard
