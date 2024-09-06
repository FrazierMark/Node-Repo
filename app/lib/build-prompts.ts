import { DbModels } from "#app/../types/dbModels"
import { ChatPayload } from "#app/../types/chat"
import { MessageImage } from "#app/../types/images/message-image"
import { encode } from "gpt-tokenizer"
import { getBase64FromDataURL, getMediaTypeFromDataURL } from "#app/lib/utils"

const buildBasePrompt = (
  prompt: string,
  profileContext: string,
  workspaceInstructions: string,
  assistant: DbModels["Assistant"] | null
) => {
  let fullPrompt = ""

  if (assistant) {
    fullPrompt += `<INJECT ROLE>\nYou are not an AI. You are ${assistant.name}.\n</INJECT ROLE>\n\n`
  }

  fullPrompt += `Today is ${new Date().toLocaleDateString()}.\n\n`

  if (profileContext) {
    fullPrompt += `User Info:\n${profileContext}\n\n`
  }

  if (workspaceInstructions) {
    fullPrompt += `System Instructions:\n${workspaceInstructions}\n\n`
  }

  fullPrompt += `User Instructions:\n${prompt}`

  return fullPrompt
}

export async function buildFinalMessages(
  payload: ChatPayload,
  profile: DbModels["Profile"],
  chatImages: MessageImage[]
) {
  const {
    chatSettings,
    workspaceInstructions,
    chatMessages,
    assistant,
    messageFileItems,
    chatFileItems
  } = payload

  const BUILT_PROMPT = buildBasePrompt(
    chatSettings.prompt,
    chatSettings.includeProfileContext ? profile.profileContext || "" : "",
    chatSettings.includeWorkspaceInstructions ? workspaceInstructions : "",
    assistant
  )

  const CHUNK_SIZE = chatSettings.contextLength
  const PROMPT_TOKENS = encode(chatSettings.prompt).length

  let remainingTokens = CHUNK_SIZE - PROMPT_TOKENS

  let usedTokens = 0
  usedTokens += PROMPT_TOKENS

  const processedChatMessages = chatMessages.map((chatMessage, index) => {
    const nextChatMessage = chatMessages[index + 1]

    if (nextChatMessage === undefined) {
      return chatMessage
    }

    const nextChatMessageFileItems = nextChatMessage.fileItems

    if (nextChatMessageFileItems.length > 0) {
      const findFileItems = nextChatMessageFileItems
        .map(fileItemId =>
          chatFileItems.find(chatFileItem => chatFileItem.id === fileItemId)
        )
        .filter(item => item !== undefined) as DbModels["FileItem"][]

      const retrievalText = buildRetrievalText(findFileItems)

      return {
        message: {
          ...chatMessage.message,
          content:
            `${chatMessage.message.content}\n\n${retrievalText}` as string
        },
        fileItems: []
      }
    }

    return chatMessage
  })

  let finalMessages = []

  for (let i = processedChatMessages.length - 1; i >= 0; i--) {
    const chatMessage = processedChatMessages[i];
    if (!chatMessage?.message) continue;
    const message = chatMessage.message;
    const messageTokens = encode(message.content).length

    if (messageTokens <= remainingTokens) {
      remainingTokens -= messageTokens
      usedTokens += messageTokens
      finalMessages.unshift(message)
    } else {
      break
    }
  }

  let tempSystemMessage: DbModels["Message"] = {
    chatId: "",
    assistantId: null,
    content: BUILT_PROMPT,
    createdAt: new Date(),
    id: processedChatMessages.length + "",
    imagePaths: [],
    model: payload.chatSettings.model,
    role: "system",
    sequenceNumber: processedChatMessages.length,
    updatedAt: new Date(),
    userId: "",
    // Add the missing properties
    chat: {} as DbModels["Chat"],
    user: {} as DbModels["User"],
    assistant: {} as DbModels["Assistant"],
    MessageFileItem: []
  }

  finalMessages.unshift(tempSystemMessage)

  finalMessages = finalMessages.map(message => {
    let content

    if (message.imagePaths.length > 0) {
      content = [
        {
          type: "text",
          text: message.content
        },
        ...message.imagePaths.map(path => {
          let formedUrl = ""

          if (typeof path === 'string' && (path as string).startsWith("data")) {
            formedUrl = path
          } else {
            const chatImage = chatImages.find(image => 
              typeof path === 'string' && image.path === path
            )

            if (chatImage) {
              formedUrl = chatImage.base64
            }
          }

          return {
            type: "image_url",
            image_url: {
              url: formedUrl
            }
          }
        })
      ]
    } else {
      content = message.content
    }

    return {
      role: message.role,
      content
    }
  })

  if (messageFileItems.length > 0) {
    const retrievalText = buildRetrievalText(messageFileItems)

    if (finalMessages.length > 0) {
      const lastMessage = finalMessages[finalMessages.length - 1];
      if (lastMessage) {
        finalMessages[finalMessages.length - 1] = {
          ...lastMessage,
          role: lastMessage.role || 'user',
          content: `${lastMessage.content}\n\n${retrievalText}`
        };
      }
    }
  }

  return finalMessages
}

function buildRetrievalText(fileItems: DbModels["FileItem"][]) {
  const retrievalText = fileItems
    .map(item => `<BEGIN SOURCE>\n${item.content}\n</END SOURCE>`)
    .join("\n\n")

  return `You may use the following sources if needed to answer the user's question. If you don't know the answer, say "I don't know."\n\n${retrievalText}`
}

function adaptSingleMessageForGoogleGemini(message: any) {

  let adaptedParts = []

  let rawParts = []
  if(!Array.isArray(message.content)) {
    rawParts.push({type: 'text', text: message.content})
  } else {
    rawParts = message.content
  }

  for(let i = 0; i < rawParts.length; i++) {
    let rawPart = rawParts[i]

    if(rawPart.type == 'text') {
      adaptedParts.push({text: rawPart.text})
    } else if(rawPart.type === 'image_url') {
      adaptedParts.push({
        inlineData: {
          data: getBase64FromDataURL(rawPart.image_url.url),
          mimeType: getMediaTypeFromDataURL(rawPart.image_url.url),
        }
      })
    }
  }

  let role = 'user'
  if(["user", "system"].includes(message.role)) {
    role = 'user'
  } else if(message.role === 'assistant') {
    role = 'model'
  }

  return {
    role: role,
    parts: adaptedParts
  }
}

function adaptMessagesForGeminiVision(
  messages: any[]
) {
  // Gemini Pro Vision cannot process multiple messages
  // Reformat, using all texts and last visual only

  const basePrompt = messages[0].parts[0].text
  const baseRole = messages[0].role
  const lastMessage = messages[messages.length-1]
  const visualMessageParts = lastMessage.parts;
  let visualQueryMessages = [{
    role: "user",
    parts: [
      `${baseRole}:\n${basePrompt}\n\nuser:\n${visualMessageParts[0].text}\n\n`,
      visualMessageParts.slice(1)
    ]
  }]
  return visualQueryMessages
}

export async function adaptMessagesForGoogleGemini(
  payload: ChatPayload,
  messages:  any[]
) {
  let geminiMessages = []
  for (let i = 0; i < messages.length; i++) {
    let adaptedMessage = adaptSingleMessageForGoogleGemini(messages[i])
    geminiMessages.push(adaptedMessage)
  }

  if(payload.chatSettings.model === "gemini-pro-vision") {
    geminiMessages = adaptMessagesForGeminiVision(geminiMessages)
  }
  return geminiMessages
}

