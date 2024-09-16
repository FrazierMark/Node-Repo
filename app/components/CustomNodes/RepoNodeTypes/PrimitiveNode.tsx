import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { PrimitiveRepoNode } from '#app/utils/node-types'

const PrimitiveNode = memo(
	({ id, data, isConnectable }: NodeProps<PrimitiveRepoNode>) => {
		return (
			<div className="px-4 py-2 shadow-md rounded-md bg-red-200 border-2 border-stone-400">
				<div className="flex">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
						<strong>{id}</strong>
					</div>
					<div className="ml-2">
						<div className="text-lg font-bold">{data.value}</div>
						{/* <div className="text-gray-500">{data.value}</div> */}
					</div>
				</div>

				<Handle
					type="target"
					position={Position.Left}
					className="h-5 w-5 !bg-teal-500"
				/>
				<Handle
					type="source"
					position={Position.Right}
					className="h-5 w-5 !bg-teal-500"
				/>
			</div>
		)
	},
)

export default PrimitiveNode
