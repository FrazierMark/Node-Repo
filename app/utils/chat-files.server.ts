import { prisma } from './db.server.ts'
import type { Prisma } from '@prisma/client'

export const getChatFilesByChatId = async (chatId: string) => {
  const chatFiles = await prisma.chat.findUnique({
    where: { id: chatId },
    select: {
      id: true,
      name: true,
      ChatFile: {
        select: {
          file: true
        }
      }
    }
  })

  if (!chatFiles) {
    throw new Error("Chat not found")
  }

  return {
    id: chatFiles.id,
    name: chatFiles.name,
    files: chatFiles.ChatFile.map((cf: { file: any }) => cf.file)
  }
}

export const createChatFile = async (
  chatFile: Prisma.ChatFileCreateInput
) => {
  const createdChatFile = await prisma.chatFile.create({
    data: chatFile,
    include: {
      file: true
    }
  })

  if (!createdChatFile) {
    throw new Error("Failed to create chat file")
  }

  return createdChatFile
}

export const createChatFiles = async (
  chatFiles: Prisma.ChatFileCreateInput[]
) => {
  const createdChatFiles = await prisma.$transaction(
    chatFiles.map(file => 
      prisma.chatFile.create({
        data: file,
        include: {
          file: true
        }
      })
    )
  )

  if (!createdChatFiles) {
    throw new Error("Failed to create chat files")
  }

  return createdChatFiles
}