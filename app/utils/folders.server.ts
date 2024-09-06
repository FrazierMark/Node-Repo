import { prisma } from './db.server.ts'

import type { Folder } from "@prisma/client"

export const getFoldersByWorkspaceId = async (workspaceId: string) => {
  const folders = await prisma.folder.findMany({
    where: { workspaceId }
  })

  return folders
}

export const createFolder = async (folder: Omit<Folder, "id" | "createdAt" | "updatedAt">) => {
  const createdFolder = await prisma.folder.create({
    data: folder
  })

  return createdFolder
}

export const updateFolder = async (
  folderId: string,
  folder: Partial<Omit<Folder, "id" | "createdAt" | "updatedAt">>
) => {
  const updatedFolder = await prisma.folder.update({
    where: { id: folderId },
    data: folder
  })

  return updatedFolder
}

export const deleteFolder = async (folderId: string) => {
  await prisma.folder.delete({
    where: { id: folderId }
  })

  return true
}