// Only used in use-chat-handler.tsx to keep it clean

import { createChatFiles } from '#app/utils/chat-files.server'
import { createChat } from '#app/utils/chats.server'
import { createMessageFileItems } from '#app/utils/message-file-items.server'
import { createMessages, updateMessage } from '#app/utils/messages.server'
import {
	buildFinalMessages,
	adaptMessagesForGoogleGemini,
} from '#app/lib/build-prompts'
import { consumeReadableStream } from '#app/lib/consume-stream'
import { DbModels } from '#app/../types/dbModels'
import { ChatFile } from '#app/../types'
import { ChatMessage } from '#app/../types/chat-message.ts'
import { ChatPayload, ChatSettings } from '#app/../types/chat'
import { LLM } from '#app/../types/llms.ts'
import { MessageImage } from '#app/../types/images/message-image.ts'
import React from 'react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

export const validateChatSettings = (
	chatSettings: ChatSettings | null,
	modelData: LLM | undefined,
	profile: DbModels['Profile'] | null,
	selectedWorkspace: DbModels['Workspace'] | null,
	messageContent: string,
) => {
	if (!chatSettings) {
		throw new Error('Chat settings not found')
	}

	if (!modelData) {
		throw new Error('Model not found')
	}

	if (!profile) {
		throw new Error('Profile not found')
	}

	if (!selectedWorkspace) {
		throw new Error('Workspace not found')
	}

	if (!messageContent) {
		throw new Error('Message content not found')
	}
}

export const handleRetrieval = async (
	userInput: string,
	newMessageFiles: ChatFile[],
	chatFiles: ChatFile[],
	embeddingsProvider: 'openai' | 'local',
	sourceCount: number,
) => {
	const response = await fetch('/api/retrieval/retrieve', {
		method: 'POST',
		body: JSON.stringify({
			userInput,
			fileIds: [...newMessageFiles, ...chatFiles].map((file) => file.id),
			embeddingsProvider,
			sourceCount,
		}),
	})

	if (!response.ok) {
		console.error('Error retrieving:', response)
	}

	const { results } = (await response.json()) as {
		results: DbModels['FileItem'][]
	}

	return results
}

export const createTempMessages = (
	messageContent: string,
	chatMessages: ChatMessage[],
	chatSettings: ChatSettings,
	b64Images: string[],
	isRegeneration: boolean,
	setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
) => {
	let tempUserChatMessage: ChatMessage = {
		message: {
			chatId: '',
			assistantId: null,
			content: messageContent,
			createdAt: new Date(),
			id: uuidv4(),
			imagePaths: b64Images,
			model: chatSettings.model,
			role: 'user',
			sequence_number: chatMessages.length,
			updated_at: '',
			user_id: '',
		},
		fileItems: [],
	}

	let tempAssistantChatMessage: ChatMessage = {
		message: {
			chatId: '',
			assistantId: selectedAssistant?.id || null,
			content: '',
			createdAt: new Date(),
			id: uuidv4(),
			imagePaths: [],
			model: chatSettings.model,
			role: 'assistant',
			sequenceNumber: chatMessages.length + 1,
			updatedAt: new Date(),
			userId: '',
		},
		fileItems: [],
	}

	let newMessages = []

	if (isRegeneration) {
		const lastMessageIndex = chatMessages.length - 1
		chatMessages[lastMessageIndex].message.content = ''
		newMessages = [...chatMessages]
	} else {
		newMessages = [
			...chatMessages,
			tempUserChatMessage,
			tempAssistantChatMessage,
		]
	}

	setChatMessages(newMessages)

	return {
		tempUserChatMessage,
		tempAssistantChatMessage,
	}
}

export const handleLocalChat = async (
	payload: ChatPayload,
	profile: DbModels['Profile'],
	chatSettings: ChatSettings,
	tempAssistantMessage: ChatMessage,
	isRegeneration: boolean,
	newAbortController: AbortController,
	setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
	setFirstTokenReceived: React.Dispatch<React.SetStateAction<boolean>>,
	setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
	setToolInUse: React.Dispatch<React.SetStateAction<string>>,
) => {
	const formattedMessages = await buildFinalMessages(payload, profile, [])

	// Ollama API: https://github.com/jmorganca/ollama/blob/main/docs/api.md
	const response = await fetchChatResponse(
		process.env.NEXT_PUBLIC_OLLAMA_URL + '/api/chat',
		{
			model: chatSettings.model,
			messages: formattedMessages,
			options: {
				temperature: payload.chatSettings.temperature,
			},
		},
		false,
		newAbortController,
		setIsGenerating,
		setChatMessages,
	)

	return await processResponse(
		response,
		isRegeneration
			? payload.chatMessages[payload.chatMessages.length - 1]
			: tempAssistantMessage,
		false,
		newAbortController,
		setFirstTokenReceived,
		setChatMessages,
		setToolInUse,
	)
}

export const handleHostedChat = async (
	payload: ChatPayload,
	profile: DbModels['Profile'],
	modelData: LLM,
	tempAssistantChatMessage: ChatMessage,
	isRegeneration: boolean,
	newAbortController: AbortController,
	newMessageImages: MessageImage[],
	chatImages: MessageImage[],
	setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
	setFirstTokenReceived: React.Dispatch<React.SetStateAction<boolean>>,
	setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
	setToolInUse: React.Dispatch<React.SetStateAction<string>>,
) => {
	const provider =
		modelData.provider === 'openai' && profile.useAzureOpenai
			? 'azure'
			: modelData.provider

	let draftMessages = await buildFinalMessages(payload, profile, chatImages)

	let formattedMessages: any[] = []
	if (provider === 'google') {
		formattedMessages = await adaptMessagesForGoogleGemini(
			payload,
			draftMessages,
		)
	} else {
		formattedMessages = draftMessages
	}

	const apiEndpoint =
		provider === 'custom' ? '/api/chat/custom' : `/api/chat/${provider}`

	const requestBody = {
		chatSettings: payload.chatSettings,
		messages: formattedMessages,
		customModelId: provider === 'custom' ? modelData.hostedId : '',
	}

	const response = await fetchChatResponse(
		apiEndpoint,
		requestBody,
		true,
		newAbortController,
		setIsGenerating,
		setChatMessages,
	)

	return await processResponse(
		response,
		isRegeneration
			? payload.chatMessages[payload.chatMessages.length - 1]
			: tempAssistantChatMessage,
		true,
		newAbortController,
		setFirstTokenReceived,
		setChatMessages,
		setToolInUse,
	)
}

export const fetchChatResponse = async (
	url: string,
	body: object,
	isHosted: boolean,
	controller: AbortController,
	setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
	setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
) => {
	const response = await fetch(url, {
		method: 'POST',
		body: JSON.stringify(body),
		signal: controller.signal,
	})

	if (!response.ok) {
		if (response.status === 404 && !isHosted) {
			toast.error(
				'Model not found. Make sure you have it downloaded via Ollama.',
			)
		}

		const errorData = await response.json()

		toast.error(errorData.message)

		setIsGenerating(false)
		setChatMessages((prevMessages) => prevMessages.slice(0, -2))
	}

	return response
}

export const processResponse = async (
	response: Response,
	lastChatMessage: ChatMessage,
	isHosted: boolean,
	controller: AbortController,
	setFirstTokenReceived: React.Dispatch<React.SetStateAction<boolean>>,
	setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
	setToolInUse: React.Dispatch<React.SetStateAction<string>>,
) => {
	let fullText = ''
	let contentToAdd = ''

	if (response.body) {
		await consumeReadableStream(
			response.body,
			(chunk) => {
				setFirstTokenReceived(true)
				setToolInUse('none')

				try {
					contentToAdd = isHosted
						? chunk
						: // Ollama's streaming endpoint returns new-line separated JSON
							// objects. A chunk may have more than one of these objects, so we
							// need to split the chunk by new-lines and handle each one
							// separately.
							chunk
								.trimEnd()
								.split('\n')
								.reduce(
									(acc, line) => acc + JSON.parse(line).message.content,
									'',
								)
					fullText += contentToAdd
				} catch (error) {
					console.error('Error parsing JSON:', error)
				}

				setChatMessages((prev) =>
					prev.map((chatMessage) => {
						if (chatMessage.message.id === lastChatMessage.message.id) {
							const updatedChatMessage: ChatMessage = {
								message: {
									...chatMessage.message,
									content: fullText,
								},
								fileItems: chatMessage.fileItems,
							}

							return updatedChatMessage
						}

						return chatMessage
					}),
				)
			},
			controller.signal,
		)

		return fullText
	} else {
		throw new Error('Response body is null')
	}
}

export const handleCreateChat = async (
	chatSettings: ChatSettings,
	profile: DbModels['Profile'],
	selectedWorkspace: DbModels['Workspace'],
	messageContent: string,
	selectedAssistant: DbModels['Assistant'],
	newMessageFiles: ChatFile[],
	setSelectedChat: React.Dispatch<React.SetStateAction<DbModels['Chat'] | null>>,
	setChats: React.Dispatch<React.SetStateAction<DbModels['Chat'][]>>,
	setChatFiles: React.Dispatch<React.SetStateAction<ChatFile[]>>,
) => {
	const createdChat = await createChat({
		userId: profile.userId,
		workspace_id: selectedWorkspace.id,
		assistant_id: selectedAssistant?.id || null,
		context_length: chatSettings.contextLength,
		include_profile_context: chatSettings.includeProfileContext,
		include_workspace_instructions: chatSettings.includeWorkspaceInstructions,
		model: chatSettings.model,
		name: messageContent.substring(0, 100),
		prompt: chatSettings.prompt,
		temperature: chatSettings.temperature,
		embeddings_provider: chatSettings.embeddingsProvider,
	})

	setSelectedChat(createdChat)
	setChats((chats) => [createdChat, ...chats])

	await createChatFiles(
		newMessageFiles.map((file) => ({
			user_id: profile.user_id,
			chat_id: createdChat.id,
			file_id: file.id,
		})),
	)

	setChatFiles((prev) => [...prev, ...newMessageFiles])

	return createdChat
}

export const handleCreateMessages = async (
	chatMessages: ChatMessage[],
	currentChat: DbModels['Chat'],
	profile: DbModels['Profile'],
	modelData: LLM,
	messageContent: string,
	generatedText: string,
	newMessageImages: MessageImage[],
	isRegeneration: boolean,
	retrievedFileItems: DbModels['FileItems'][],
	setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
	setChatFileItems: React.Dispatch<
		React.SetStateAction<DbModels['FileItem'][]>
	>,
	setChatImages: React.Dispatch<React.SetStateAction<MessageImage[]>>,
	selectedAssistant: DbModels['Assistant'] | null,
) => {
	const finalUserMessage: TablesInsert<'messages'> = {
		chat_id: currentChat.id,
		assistant_id: null,
		user_id: profile.userId,
		content: messageContent,
		model: modelData.modelId,
		role: 'user',
		sequence_number: chatMessages.length,
		image_paths: [],
	}

	const finalAssistantMessage: TablesInsert<'messages'> = {
		chat_id: currentChat.id,
		assistant_id: selectedAssistant?.id || null,
		user_id: profile.userId,
		content: generatedText,
		model: modelData.modelId,
		role: 'assistant',
		sequence_number: chatMessages.length + 1,
		image_paths: [],
	}

	let finalChatMessages: ChatMessage[] = []

	if (isRegeneration) {
		const lastStartingMessage = chatMessages[chatMessages.length - 1].message

		const updatedMessage = await updateMessage(lastStartingMessage.id, {
			...lastStartingMessage,
			content: generatedText,
		})

		chatMessages[chatMessages.length - 1].message = updatedMessage

		finalChatMessages = [...chatMessages]

		setChatMessages(finalChatMessages)
	} else {
		const createdMessages = await createMessages([
			finalUserMessage,
			finalAssistantMessage,
		])

		// Upload each image (stored in newMessageImages) for the user message to message_images bucket
		const uploadPromises = newMessageImages
			.filter((obj) => obj.file !== null)
			.map((obj) => {
				let filePath = `${profile.userId}/${currentChat.id}/${
					createdMessages[0].id
				}/${uuidv4()}`

				return uploadMessageImage(filePath, obj.file as File).catch((error) => {
					console.error(`Failed to upload image at ${filePath}:`, error)
					return null
				})
			})

		const paths = (await Promise.all(uploadPromises)).filter(
			Boolean,
		) as string[]

		setChatImages((prevImages) => [
			...prevImages,
			...newMessageImages.map((obj, index) => ({
				...obj,
				messageId: createdMessages[0].id,
				path: paths[index],
			})),
		])

		const updatedMessage = await updateMessage(createdMessages[0].id, {
			...createdMessages[0],
			image_paths: paths,
		})

		const createdMessageFileItems = await createMessageFileItems(
			retrievedFileItems.map((fileItem) => {
				return {
					user_id: profile.user_id,
					message_id: createdMessages[1].id,
					file_item_id: fileItem.id,
				}
			}),
		)

		finalChatMessages = [
			...chatMessages,
			{
				message: updatedMessage,
				fileItems: [],
			},
			{
				message: createdMessages[1],
				fileItems: retrievedFileItems.map((fileItem) => fileItem.id),
			},
		]

		setChatFileItems((prevFileItems) => {
			const newFileItems = retrievedFileItems.filter(
				(fileItem) =>
					!prevFileItems.some((prevItem) => prevItem.id === fileItem.id),
			)

			return [...prevFileItems, ...newFileItems]
		})

		setChatMessages(finalChatMessages)
	}
}
