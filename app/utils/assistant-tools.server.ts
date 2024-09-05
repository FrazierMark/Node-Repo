import { prisma } from '#app/utils/db.server'
import type { Prisma } from '@prisma/client'

export const getAssistantToolsByAssistantId = async (assistantId: string) => {
  const assistantTools = await prisma.assistant.findUnique({
    where: { id: assistantId },
    include: {
      AssistantTool: {
        include: {
          tool: true
        }
      }
    }
  })

  if (!assistantTools) {
    throw new Error("Assistant not found")
  }

  return {
    id: assistantTools.id,
    name: assistantTools.name,
    tools: assistantTools.AssistantTool.map(at => at.tool)
  }
}

export const createAssistantTool = async (
  assistantTool: Prisma.AssistantToolCreateInput
) => {
  const createdAssistantTool = await prisma.assistantTool.create({
    data: assistantTool,
    include: {
      tool: true
    }
  })

  if (!createdAssistantTool) {
    throw new Error("Failed to create assistant tool")
  }

  return createdAssistantTool
}

export const createAssistantTools = async (
  assistantTools: Prisma.AssistantToolCreateInput[]
) => {
  const createdAssistantTools = await prisma.$transaction(
    assistantTools.map(tool => 
      prisma.assistantTool.create({
        data: tool,
        include: {
          tool: true
        }
      })
    )
  )

  if (!createdAssistantTools) {
    throw new Error("Failed to create assistant tools")
  }

  return createdAssistantTools
}

export const deleteAssistantTool = async (
  assistantId: string,
  toolId: string
) => {
  await prisma.assistantTool.deleteMany({
    where: {
      assistantId,
      toolId
    }
  })

  return true
}