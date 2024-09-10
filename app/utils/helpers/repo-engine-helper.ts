import { Entities, arrayToEntities } from '../array-util'
import { Edge } from '@xyflow/react'
import { RepoNode } from '../node-types.ts'
import { repoTreeParser } from './repo-parser-helper.ts'
import { getLayoutedRepoNodes } from './repo-node-position-helper.ts'

export type GitHubTreeItem = {
	path: string
	mode: string
	type: 'blob' | 'tree'
	sha: string
	size?: number
	url: string
}

export type RepoTree = {
	repoNodes: RepoNode[]
	repoNodeEntities: Entities<RepoNode>
	edges: Edge[]
}

export type ProcessedTreeItem = GitHubTreeItem & {
	files?: ProcessedTree
}

export type ProcessedTree = {
	[key: string]: ProcessedTreeItem
}

export const convertRepoTree = (repoTree: ProcessedTree): RepoTree => {
	const { repoNodes, edges } = repoTreeParser(repoTree)
	const layoutedRepoNodes: RepoNode[] = getLayoutedRepoNodes(repoNodes, edges)
	const repoNodeEntities: Entities<RepoNode> = arrayToEntities<RepoNode>(
		layoutedRepoNodes,
		'id',
	)

	return { repoNodes: layoutedRepoNodes, repoNodeEntities, edges }
}
