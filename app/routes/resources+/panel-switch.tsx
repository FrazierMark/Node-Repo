import { json, redirect, useFetcher } from '@remix-run/react';
import { useRequestInfo } from '#app/utils/request-info.ts'
import { useForm, getFormProps } from '@conform-to/react';
import { ServerOnly } from 'remix-utils/server-only';
import { IconChevronRight } from '../_marketing+/logos/IconChevronRight';
import { cn } from '#app/utils/misc.js';
import { buttonVariants } from '#app/components/ui/button';
import { z } from 'zod';
import { invariantResponse } from '@epic-web/invariant';
import { parseWithZod } from '@conform-to/zod';
import { ActionFunctionArgs } from '@remix-run/node';
import { setPanelState } from '#app/utils/panel.server';

const PanelFormSchema = z.object({
	panel: z.enum(['open', 'closed']),
	redirectTo: z.string().optional(),
})


export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const submission = parseWithZod(formData, {
		schema: PanelFormSchema,
	});

	invariantResponse(submission.status === 'success', 'Invalid panel state received');

	const { panel, redirectTo } = submission.value;

	const responseInit = {
		headers: { 'set-cookie': setPanelState(panel) },
	};

	if (redirectTo) {
		return redirect(redirectTo, responseInit);
	} else {
		return json({ result: submission.reply() }, responseInit);
	}
}


export function PanelSwitch() {
	const fetcher = useFetcher<typeof action>()
	const requestInfo = useRequestInfo();

	const [form] = useForm({
		id: 'panel-switch',
		lastResult: fetcher.data?.result,
	});


  const mode = 'closed';
  const nextMode = mode === 'closed' ? 'open' : 'closed';

  const modeLabel = {
    open: (
      <IconChevronRight />
    ),
    closed: (
      <IconChevronRight />
    )
  }

	return (
		<fetcher.Form method="POST" {...getFormProps(form)} action="/resources/panel-switch">
			<ServerOnly>
				{() => (
					<input type="hidden" name="redirectTo" value={requestInfo.path} />
				)}
			</ServerOnly>

			<input type="hidden" name="panel" value={nextMode} />

			<div>
				<button
					type="submit"
					className={cn(
						buttonVariants({ variant: 'default', size: 'icon' }),
						'z-15 absolute right-0 top-[50%] size-[32px] cursor-pointer',
					)}
				>
					{modeLabel[mode]}
				</button>
			</div>
		</fetcher.Form>
	);
}