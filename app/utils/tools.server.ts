import { prisma } from './db.server.ts'
import type { Tool, ToolWorkspace } from "@prisma/client"

export const getToolById = async (toolId: string) => {
  const tool = await prisma.tool.findUnique({
    where: { id: toolId }
  })

  if (!tool) {
    throw new Error("Tool not found")
  }

  return tool
}

export const getToolWorkspacesByWorkspaceId = async (workspaceId: string) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      ToolWorkspace: {
        include: {
          tool: true
        }
      }
    }
  })

  if (!workspace) {
    throw new Error("Workspace not found")
  }

  return workspace
}

export const getToolWorkspacesByToolId = async (toolId: string) => {
  const tool = await prisma.tool.findUnique({
    where: { id: toolId },
    include: {
      ToolWorkspace: {
        include: {
          workspace: true
        }
      }
    }
  })

  if (!tool) {
    throw new Error("Tool not found")
  }

  return tool
}

export const createTool = async (
  tool: Omit<Tool, "id" | "createdAt" | "updatedAt">,
  workspaceId: string
) => {
  const createdTool = await prisma.tool.create({
    data: tool
  })

  await createToolWorkspace({
    userId: createdTool.userId,
    toolId: createdTool.id,
    workspaceId
  })

  return createdTool
}

export const createTools = async (
  tools: Omit<Tool, "id" | "createdAt" | "updatedAt">[],
  workspaceId: string
) => {
  const createdTools = await prisma.tool.createMany({
    data: tools
  })

  const createdToolIds = await prisma.tool.findMany({
    where: { userId: { in: tools.map(t => t.userId) } },
    select: { id: true, userId: true }
  })

  await createToolWorkspaces(
    createdToolIds.map(tool => ({
      userId: tool.userId,
      toolId: tool.id,
      workspaceId
    }))
  )

  return createdTools
}

export const createToolWorkspace = async (item: Omit<ToolWorkspace, "createdAt" | "updatedAt">) => {
  return prisma.toolWorkspace.create({
    data: item
  })
}

export const createToolWorkspaces = async (
  items: Omit<ToolWorkspace, "createdAt" | "updatedAt">[]
) => {
  return prisma.toolWorkspace.createMany({
    data: items
  })
}

export const updateTool = async (
  toolId: string,
  tool: Partial<Omit<Tool, "id" | "createdAt" | "updatedAt">>
) => {
  return prisma.tool.update({
    where: { id: toolId },
    data: tool
  })
}

export const deleteTool = async (toolId: string) => {
  await prisma.tool.delete({
    where: { id: toolId }
  })

  return true
}

export const deleteToolWorkspace = async (
  toolId: string,
  workspaceId: string
) => {
  await prisma.toolWorkspace.delete({
    where: {
      toolId_workspaceId: {
        toolId,
        workspaceId
      }
    }
  })

  return true
}