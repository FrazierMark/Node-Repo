import { expect, test } from 'vitest'
import { getMessageFileItemsByMessageId } from './message-file-items.server'
import { prisma } from './db.server'

test('getMessageFileItemsByMessageId returns correct data', async () => {
  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      username: 'testuser',
    }
  })

  // Create a test workspace
  const workspace = await prisma.workspace.create({
    data: {
      userId: user.id,
      name: 'Test Workspace',
      defaultContextLength: 2000,
      defaultModel: 'gpt-3.5-turbo',
      defaultPrompt: 'Default prompt',
      defaultTemperature: 0.7,
      description: 'Test description',
      instructions: 'Test instructions',
      includeProfileContext: false,
      includeWorkspaceInstructions: false,
      embeddingsProvider: 'openai',
    }
  })

  // Create a test chat
  const chat = await prisma.chat.create({
    data: {
      userId: user.id,
      workspaceId: workspace.id,
      name: 'Test Chat',
      model: 'gpt-3.5-turbo',
      prompt: 'Test prompt',
      temperature: 0.7,
      contextLength: 2000,
      includeProfileContext: false,
      includeWorkspaceInstructions: false,
      embeddingsProvider: 'openai',
    }
  })

  // Create a test message
  const message = await prisma.message.create({
    data: {
      chatId: chat.id,
      userId: user.id,
      content: 'Test message content',
      model: 'gpt-3.5-turbo',
      role: 'user',
      sequenceNumber: 1,
    }
  })

  // Create a test file
  const file = await prisma.file.create({
    data: {
      userId: user.id,
      name: 'Test File',
      description: 'Test description',
      filePath: 'test/path',
      size: 100,
      tokens: 100,
      type: 'test',
    }
  })

  // Create a test file item
  const fileItem = await prisma.fileItem.create({
    data: {
      fileId: file.id,
      userId: user.id,
      tokens: 100,
      sharing: 'private',
      content: 'Test file item content',
      localEmbedding: 'Test local embedding',
      openaiEmbedding: 'Test openai embedding',
    }
  })

  // Create a test message file item
  await prisma.messageFileItem.create({
    data: {
      userId: user.id,
      messageId: message.id,
      fileItemId: fileItem.id,
    }
  })

  // Call the function with the test message ID
  const result = await getMessageFileItemsByMessageId(message.id)

  console.log(result)
  console.log(result.file_items[0])

  // Assert the expected structure and content of the result
  expect(result).toHaveProperty('id')
  expect(result.id).toBe(message.id)
  expect(result).toHaveProperty('file_items')
  expect(result.file_items).toHaveLength(1)
  expect(result.file_items[0]).toHaveProperty('fileItemId')

  // Clean up
  await prisma.messageFileItem.deleteMany({ where: { messageId: message.id } })
  await prisma.message.delete({ where: { id: message.id } })
  await prisma.fileItem.delete({ where: { id: fileItem.id } })
  await prisma.file.delete({ where: { id: file.id } })
  await prisma.chat.delete({ where: { id: chat.id } })
  await prisma.workspace.delete({ where: { id: workspace.id } })
  await prisma.user.delete({ where: { id: user.id } })
})