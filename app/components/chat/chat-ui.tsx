import { ScreenLoader } from '../ui/screen-loader'
import { useChatHandler } from '#app/components/chat/chat-hooks/use-chat-handler'
import { ChatbotUIContext } from '../../../context/context'
import { getAssistantToolsByAssistantId } from '../../utils/assistant-tools.server'
import { getChatFilesByChatId } from '../../utils/chat-files.server'
import { getChatById } from '../../utils/chats.server'
import { getMessageFileItemsByMessageId } from '../../utils/message-file-items.server'
import { getMessagesByChatId } from '../../utils/messages.server'
import { getMessageImageFromStorage } from '../../utils/images.server'
import { convertBlobToBase64 } from '../../lib/blob-to-b64'
import useHotkey from '../../lib/hooks/use-hotkey'
import { LLMID, MessageImage } from '../../../types'
import { useParams } from '@remix-run/react'
import { FC, useContext, useEffect, useState } from 'react'
import { ChatHelp } from './chat-help'
import { useScroll } from './chat-hooks/use-scroll'
import { ChatInput } from './chat-input'
import { ChatMessages } from './chat-messages'
import { ChatScrollButtons } from './chat-scroll-buttons'
import { ChatSecondaryButtons } from './chat-secondary-buttons'
import { DbModels } from '#app/../types/dbModels'

interface ChatUIProps {}

export const ChatUI: FC<ChatUIProps> = ({}) => {
	useHotkey('o', () => handleNewChat())

	const params = useParams()

	const {
		setChatMessages,
		selectedChat,
		setSelectedChat,
		setChatSettings,
		setChatImages,
		setChatFileItems,
		setChatFiles,
		setShowFilesDisplay,
		setUseRetrieval,
	} = useContext(ChatbotUIContext)

	const { handleNewChat, handleFocusChatInput } = useChatHandler()

	const {
		messagesStartRef,
		messagesEndRef,
		handleScroll,
		scrollToBottom,
		setIsAtBottom,
		isAtTop,
		isAtBottom,
		isOverflowing,
		scrollToTop,
	} = useScroll()

	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchData = async () => {
			await fetchMessages()
			await fetchChat()

			scrollToBottom()
			setIsAtBottom(true)
		}

		if (params.chatid) {
			fetchData().then(() => {
				handleFocusChatInput()
				setLoading(false)
			})
		} else {
			setLoading(false)
		}
	}, [])

  const fetchMessages = async () => {
    const fetchedMessages = await getMessagesByChatId(params.chatid as string)

    const imagePromises: Promise<MessageImage>[] = fetchedMessages.flatMap(
      message =>
        message.imagePaths
          ? message.imagePaths.map(async imagePath => {
              const url = await getMessageImageFromStorage(imagePath.path)

              if (url) {
                const response = await fetch(url)
                const blob = await response.blob()
                const base64 = await convertBlobToBase64(blob)

                return {
                  messageId: message.id,
                  path: imagePath.path,
                  base64,
                  url,
                  file: null
                }
              }

              return {
                messageId: message.id,
                path: imagePath.path,
                base64: "",
                url,
                file: null
              }
            })
          : []
    )

		const images: MessageImage[] = await Promise.all(imagePromises.flat())
		setChatImages(images)

		const messageFileItemPromises = fetchedMessages.map(
			async (message: { id: string }) =>
				await getMessageFileItemsByMessageId(message.id),
		)

    const messageFileItems = await Promise.all(messageFileItemPromises)
		const transformedFileItems = messageFileItems.flatMap((item) => item.file_items)

    // @ts-expect-error Temporarily ignoring type mismatch until we update the types
    setChatFileItems(transformedFileItems)

		const chatFiles = await getChatFilesByChatId(params.chatid as string)

		setChatFiles(
      chatFiles.files.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        file: null
      }))
    )

		setUseRetrieval(true)
		setShowFilesDisplay(true)

		const fetchedChatMessages = fetchedMessages.map((message) => {
			return {
				message,
				fileItems: messageFileItems
					.filter((messageFileItem) => messageFileItem.id === message.id)
					.flatMap((messageFileItem) =>
						messageFileItem.file_items.map((fileItem) => fileItem.id),
					),
			}
		})

    // @ts-expect-error Temporarily ignoring type mismatch until we update the types
		setChatMessages(fetchedChatMessages)
	}

	const fetchChat = async () => {
		const chat = await getChatById(params.chatid as string)
		if (!chat) return

    // @ts-expect-error Temporarily ignoring type mismatch until we update the types
		setSelectedChat(chat)
		setChatSettings({
			model: chat.model as LLMID,
			prompt: chat.prompt,
			temperature: chat.temperature,
			contextLength: chat.contextLength,
			includeProfileContext: chat.includeProfileContext,
			includeWorkspaceInstructions: chat.includeWorkspaceInstructions,
			embeddingsProvider: chat.embeddingsProvider as 'openai' | 'local',
		})
	}

	if (loading) {
		return <ScreenLoader />
	}

	return (
		<div className="relative flex h-full flex-col items-center">
			<div className="absolute left-4 top-2.5 flex justify-center">
				<ChatScrollButtons
					isAtTop={isAtTop}
					isAtBottom={isAtBottom}
					isOverflowing={isOverflowing}
					scrollToTop={scrollToTop}
					scrollToBottom={scrollToBottom}
				/>
			</div>

			<div className="absolute right-4 top-1 flex h-[40px] items-center space-x-2">
				<ChatSecondaryButtons />
			</div>

			<div className="flex max-h-[50px] min-h-[50px] w-full items-center justify-center border-b-2 bg-secondary font-bold">
				<div className="max-w-[200px] truncate sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px]">
					{selectedChat?.name || 'Chat'}
				</div>
			</div>

			<div
				className="flex size-full flex-col overflow-auto border-b"
				onScroll={handleScroll}
			>
				<div ref={messagesStartRef} />

				<ChatMessages />

				<div ref={messagesEndRef} />
			</div>

			<div className="relative w-full min-w-[300px] items-end px-2 pb-3 pt-0 sm:w-[600px] sm:pb-8 sm:pt-5 md:w-[700px] lg:w-[700px] xl:w-[800px]">
				<ChatInput />
			</div>

			<div className="absolute bottom-2 right-2 hidden md:block lg:bottom-4 lg:right-4">
				<ChatHelp />
			</div>
		</div>
	)
}
