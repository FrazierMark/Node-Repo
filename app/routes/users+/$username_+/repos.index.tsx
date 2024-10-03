import { type MetaFunction } from '@remix-run/react'
import { type loader as reposLoader } from './repos.tsx'

export default function ReposIndexRoute() {
	return (
		<div className="container pt-12">
			<p className="text-body-md">Select a repo</p>
		</div>
	)
}

export const meta: MetaFunction<
	null,
	{ 'routes/users+/$username_+/repos': typeof reposLoader }
> = ({ params, matches }) => {
	const reposMatch = matches.find(
		(m) => m.id === 'routes/users+/$username_+/repos',
	)
	const displayName = reposMatch?.data?.owner.name ?? params.username
	const repoCount = reposMatch?.data?.owner.repos.length ?? 0
	const reposText = repoCount === 1 ? 'repo' : 'repos'
	return [
		{ title: `${displayName}'s Repos | Node Repo` },
		{
			name: 'description',
			content: `Checkout ${displayName}'s ${repoCount} ${reposText} on Node Repo`,
		},
	]
}
