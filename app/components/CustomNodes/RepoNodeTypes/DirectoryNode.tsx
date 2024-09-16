import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { DirectoryRepoNode } from '#app/utils/node-types'

const DirectoryNode = memo(
	({ id, data, isConnectable }: NodeProps<DirectoryRepoNode>) => {
		return (
			<div className="px-4 py-2 shadow-md rounded-md bg-blue-200 border-2 border-stone-400">
      <div className="flex">
        <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">
          <strong>{id}</strong>
        </div>
        <div className="ml-2">
          <div className="text-lg font-bold">{data.obj.path}</div>
          {/* <div className="text-gray-500">{data.obj.url}</div> */}
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="w-5 h-5 !bg-teal-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-5 h-5 !bg-teal-500"
      />
    </div>
		)
	},
)

export default DirectoryNode
