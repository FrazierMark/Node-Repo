import { Form, useNavigate, useSubmit } from '@remix-run/react'
import { useId } from 'react'
import { useIsPending } from '#app/utils/misc.tsx'
import { Icon } from './ui/icon.tsx'
import { Input } from './ui/input.tsx'
import { Label } from './ui/label.tsx'
import { StatusButton } from './ui/status-button.tsx'
import { isValidRepoUrl } from '#app/utils/repo-util.ts'

export function RepoSearchBar() {
  const id = useId()
  const submit = useSubmit()
  const navigate = useNavigate()
  const isSubmitting = useIsPending({
    formMethod: 'POST',
    formAction: '/process-repo',
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const url = new FormData(form).get('url') as string
    if (isValidRepoUrl(url)) {
      submit(form, { method: 'post', action: '/process-repo' })
    } else {
      // Handle invalid URL (e.g., show an error message)
    }
  }

  return (
    <Form onSubmit={handleSubmit} className="flex flex-wrap items-center justify-center gap-2">
      <div className="flex-1">
        <Label htmlFor={id} className="sr-only">
          GitHub Repository URL
        </Label>
        <Input
          type="url"
          name="url"
          id={id}
          placeholder="Enter GitHub Repository URL"
          className="w-full"
          required
        />
      </div>
      <div>
        <StatusButton
          type="submit"
          status={isSubmitting ? 'pending' : 'idle'}
          className="flex w-full items-center justify-center"
        >
          <Icon name="magnifying-glass" size="md" />
          <span className="sr-only">Process Repository</span>
        </StatusButton>
      </div>
    </Form>
  )
}