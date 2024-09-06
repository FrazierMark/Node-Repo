import { prisma } from './db.server.ts'
import type { Workspace } from "@prisma/client"

export const getHomeWorkspaceByUserId = async (userId: string) => {
  const homeWorkspace = await prisma.workspace.findFirst({
    where: {
      userId,
      isHome: true
    }
  })

  if (!homeWorkspace) {
    throw new Error("Home workspace not found")
  }

  return homeWorkspace.id
}

export const getWorkspaceById = async (workspaceId: string) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId }
  })

  if (!workspace) {
    throw new Error("Workspace not found")
  }

  return workspace
}

export const getWorkspacesByUserId = async (userId: string) => {
  const workspaces = await prisma.workspace.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  if (!workspaces) {
    throw new Error("No workspaces found")
  }

  return workspaces
}

export const createWorkspace = async (
  workspace: Omit<Workspace, "id" | "createdAt" | "updatedAt">
) => {
  const createdWorkspace = await prisma.workspace.create({
    data: workspace
  })

  return createdWorkspace
}

export const updateWorkspace = async (
  workspaceId: string,
  workspace: Partial<Omit<Workspace, "id" | "createdAt" | "updatedAt">>
) => {
  const updatedWorkspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: workspace
  })

  return updatedWorkspace
}

export const deleteWorkspace = async (workspaceId: string) => {
  await prisma.workspace.delete({
    where: { id: workspaceId }
  })

  return true
}