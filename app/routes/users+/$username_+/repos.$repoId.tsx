import { getFormProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import {
	Form,
	Link,
	useActionData,
	useLoaderData,
	type MetaFunction,
} from '@remix-run/react'
import { formatDistanceToNow } from 'date-fns'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { floatingToolbarClassName } from '#app/components/floating-toolbar.tsx'
import { ErrorList } from '#app/components/forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { useIsPending } from '#app/utils/misc.tsx'
import { requireUserWithPermission } from '#app/utils/permissions.server.ts'
import { redirectWithToast } from '#app/utils/toast.server.ts'
import { userHasPermission, useOptionalUser } from '#app/utils/user.ts'
import { type loader as reposLoader } from './repos.tsx'

export async function loader({ params }: LoaderFunctionArgs) {
	const repo = await prisma.repo.findUnique({
		where: { id: params.repoId },
		select: {
			id: true,
			title: true,
			url: true,
			content: true,
			ownerId: true,
			updatedAt: true,
		},
	})

	invariantResponse(repo, 'Not found', { status: 404 })

	const date = new Date(repo.updatedAt)
	const timeAgo = formatDistanceToNow(date)

	return json({
		repo,
		timeAgo,
	})
}

const DeleteFormSchema = z.object({
	intent: z.literal('delete-repo'),
	repoId: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()
	const submission = parseWithZod(formData, {
		schema: DeleteFormSchema,
	})
	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { repoId } = submission.value

	const repo = await prisma.repo.findFirst({
		select: { id: true, ownerId: true, owner: { select: { username: true } } },
		where: { id: repoId },
	})
	invariantResponse(repo, 'Not found', { status: 404 })

	const isOwner = repo.ownerId === userId
	await requireUserWithPermission(
		request,
		isOwner ? `delete:repo:own` : `delete:repo:any`,
	)

	await prisma.repo.delete({ where: { id: repo.id } })

	return redirectWithToast(`/users/${repo.owner.username}/repos`, {
		type: 'success',
		title: 'Success',
		description: 'Your repo has been deleted.',
	})
}

export default function RepoRoute() {
	const data = useLoaderData<typeof loader>()
	const user = useOptionalUser()
	const isOwner = user?.id === data.repo.ownerId
	const canDelete = userHasPermission(
		user,
		isOwner ? `delete:repo:own` : `delete:repo:any`,
	)
	const displayBar = canDelete || isOwner

	return (
		<div className="absolute inset-0 flex flex-col px-10">
			<h2 className="mb-2 pt-12 text-h2 lg:mb-6">{data.repo.title}</h2>
			<div className={`${displayBar ? 'pb-24' : 'pb-12'} overflow-y-auto`}>
				<p className="whitespace-break-spaces text-sm md:text-lg">
					<Link
						className="text-light-blue-600 hover:text-blue-800 underline hover:no-underline"
						to={`/diagram/${user?.username}/repos/${data.repo.id}`}
					>
						{data.repo.url}
					</Link>
				</p>
			</div>
			{displayBar ? (
				<div className={floatingToolbarClassName}>
					<span className="text-sm text-foreground/90 max-[524px]:hidden">
						<Icon name="clock" className="scale-125">
							{data.timeAgo} ago
						</Icon>
					</span>
					<div className="grid flex-1 grid-cols-2 justify-end gap-2 min-[525px]:flex md:gap-4">
						{canDelete ? <DeleteRepo id={data.repo.id} /> : null}
						<Button
							asChild
							className="min-[525px]:max-md:aspect-square min-[525px]:max-md:px-0"
						>
							<Link to="edit">
								<Icon name="pencil-1" className="scale-125 max-md:scale-150">
									<span className="max-md:hidden">Edit</span>
								</Icon>
							</Link>
						</Button>
					</div>
				</div>
			) : null}
		</div>
	)
}

export function DeleteRepo({ id }: { id: string }) {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const [form] = useForm({
		id: 'delete-repo',
		lastResult: actionData?.result,
	})

	return (
		<Form method="POST" {...getFormProps(form)}>
			<input type="hidden" name="repoId" value={id} />
			<StatusButton
				type="submit"
				name="intent"
				value="delete-repo"
				variant="destructive"
				status={isPending ? 'pending' : (form.status ?? 'idle')}
				disabled={isPending}
				className="w-full max-md:aspect-square max-md:px-0"
			>
				<Icon name="trash" className="scale-125 max-md:scale-150">
					<span className="max-md:hidden">Delete</span>
				</Icon>
			</StatusButton>
			<ErrorList errors={form.errors} id={form.errorId} />
		</Form>
	)
}

export const meta: MetaFunction<
	typeof loader,
	{ 'routes/users+/$username_+/repos': typeof reposLoader }
> = ({ data, params, matches }) => {
	const reposMatch = matches.find(
		(m) => m.id === 'routes/users+/$username_+/repos',
	)
	const displayName = reposMatch?.data?.owner.name ?? params.username
	const repoTitle = data?.repo.title ?? 'Repo'
	const repoContentsSummary =
		data && data.repo.content.length > 100
			? data?.repo.content.slice(0, 97) + '...'
			: 'No content'
	return [
		{ title: `${repoTitle} | ${displayName}'s Repos | Node Repo` },
		{
			name: 'description',
			content: repoContentsSummary,
		},
	]
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				403: () => <p>You are not allowed to do that</p>,
				404: ({ params }) => (
					<p>No repo with the id "{params.repoId}" exists</p>
				),
			}}
		/>
	)
}
