import dagre from 'dagre'
import { Edge, XYPosition } from '@xyflow/react'
import { SIZES } from '../providers/constants'
import { RepoNode } from '../node-types'
import {
	isArrayRepoNode,
	isObjectRepoNode,
	isPrimitiveRepoNode,
} from './repo-node-helper'

export const getXYPosition = (depth: number): XYPosition => {
	const x: number = depth * SIZES.nodeMaxWidth + depth * SIZES.nodeGap
	const y: number = 0 // y will be calculated in `getLayoutedRepoNodes` function with `dagre` library later.

	return { x, y } as XYPosition
}

const calculateRepoNodeHeight = (repoNode: RepoNode): number => {
	if (isArrayRepoNode(repoNode)) {
		return SIZES.arrayNodeSize
	}

	const NODE_TOP_BOTTOM_PADDING: number = SIZES.nodePadding * 2

	if (isObjectRepoNode(repoNode)) {
		return (
			NODE_TOP_BOTTOM_PADDING +
			SIZES.nodeContentHeight * Object.keys(repoNode.data.obj).length
		)
	}

	if (isPrimitiveRepoNode(repoNode)) {
		return NODE_TOP_BOTTOM_PADDING + SIZES.nodeContentHeight * 1
	}

	return 0
}

/**
 * @reference https://reactflow.dev/docs/examples/layout/dagre/
 */
export const getLayoutedRepoNodes = (
	repoNodes: RepoNode[],
	edges: Edge[],
): RepoNode[] => {
	const dagreGraph = new dagre.graphlib.Graph()

	dagreGraph.setDefaultEdgeLabel(() => ({}))
	dagreGraph.setGraph({ rankdir: 'LR' }) // 'LR' is Left to Right direction.

	repoNodes.forEach((node: RepoNode) => {
		dagreGraph.setNode(node.id, {
			width: SIZES.nodeMaxWidth,
			height: calculateRepoNodeHeight(node),
		})
	})

	edges
		.filter(({ type }) => type === 'default') // Do not consider 'chain' edge.
		.forEach((edge) => {
			dagreGraph.setEdge(edge.source, edge.target)
		})

	dagre.layout(dagreGraph)

	return repoNodes.map((node: RepoNode) => {
		const nodeWithPosition = dagreGraph.node(node.id)
		const nodeHeight: number = calculateRepoNodeHeight(node)

		return {
			...node,
			// 'x' is already set at this moment because of `getXYPosition` function.
			position: {
				...node.position,
				y: nodeWithPosition.y - nodeHeight / 2,
			},
		}
	})
}
