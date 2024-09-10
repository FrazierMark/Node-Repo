// app/routes/process-repo.tsx
import { json, redirect, type ActionFunctionArgs } from '@remix-run/node'
import { isValidRepoUrl } from '#app/utils/repo-util'
import { processDir } from '#app/utils/github-repo.server'
import { convertRepoTree } from '#app/utils/helpers/repo-engine-helper'

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const url = formData.get('url')

  if (typeof url !== 'string' || !isValidRepoUrl(url)) {
    return json({ error: 'Invalid GitHub URL' }, { status: 400 })
  }

  try {
    const processedTree = await processDir(url)
    const convertedTree = convertRepoTree(processedTree)

    // Store the converted tree in the session or a temporary storage
    // For this example, we'll use a simple URL parameter
    const treeData = encodeURIComponent(JSON.stringify(convertedTree))
    return redirect(`/diagram?treeData=${treeData}`)
  } catch (error) {
    return json({ error: 'Failed to process repository' }, { status: 500 })
  }
}