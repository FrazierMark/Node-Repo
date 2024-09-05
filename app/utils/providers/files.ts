import { toast } from "sonner"
import {
	unstable_createMemoryUploadHandler as createMemoryUploadHandler,
	json,
	unstable_parseMultipartFormData as parseMultipartFormData,
	redirect,
	type ActionFunctionArgs,
} from '@remix-run/node'
import { MAX_UPLOAD_SIZE } from '#app/routes/users+/$username_+/__note-editor.js'

export const uploadFile = async (
  file: File,
  payload: {
    name: string
    userId: string
    fileId: string
  }
) => {
  const SIZE_LIMIT = parseInt(
    process.env.NEXT_PUBLIC_USER_FILE_SIZE_LIMIT || "10000000"
  )

  if (file.size > SIZE_LIMIT) {
    throw new Error(
      `File must be less than ${Math.floor(SIZE_LIMIT / 1000000)}MB`
    )
  }

  const filePath = `${payload.userId}/${Buffer.from(payload.fileId).toString("base64")}`

  try {
    const formData = new FormData()
    formData.append('file', file)

    const uploadHandler = createMemoryUploadHandler({ maxPartSize: MAX_UPLOAD_SIZE })
    const parsedFormData = await parseMultipartFormData(formData, uploadHandler)

    const uploadedFile = parsedFormData.get('file') as File
    if (!uploadedFile) {
      throw new Error("File upload failed")
    }

    const blob = Buffer.from(await uploadedFile.arrayBuffer())

    // Here you would typically save the blob to your storage system
    // For this example, we'll just log it
    console.log(`File ${filePath} uploaded successfully, size: ${blob.length} bytes`)

    return filePath
  } catch (error) {
    console.error("Error uploading file:", error)
    throw new Error("Error uploading file")
  }
}

// deleteFileFromStorage and getFileFromStorage remain unchanged