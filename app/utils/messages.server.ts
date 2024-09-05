import { prisma } from './db.server.ts'
import type { Prisma } from '@prisma/client'

export const getMessageById = async (messageId: string) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId }
  })

  if (!message) {
    throw new Error("Message not found")
  }

  return message
}

export const getMessagesByChatId = async (chatId: string) => {
  const messages = await prisma.message.findMany({
    where: { chatId: chatId },
    include: {
      imagePaths: true,
    }
  })

  if (!messages) {
    throw new Error("Messages not found")
  }

  return messages
}

export const createMessage = async (message: Prisma.MessageCreateInput) => {
  const createdMessage = await prisma.message.create({
    data: message,
  })

  if (!createdMessage) {
    throw new Error("Failed to create message")
  }

  return createdMessage
}

export const createMessages = async (messages: Prisma.MessageCreateInput[]) => {
  const createdMessages = await prisma.$transaction(
    messages.map(message => prisma.message.create({ data: message }))
  )

  if (!createdMessages) {
    throw new Error("Failed to create messages")
  }

  return createdMessages
}

export const updateMessage = async (
  messageId: string,
  message: Prisma.MessageUpdateInput
) => {
  const updatedMessage = await prisma.message.update({
    where: { id: messageId },
    data: message,
  })

  if (!updatedMessage) {
    throw new Error("Failed to update message")
  }

  return updatedMessage
}

export const deleteMessage = async (messageId: string) => {
  await prisma.message.delete({
    where: { id: messageId }
  })

  return true
}

export async function deleteMessagesIncludingAndAfter(
  userId: string,
  chatId: string,
  sequenceNumber: number
) {
  try {
    await prisma.message.deleteMany({
      where: {
        userId: userId,
        chatId: chatId,
        sequenceNumber: {
          gte: sequenceNumber
        }
      }
    })
    return true
  } catch (error) {
    return {
      error: "Failed to delete messages."
    }
  }
}