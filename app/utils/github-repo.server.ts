import { RepoTree } from '@prisma/client'
import { minimatch } from 'minimatch'
import { authSessionStorage } from './session.server'
import {
	getAccessToken,
	getUserId,
	sessionKey,
} from './auth.server'
import { prisma } from './db.server'
import { RepoNode, PrimitiveNodeData } from './node-types'
import { redirect } from '@remix-run/react'
import { getCachedAccessToken } from './providers/github.server'

interface GitHubFileResponse {
	encoding: string
	content: string
}

export type GitHubTreeItem = {
	path: string
	mode: string
	type: 'blob' | 'tree'
	sha: string
	size?: number
	url: string
}

export type ProcessedTreeItem = GitHubTreeItem & {
	files?: ProcessedTree
}

export type ProcessedTree = {
	[key: string]: ProcessedTreeItem
}

export type ProcessDirResult = {
	processedTree: ProcessedTree
	repoName: string
}

async function githubRequest(request: Request, path: string) {
	const userId = await getUserId(request);
	console.log('User ID for GitHub request:', userId);
	
	if (!userId) {
		console.log('No user ID found, redirecting to GitHub auth');
		throw redirect('/auth/github');
	}

	// Log the type and value of userId
	console.log('Type of userId:', typeof userId);
	console.log('Value of userId:', userId);

	const accessToken = await getCachedAccessToken(userId);
	console.log('Access token retrieved:', accessToken ? 'Token found' : 'Token not found');

	if (!accessToken) {
		console.log('No access token in cache, redirecting to GitHub auth');
		throw redirect('/auth/github');
	}

	const baseUrl = 'https://api.github.com'
	const url = new URL(path, baseUrl).toString()
	console.log('Making GitHub API request to:', url);
	
	const response = await fetch(url, {
		headers: {
			Authorization: `token ${accessToken}`,
			Accept: 'application/vnd.github.v3+json',
		},
	})

	if (!response.ok) {
		console.error('GitHub API request failed:', response.status, response.statusText);
		throw new Error(`GitHub API request failed: ${response.statusText}`)
	}
	
	console.log('GitHub API request successful');
	return response.json()
}

async function getRepoTree(request: Request, owner: string, repo: string) {
  console.log('getRepoTree(): Fetching repo tree for:', owner, repo)
	try {
		const branchData = await githubRequest(
			request,
			`/repos/${owner}/${repo}/branches/main`,
		)
		const treeSha = (branchData as any).commit.commit.tree.sha
		const treeData = await githubRequest(
			request,
			`/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`,
		)
		return (treeData as any).tree
	} catch (error) {
		console.error('Error fetching repo tree:', error)
		throw error
	}
}

// Main function to process directory
export async function processDir(
	request: Request,
	url: string,
	excludedPaths: string[] = [],
	excludedGlobs: string[] = [],
): Promise<ProcessDirResult> {
	const foldersToIgnore = ['.git', ...excludedPaths]

	// Parse the URL to get the owner and repo
	const urlParts = url.split('/')
	const owner = urlParts[3]
	const repo = urlParts[4]

	if (!owner || !repo) {
		throw new Error('Invalid GitHub URL')
	}

	// Get the repository tree from GitHub
	const tree = await getRepoTree(request, owner, repo)

	// Check if the path should be excluded
	const shouldExcludePath = (path: string) => {
		return (
			foldersToIgnore.some((folder) => path.startsWith(folder)) ||
			excludedGlobs.some((glob) => minimatch(path, glob))
		)
	}

	// Process the tree to build the directory structure
	const processTree = (tree: GitHubTreeItem[]): ProcessedTree => {
		const result: ProcessedTree = {}
		tree.forEach((item: GitHubTreeItem) => {
			if (shouldExcludePath(item.path)) return

			const parts = item.path.split('/')
			let current: ProcessedTree = result
			for (let i = 0; i < parts.length; i++) {
				const part = parts[i]
				if (part && !(part in current)) {
					current[part] =
						i === parts.length - 1
							? { ...item, files: undefined }
							: {
									path: part,
									mode: '',
									type: 'tree',
									sha: '',
									url: '',
									files: {},
								}
				}
				if (part && i < parts.length - 1) {
					;(current[part] as ProcessedTreeItem).files ??= {}
					current = (current[part] as ProcessedTreeItem).files!
				}
			}
		})

		return result
	}
	return {
		processedTree: processTree(tree),
		repoName: repo
	}
}

interface ParsedData {
	repoNodes: RepoNode[]
}

export async function getNodeCodeUrl(
	treeData: string,
	nodeId: string,
): Promise<string> {
	console.log('nodeId:', nodeId)

	let parsedData
	try {
		parsedData = JSON.parse(treeData) as ParsedData
	} catch (error) {
		console.error('Error parsing treeData:', error)
		return ''
	}

	const repoNodes = parsedData.repoNodes
	const node = repoNodes.find((node) => node.id === nodeId)

	if (node && 'data' in node && 'dataObject' in node.data) {
		return (node.data as PrimitiveNodeData).dataObject.url || ''
	}
	return ''
}

export async function fetchNodeCode(
	request: Request,
	filePath: string,
): Promise<string> {
  console.log('fetchNodeCode(): Fetching node code for:', filePath)
	try {
		const fileData = (await githubRequest(
			request,
			filePath,
		)) as GitHubFileResponse
		if (fileData.encoding === 'base64') {
			return atob(fileData.content)
		} else {
			throw new Error('Unexpected file encoding')
		}
	} catch (error) {
		console.error('Error fetching file code:', error)
		throw error
	}
}
