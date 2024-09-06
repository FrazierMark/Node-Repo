import { prisma } from './db.server.ts'

export const getAssistantFilesByAssistantId = async (assistantId: string) => {
  const assistantFiles = await prisma.assistant.findUnique({
    where: { id: assistantId },
    select: {
      id: true,
      name: true,
      AssistantFile: {
        select: {
          file: true
        }
      }
    }
  })

  if (!assistantFiles) {
    throw new Error("Assistant not found")
  }

  return {
    ...assistantFiles,
    files: assistantFiles.AssistantFile.map(af => af.file)
  }
}

export const createAssistantFile = async (
  assistantFile: {
    userId: string
    assistantId: string
    fileId: string
  }
) => {
  const createdAssistantFile = await prisma.assistantFile.create({
    data: assistantFile,
    include: {
      assistant: true,
      file: true
    }
  })

  return createdAssistantFile
}

export const createAssistantFiles = async (
  assistantFiles: {
    userId: string
    assistantId: string
    fileId: string
  }[]
) => {
  const createdAssistantFiles = await prisma.assistantFile.createMany({
    data: assistantFiles
  })

  return createdAssistantFiles
}

export const deleteAssistantFile = async (
  assistantId: string,
  fileId: string
) => {
  await prisma.assistantFile.delete({
    where: {
      assistantId_fileId: {
        assistantId,
        fileId
      }
    }
  })

  return true
}