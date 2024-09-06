import { prisma } from './db.server.ts'

export const getAssistantCollectionsByAssistantId = async (
  assistantId: string
) => {
  const assistantCollections = await prisma.assistant.findUnique({
    where: { id: assistantId },
    select: {
      id: true,
      name: true,
      AssistantCollection: {
        select: {
          collection: true
        }
      }
    }
  })

  if (!assistantCollections) {
    throw new Error("Assistant not found")
  }

  return {
    ...assistantCollections,
    collections: assistantCollections.AssistantCollection.map(ac => ac.collection)
  }
}

export const createAssistantCollection = async (
  assistantCollection: {
    userId: string
    assistantId: string
    collectionId: string
  }
) => {
  const createdAssistantCollection = await prisma.assistantCollection.create({
    data: assistantCollection,
    include: {
      assistant: true,
      collection: true
    }
  })

  return createdAssistantCollection
}

export const createAssistantCollections = async (
  assistantCollections: {
    userId: string
    assistantId: string
    collectionId: string
  }[]
) => {
  const createdAssistantCollections = await prisma.assistantCollection.createMany({
    data: assistantCollections
  })

  return createdAssistantCollections
}

export const deleteAssistantCollection = async (
  assistantId: string,
  collectionId: string
) => {
  await prisma.assistantCollection.delete({
    where: {
      assistantId_collectionId: {
        assistantId,
        collectionId
      }
    }
  })

  return true
}