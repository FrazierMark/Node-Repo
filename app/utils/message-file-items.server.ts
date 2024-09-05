import { prisma } from '#app/utils/db.server'
import type { MessageFileItem } from '@prisma/client'

export const getMessageFileItemsByMessageId = async (messageId: string) => {
  const messageFileItems = await prisma.message.findUnique({
    where: {
      id: messageId
    },
    select: {
      id: true,
      MessageFileItem: {
        select: {
          fileItem: {
            include: {
              file: {
                select: {
                  id: true,
                  userId: true,
                  folderId: true,
                  createdAt: true,
                  updatedAt: true,
                  sharing: true,
                  description: true,
                  filePath: true,
                  name: true,
                  size: true,
                  tokens: true,
                  type: true,
                }
              },
              user: {
                select: {
                  id: true,
                  email: true,
                  username: true,
                  name: true,
                  createdAt: true,
                  updatedAt: true,
                }
              },
              MessageFileItem: {
                select: {
                  userId: true,
                  messageId: true,
                  fileItemId: true,
                  createdAt: true,
                  updatedAt: true,
                }
              }
            }
          }
        }
      }
    }
  })

  if (!messageFileItems) {
    throw new Error("Message not found")
  }

  return {
    id: messageFileItems.id,
    file_items: messageFileItems.MessageFileItem.map(item => ({
      ...item.fileItem,
      file: item.fileItem.file,
      user: item.fileItem.user,
      MessageFileItem: item.fileItem.MessageFileItem
    }))
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