import { nanoid } from 'nanoid'
import { Edge } from '@xyflow/react'
import { NodeType } from '../enums/nodeTypeEnum'
import { RepoNode } from '../node-types'
import { getXYPosition } from './repo-node-position-helper'
import { RepoDataType } from '../enums/repoDataTypeEnum'
import { ProcessedTree, GitHubTreeItem } from './repo-engine-helper'
import { SharedNodeData } from '../node-types'

export const repoTreeParser = (
	repoTree: ProcessedTree,
): {
	repoNodes: RepoNode[]
	edges: Edge[]
} => {
	let nodeSequence = 0
	const repoNodes: RepoNode[] = []
	const edges: Edge[] = []

	const traverse = (
		node: GitHubTreeItem & { files?: ProcessedTree },
		parentId: string | null,
		depth: number,
		path: string,
	): string => {
		nodeSequence++
		const nodeId = `n${nodeSequence}`

		const isFile = node.type === 'blob'

		const sharedData: SharedNodeData = {
			depth,
			dataObject: node,
			stringifiedJson: JSON.stringify(node),
			parentNodePathIds: parentId ? [parentId] : [],
		}

		let repoNode: RepoNode

		if (isFile) {
			repoNode = {
				id: nodeId,
				type: NodeType.Primitive,
				position: getXYPosition(depth),
				data: {
					...sharedData,
					dataType: RepoDataType.String,
					arrayIndex: 0,
					value: node.path,
				},
			}
		} else {
			repoNode = {
				id: nodeId,
				type: NodeType.Directory,
				position: getXYPosition(depth),
				data: {
					...sharedData,
					dataType: RepoDataType.Object,
					arrayIndexForObject: null,
					obj: node,
					isRootNode: depth === 0,
				},
			}
		}

		repoNodes.push(repoNode)

		if (parentId) {
			edges.push({
				id: nanoid(),
				source: parentId,
				target: nodeId,
				type: 'default',
				animated: true,
				style: { strokeWidth: 2 },
			})
		}

		if (!isFile && node.files) {
			Object.entries(node.files).forEach(([key, value]) => {
				const childPath = `${path}/${key}`
				traverse(value, nodeId, depth + 1, childPath)
			})
		}

		return nodeId
	}

	Object.values(repoTree).forEach((node) => traverse(node, null, 0, node.path))

	return { repoNodes, edges }
}
