import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { RepoEditor } from './__repo-editor.tsx'

export { action } from './__repo-editor.server.tsx'

export async function loader({ params, request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const repo = await prisma.repo.findFirst({
		select: {
			id: true,
			title: true,
			content: true,
		},
		where: {
			id: params.repoId,
			ownerId: userId,
		},
	})
	invariantResponse(repo, 'Not found', { status: 404 })
	return json({ repo: repo })
}

export default function RepoEdit() {
	const data = useLoaderData<typeof loader>()

	return <RepoEditor repo={data.repo} />
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No repo with the id "{params.repoId}" exists</p>
				),
			}}
		/>
	)
}
