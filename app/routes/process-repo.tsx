// app/routes/process-repo.tsx
import { json, redirect, type ActionFunctionArgs } from '@remix-run/node'
import { isValidRepoUrl } from '#app/utils/repo-util'
import { processDir } from '#app/utils/github-repo.server'
import { convertRepoTree } from '#app/utils/helpers/repo-engine-helper'
import { connectionSessionStorage } from '#app/utils/connections.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { requireUserId } from '#app/utils/auth.server.ts'

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	try {
		const formData = await request.formData()
		const url = formData.get('url')

		if (typeof url !== 'string' || !isValidRepoUrl(url)) {
			return json({ error: 'Invalid GitHub URL' }, { status: 400 })
		}

		const processedTree = await processDir(url)
		const convertedTree = convertRepoTree(processedTree)
		const treeDataString = JSON.stringify(convertedTree)

		const repoTree = await prisma.repoTree.create({
			data: {
				userId: userId,
				treeData: treeDataString,
			},
		})

		return redirect(`/diagram?repoTreeId=${repoTree.id}`)
	} catch (error) {
		console.error('Error processing repo:', error)

		return json({ error: 'Failed to process repository' }, { status: 500 })
	}
}
