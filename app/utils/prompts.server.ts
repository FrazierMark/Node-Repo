import { prisma } from './db.server.ts'
import type { Prompt, PromptWorkspace } from "@prisma/client"

export const getPromptById = async (promptId: string) => {
  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId }
  })

  if (!prompt) {
    throw new Error("Prompt not found")
  }

  return prompt
}

export const getPromptWorkspacesByWorkspaceId = async (workspaceId: string) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      PromptWorkspace: {
        include: {
          prompt: true
        }
      }
    }
  })

  if (!workspace) {
    throw new Error("Workspace not found")
  }

  return workspace
}

export const getPromptWorkspacesByPromptId = async (promptId: string) => {
  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
    include: {
      promptWorkspaces: {
        include: {
          workspace: true
        }
      }
    }
  })

  if (!prompt) {
    throw new Error("Prompt not found")
  }

  return prompt
}

export const createPrompt = async (
  prompt: Omit<Prompt, "id" | "createdAt" | "updatedAt">,
  workspaceId: string
) => {
  const createdPrompt = await prisma.prompt.create({
    data: prompt
  })

  await createPromptWorkspace({
    userId: createdPrompt.userId,
    promptId: createdPrompt.id,
    workspaceId
  })

  return createdPrompt
}

export const createPrompts = async (
  prompts: Omit<Prompt, "id" | "createdAt" | "updatedAt">[],
  workspaceId: string
) => {
  const createdPrompts = await prisma.prompt.createMany({
    data: prompts
  })

  const newPrompts = await prisma.prompt.findMany({
    where: {
      userId: { in: prompts.map(p => p.userId) },
      name: { in: prompts.map(p => p.name) }
    }
  })

  await createPromptWorkspaces(
    newPrompts.map(prompt => ({
      userId: prompt.userId,
      promptId: prompt.id,
      workspaceId
    }))
  )

  return newPrompts
}

export const createPromptWorkspace = async (item: Omit<PromptWorkspace, "createdAt" | "updatedAt">) => {
  return prisma.promptWorkspace.create({
    data: item
  })
}

export const createPromptWorkspaces = async (
  items: Omit<PromptWorkspace, "createdAt" | "updatedAt">[]
) => {
  return prisma.promptWorkspace.createMany({
    data: items
  })
}

export const updatePrompt = async (
  promptId: string,
  prompt: Partial<Omit<Prompt, "id" | "createdAt" | "updatedAt">>
) => {
  return prisma.prompt.update({
    where: { id: promptId },
    data: prompt
  })
}

export const deletePrompt = async (promptId: string) => {
  await prisma.prompt.delete({
    where: { id: promptId }
  })

  return true
}

export const deletePromptWorkspace = async (
  promptId: string,
  workspaceId: string
) => {
  await prisma.promptWorkspace.delete({
    where: {
      promptId_workspaceId: {
        promptId,
        workspaceId
      }
    }
  })

  return true
}