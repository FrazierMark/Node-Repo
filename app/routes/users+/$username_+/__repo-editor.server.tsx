import { parseWithZod } from '@conform-to/zod'
import {
	unstable_createMemoryUploadHandler as createMemoryUploadHandler,
	json,
	unstable_parseMultipartFormData as parseMultipartFormData,
	redirect,
	type ActionFunctionArgs,
} from '@remix-run/node'
import { z } from 'zod'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { MAX_UPLOAD_SIZE, RepoEditorSchema } from './__repo-editor'
import { convertRepoTree } from '#app/utils/helpers/repo-engine-helper.js'
import { processDir } from '#app/utils/github-repo.server.js'

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)

	const formData = await request.formData()

	const submission = await parseWithZod(formData, {
		schema: RepoEditorSchema.superRefine(async (data, ctx) => {
			if (!data.id) return

			const repo = await prisma.repo.findUnique({
				select: { id: true },
				where: { id: data.id, ownerId: userId },
			})
			if (!repo) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Repo not found',
				})
			}
		}),
		async: true,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { id: repoId, url } = submission.value

	const { processedTree, repoName } = await processDir(request, url)
	const convertedTree = convertRepoTree(processedTree)
	const treeDataString = JSON.stringify(convertedTree)

	const updatedRepo = await prisma.repo.upsert({
		select: { id: true, owner: { select: { username: true } } },
		where: { id: repoId ?? '__new_repo__' },
		create: {
			ownerId: userId,
			title: repoName,
			url,
			content: treeDataString,
		},
		update: {
			title: repoName,
			url,
			content: treeDataString,
		},
	})

	return redirect(
		`/users/${updatedRepo.owner.username}/repos/${updatedRepo.id}`,
	)
}
