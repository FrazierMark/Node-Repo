import { ChatbotUIContext } from "#app/../context/context"
import { FC, useContext } from "react"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"
import { PromptPicker } from "./prompt-picker"

interface ChatCommandInputProps {}

export const ChatCommandInput: FC<ChatCommandInputProps> = ({}) => {
  const {
    newMessageFiles,
    chatFiles,
    slashCommand,
    isFilePickerOpen,
    setIsFilePickerOpen,
    hashtagCommand,
    focusPrompt,
    focusFile
  } = useContext(ChatbotUIContext)

  const { handleSelectUserFile, handleSelectUserCollection } =
    usePromptAndCommand()

  return (
    <>
      <PromptPicker />
    </>
  )
}
