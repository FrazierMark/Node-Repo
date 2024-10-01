import { json, redirect, useFetcher, useFetchers } from '@remix-run/react'
import { useRequestInfo } from '#app/utils/request-info.ts'
import { useForm, getFormProps } from '@conform-to/react'
import { ServerOnly } from 'remix-utils/server-only'
import { IconChevronRight } from '../_marketing+/logos/IconChevronRight'
import { IconChevronLeft } from '../_marketing+/logos/IconChevronLeft'
import { cn } from '#app/utils/misc.js'
import { buttonVariants } from '#app/components/ui/button'
import { z } from 'zod'
import { invariantResponse } from '@epic-web/invariant'
import { parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs } from '@remix-run/node'
import { PanelState, setPanelState } from '#app/utils/panel.server.js'

const PanelFormSchema = z.object({
	panel: z.enum(['open', 'closed']),
	redirectTo: z.string().optional(),
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const submission = parseWithZod(formData, {
		schema: PanelFormSchema,
	})

	invariantResponse(
		submission.status === 'success',
		'Invalid panel state received',
	)

	const { panel, redirectTo } = submission.value

	const responseInit = {
		headers: { 'set-cookie': setPanelState(panel) },
	}

	if (redirectTo) {
		return redirect(redirectTo, responseInit)
	} else {
		return json({ result: submission.reply() }, responseInit)
	}
}

export function PanelSwitch({
	userPreference,
}: {
	userPreference: PanelState | null
}) {
	const fetcher = useFetcher<typeof action>()
	const requestInfo = useRequestInfo()

	const [form] = useForm({
		id: 'panel-switch',
		lastResult: fetcher.data?.result,
	})

	const currentMode = usePanelState()
	const mode = currentMode ?? userPreference ?? 'closed'
	const nextMode =
		mode === 'closed' ? 'open' : mode === 'open' ? 'closed' : 'closed'

	console.log(nextMode)

	const modeLabel = {
		open: <IconChevronRight />,
		closed: <IconChevronLeft />,
	}

	return (
		<fetcher.Form
			method="POST"
			{...getFormProps(form)}
			action="/resources/panel-switch"
		>
			<ServerOnly>
				{() => (
					<input type="hidden" name="redirectTo" value={requestInfo.path} />
				)}
			</ServerOnly>

			<input type="hidden" name="panel" value={nextMode} />

			<div
				className={cn(
					'fixed transition-all duration-300 ease-in-out',
					mode === 'open' ? 'right-[33.33vw]' : 'right-[4px]',
					'top-[50%]',
				)}
			>
				<button
					type="submit"
					className={cn(
						buttonVariants({ variant: 'default', size: 'icon' }),
						'z-15 m-1 size-[32px] cursor-pointer',
					)}
				>
					{modeLabel[mode]}
				</button>
			</div>
		</fetcher.Form>
	)
}

export function usePanelState() {
	const fetchers = useFetchers()
	const panelFetcher = fetchers.find(
		(f) => f.formAction === '/resources/panel-switch',
	)

	if (panelFetcher && panelFetcher.formData) {
		const submission = parseWithZod(panelFetcher.formData, {
			schema: PanelFormSchema,
		})

		if (submission.status === 'success') {
			return submission.value.panel
		}
	}
}
