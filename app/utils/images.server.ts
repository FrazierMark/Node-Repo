import { prisma } from './db.server.ts'
import { getNoteImgSrc } from './misc.tsx'

export async function getMessageImageFromStorage(imageId: string) {
  const image = await prisma.noteImage.findUnique({
    where: { id: imageId },
    select: { id: true },
  })

  if (!image) {
    throw new Error("Image not found")
  }

  return getNoteImgSrc(image.id)
}