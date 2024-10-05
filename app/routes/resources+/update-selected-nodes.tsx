import { json, type ActionFunctionArgs } from '@remix-run/node'
import { z } from 'zod'
import { parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'

const UpdateSelectedNodesSchema = z.object({
	selectedNodes: z.string(),
	redirectTo: z.string().optional(),
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const submission = parseWithZod(formData, {
		schema: UpdateSelectedNodesSchema,
	})

	invariantResponse(
		submission.status === 'success',
		'Invalid selected nodes data received',
	)

	const { selectedNodes, redirectTo } = submission.value

	// Here you would typically update any server-side state if needed
	// For now, we'll just return the updated selected nodes

	const responseInit = {
		headers: { 'Set-Cookie': `selectedNodes=${selectedNodes}; Path=/; HttpOnly` },
	}

	if (redirectTo) {
		return json({ result: submission.reply() }, responseInit)
	} else {
		return json({ result: submission.reply() }, responseInit)
	}
}