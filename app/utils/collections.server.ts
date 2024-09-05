import { prisma } from './db.server.ts'
import type { Collection, Workspace, CollectionWorkspace } from "@prisma/client"

export const getCollectionById = async (collectionId: string) => {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId }
  })

  if (!collection) {
    throw new Error("Collection not found")
  }

  return collection
}

export const getCollectionWorkspacesByWorkspaceId = async (
  workspaceId: string
) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      CollectionWorkspace: {
        include: { collection: true }
      }
    }
  })

  if (!workspace) {
    throw new Error("Workspace not found")
  }

  return {
    ...workspace,
    collections: workspace.CollectionWorkspace.map(cw => cw.collection)
  }
}

export const getCollectionWorkspacesByCollectionId = async (
  collectionId: string
) => {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    include: {
      CollectionWorkspace: {
        include: { workspace: true }
      }
    }
  })

  if (!collection) {
    throw new Error("Collection not found")
  }

  return {
    ...collection,
    workspaces: collection.CollectionWorkspace.map(cw => cw.workspace)
  }
}

export const createCollection = async (
  collection: Omit<Collection, "id" | "createdAt" | "updatedAt">,
  workspaceId: string
) => {
  const createdCollection = await prisma.collection.create({
    data: collection
  })

  await createCollectionWorkspace({
    userId: createdCollection.userId,
    collectionId: createdCollection.id,
    workspaceId
  })

  return createdCollection
}

export const createCollections = async (
  collections: Omit<Collection, "id" | "createdAt" | "updatedAt">[],
  workspaceId: string
) => {
  const createdCollections = await prisma.collection.createMany({
    data: collections
  })

  const createdIds = await prisma.collection.findMany({
    where: { userId: { in: collections.map(c => c.userId) } },
    select: { id: true, userId: true }
  })

  await createCollectionWorkspaces(
    collections.map(collection => ({
      userId: collection.userId,
      collectionId: createdIds.find(c => c.userId === collection.userId)?.id ?? '',
      workspaceId
    }))
  )

  return createdCollections
}

export const createCollectionWorkspace = async (item: Omit<CollectionWorkspace, "createdAt" | "updatedAt">) => {
  return await prisma.collectionWorkspace.create({
    data: item
  })
}

export const createCollectionWorkspaces = async (
  items: Omit<CollectionWorkspace, "createdAt" | "updatedAt">[]
) => {
  return await prisma.collectionWorkspace.createMany({
    data: items
  })
}

export const updateCollection = async (
  collectionId: string,
  collection: Partial<Omit<Collection, "id" | "createdAt" | "updatedAt">>
) => {
  return await prisma.collection.update({
    where: { id: collectionId },
    data: collection
  })
}

export const deleteCollection = async (collectionId: string) => {
  await prisma.collection.delete({
    where: { id: collectionId }
  })

  return true
}

export const deleteCollectionWorkspace = async (
  collectionId: string,
  workspaceId: string
) => {
  await prisma.collectionWorkspace.delete({
    where: {
      collectionId_workspaceId: {
        collectionId,
        workspaceId
      }
    }
  })

  return true
}