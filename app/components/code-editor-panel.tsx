import { useLoaderData } from '@remix-run/react'
import { loader } from '#app/routes/diagram+/$username_+/repos.$repoId.tsx'
import { cn } from '#app/utils/misc.js'
import CodeEditorCard from './code-editor-card.tsx'

const CodeEditorPanel = ({ 
  nodeCodeData, 
  selectedNodes,
  isLoading 
}: { 
  nodeCodeData: Array<{ nodeId: string; code: string }>,
  selectedNodes: string[],
  isLoading: boolean
}) => {
  const { panelState } = useLoaderData<typeof loader>()

  return (
    <div
      className={cn(
        'max-w-1/2 fixed right-0 flex h-screen w-2/5 flex-col bg-background',
        'transition-transform duration-300 ease-in-out',
        panelState === 'open' ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        nodeCodeData
          .filter(({ nodeId }) => selectedNodes.includes(nodeId))
          .map(({ nodeId, code }) => (
            <div className="h-full w-full flex-auto" key={nodeId}>
              <CodeEditorCard nodeId={nodeId} nodeCode={code} />
            </div>
          ))
      )}
    </div>
  )
}

export default CodeEditorPanel
