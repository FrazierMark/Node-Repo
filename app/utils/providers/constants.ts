export const MOCK_CODE_GITHUB = 'MOCK_CODE_GITHUB_KODY'

export const MOCK_CODE_GITHUB_HEADER = 'x-mock-code-github'

export const CURLY_ROOT_NODE_NAME = '{root}'

export const ROOT_NODE_NAME = 'root'

export const ROOT_NODE_DEPTH = 0

export const ROOT_PARENT_NODE_PATH_IDS: string[] = []

export const ARRAY_ROOT_NODE_INDEX = -9999

export const DEFAULT_REPO_URL =
	'https://github.com/FrazierMark/3D_Algorithm_Sorting_Visualizer'

export const SIZES = {
	// Node
	nodeMinWidth: 220, // Excepted array node.
	nodeMaxWidth: 440,
	arrayNodeSize: 64,
	nodeGap: 100,
	nodeContentHeight: 40,
	nodePadding: 12,

	// Node Detail Panel
	nodeDetailPanelWidth: 420,
}

export const DEFAULT_CODE = `import { json, redirect, useFetcher, useFetchers } from '@remix-run/react';
import { useRequestInfo } from '#app/utils/request-info.ts'
import { useForm, getFormProps } from '@conform-to/react';
import { ServerOnly } from 'remix-utils/server-only';
import { IconChevronRight } from '../_marketing+/logos/IconChevronRight';
import { IconChevronLeft } from '../_marketing+/logos/IconChevronLeft';
import { cn } from '#app/utils/misc.js';
import { buttonVariants } from '#app/components/ui/button';
import { z } from 'zod';
import { invariantResponse } from '@epic-web/invariant';
import { parseWithZod } from '@conform-to/zod';
import { ActionFunctionArgs } from '@remix-run/node';
import { PanelState, setPanelState } from '#app/utils/panel.server.js';

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


export function PanelSwitch({userPreference}: {userPreference: PanelState | null}) {
	const fetcher = useFetcher<typeof action>()
	const requestInfo = useRequestInfo();

	const [form] = useForm({
		id: 'panel-switch',
		lastResult: fetcher.data?.result,
	});

	const currentMode = usePanelState();
	const mode = currentMode ?? userPreference ?? 'closed';
	const nextMode = mode === 'closed' ? 'open' : mode === 'open' ? 'closed' : 'closed';

	console.log(nextMode)

  const modeLabel = {
    open: <IconChevronRight />,
    closed: <IconChevronLeft />
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


export function usePanelState() {
  const fetchers = useFetchers();
  const panelFetcher = fetchers.find(
    (f) => f.formAction === '/resources/panel-switch'
  );

  if (panelFetcher && panelFetcher.formData) {
    const submission = parseWithZod(panelFetcher.formData, {
      schema: PanelFormSchema,
    });

    if (submission.status === 'success') {
      return submission.value.panel;
    }
  }
}`
