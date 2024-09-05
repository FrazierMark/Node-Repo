import { PrismaClient } from '@prisma/client'
import { Assistant, AssistantWorkspace, Workspace } from '@prisma/client'

const prisma = new PrismaClient()

export const getAssistantById = async (assistantId: string): Promise<Assistant> => {
  const assistant = await prisma.assistant.findUnique({
    where: { id: assistantId }
  })

  if (!assistant) {
    throw new Error("Assistant not found")
  }

  return assistant
}

export const getAssistantWorkspacesByWorkspaceId = async (workspaceId: string): Promise<Workspace & { assistants: Assistant[] }> => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      AssistantWorkspace: {
        include: {
          assistant: true
        }
      }
    }
  })

  if (!workspace) {
    throw new Error("Workspace not found")
  }

  return {
    ...workspace,
    assistants: workspace.AssistantWorkspace.map(aw => aw.assistant)
  }
}

export const getAssistantWorkspacesByAssistantId = async (assistantId: string): Promise<Assistant & { workspaces: Workspace[] }> => {
  const assistant = await prisma.assistant.findUnique({
    where: { id: assistantId },
    include: {
      AssistantWorkspace: {
        include: {
          workspace: true
        }
      }
    }
  })

  if (!assistant) {
    throw new Error("Assistant not found")
  }

  return {
    ...assistant,
    workspaces: assistant.AssistantWorkspace.map(aw => aw.workspace)
  }
}

export const createAssistant = async (
  assistant: Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'>,
  workspaceId: string
): Promise<Assistant> => {
  const createdAssistant = await prisma.assistant.create({
    data: assistant
  })

  await createAssistantWorkspace({
    userId: createdAssistant.userId,
    assistantId: createdAssistant.id,
    workspaceId
  })

  return createdAssistant
}

export const createAssistants = async (
  assistants: Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'>[],
  workspaceId: string
): Promise<Assistant[]> => {
  await prisma.assistant.createMany({
    data: assistants
  })

  const createdAssistants = await prisma.assistant.findMany({
    where: {
      OR: assistants.map(a => ({ name: a.name, userId: a.userId }))
    }
  })

  await createAssistantWorkspaces(
    createdAssistants.map(assistant => ({
      userId: assistant.userId,
      assistantId: assistant.id,
      workspaceId
    }))
  )

  return createdAssistants
}

export const createAssistantWorkspace = async (item: {
  userId: string
  assistantId: string
  workspaceId: string
}): Promise<AssistantWorkspace> => {
  return await prisma.assistantWorkspace.create({
    data: item
  })
}

export const createAssistantWorkspaces = async (
  items: { userId: string; assistantId: string; workspaceId: string }[]
): Promise<AssistantWorkspace[]> => {
  await prisma.assistantWorkspace.createMany({
    data: items
  })

  const createdAssistantWorkspaces = await prisma.assistantWorkspace.findMany({
    where: {
      OR: items.map(item => ({
        userId: item.userId,
        assistantId: item.assistantId,
        workspaceId: item.workspaceId
      }))
    }
  })

  return createdAssistantWorkspaces
}

export const updateAssistant = async (
  assistantId: string,
  assistant: Partial<Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Assistant> => {
  return await prisma.assistant.update({
    where: { id: assistantId },
    data: assistant
  })
}

export const deleteAssistant = async (assistantId: string): Promise<boolean> => {
  await prisma.assistant.delete({
    where: { id: assistantId }
  })

  return true
}

export const deleteAssistantWorkspace = async (
  assistantId: string,
  workspaceId: string
): Promise<boolean> => {
  await prisma.assistantWorkspace.deleteMany({
    where: {
      assistantId,
      workspaceId
    }
  })

  return true
}