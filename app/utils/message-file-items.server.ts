import { prisma } from '#app/utils/db.server'
import type { MessageFileItem } from '@prisma/client'

export async function getMessageFileItemsByMessageId(messageId: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      MessageFileItem: true
    }
  })

  if (!message) {
    throw new Error("Message not found")
  }

  return {
    id: message.id,
    file_items: message.MessageFileItem
  }
}

export async function createMessageFileItems(
  messageFileItems: Omit<MessageFileItem, 'id'>[]
) {
  const createdMessageFileItems = await prisma.$transaction(
    messageFileItems.map(item =>
      prisma.messageFileItem.create({
        data: item
      })
    )
  )

  return createdMessageFileItems
}