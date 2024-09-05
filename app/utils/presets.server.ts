import { prisma } from './db.server.ts'
import { Preset, PresetWorkspace } from "@prisma/client"

export const getPresetById = async (presetId: string) => {
  const preset = await prisma.preset.findUnique({
    where: { id: presetId }
  })

  if (!preset) {
    throw new Error("Preset not found")
  }

  return preset
}

export const getPresetWorkspacesByWorkspaceId = async (workspaceId: string) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      PresetWorkspace: {
        include: {
          preset: true
        }
      }
    }
  })

  if (!workspace) {
    throw new Error("Workspace not found")
  }

  return workspace
}

export const getPresetWorkspacesByPresetId = async (presetId: string) => {
  const preset = await prisma.preset.findUnique({
    where: { id: presetId },
    include: {
      PresetWorkspace: {
        include: {
          workspace: true
        }
      }
    }
  })

  if (!preset) {
    throw new Error("Preset not found")
  }

  return preset
}

export const createPreset = async (
  preset: Omit<Preset, "id" | "createdAt" | "updatedAt">,
  workspaceId: string
) => {
  const createdPreset = await prisma.preset.create({
    data: preset
  })

  await createPresetWorkspace({
    userId: preset.userId,
    presetId: createdPreset.id,
    workspaceId: workspaceId
  })

  return createdPreset
}

export const createPresets = async (
  presets: Omit<Preset, "id" | "createdAt" | "updatedAt">[],
  workspaceId: string
) => {
  const createdPresets = await Promise.all(
    presets.map(preset => prisma.preset.create({ data: preset }))
  );

  await createPresetWorkspaces(
    createdPresets.map(createdPreset => ({
      userId: createdPreset.userId,
      presetId: createdPreset.id,
      workspaceId
    }))
  );

  return createdPresets;
}

export const createPresetWorkspace = async (item: Omit<PresetWorkspace, "createdAt" | "updatedAt">) => {
  return await prisma.presetWorkspace.create({
    data: item
  })
}

export const createPresetWorkspaces = async (
  items: Omit<PresetWorkspace, "createdAt" | "updatedAt">[]
) => {
  return await prisma.presetWorkspace.createMany({
    data: items
  })
}

export const updatePreset = async (
  presetId: string,
  preset: Partial<Omit<Preset, "id" | "createdAt" | "updatedAt">>
) => {
  return await prisma.preset.update({
    where: { id: presetId },
    data: preset
  })
}

export const deletePreset = async (presetId: string) => {
  await prisma.preset.delete({
    where: { id: presetId }
  })

  return true
}

export const deletePresetWorkspace = async (
  presetId: string,
  workspaceId: string
) => {
  await prisma.presetWorkspace.delete({
    where: {
      presetId_workspaceId: {
        presetId,
        workspaceId
      }
    }
  })

  return true
}