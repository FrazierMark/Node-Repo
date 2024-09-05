import { prisma } from '#app/utils/db.server'
import type { Prisma } from '@prisma/client'

export const getChatById = async (chatId: string) => {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId }
  })

  return chat
}

export const getChatsByWorkspaceId = async (workspaceId: string) => {
  const chats = await prisma.chat.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' }
  })

  if (!chats) {
    throw new Error("Chats not found")
  }

  return chats
}

export const createChat = async (chat: Prisma.ChatCreateInput) => {
  const createdChat = await prisma.chat.create({
    data: chat
  })

  if (!createdChat) {
    throw new Error("Failed to create chat")
  }

  return createdChat
}

export const createChats = async (chats: Prisma.ChatCreateInput[]) => {
  const createdChats = await prisma.$transaction(
    chats.map(chat => prisma.chat.create({ data: chat }))
  )

  if (!createdChats) {
    throw new Error("Failed to create chats")
  }

  return createdChats
}

export const updateChat = async (
  chatId: string,
  chat: Prisma.ChatUpdateInput
) => {
  const updatedChat = await prisma.chat.update({
    where: { id: chatId },
    data: chat
  })

  if (!updatedChat) {
    throw new Error("Failed to update chat")
  }

  return updatedChat
}

export const deleteChat = async (chatId: string) => {
  await prisma.chat.delete({
    where: { id: chatId }
  })

  return true
}