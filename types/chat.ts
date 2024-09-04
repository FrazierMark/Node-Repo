import { DbModels } from "./dbModels.ts"
import { ChatMessage, LLMID } from "."

export interface ChatSettings {
  model: LLMID
  prompt: string
  temperature: number
  contextLength: number
  includeProfileContext: boolean
  includeWorkspaceInstructions: boolean
  embeddingsProvider: "openai" | "local"
}

export interface ChatPayload {
  chatSettings: ChatSettings
  workspaceInstructions: string
  chatMessages: ChatMessage[]
  assistant: DbModels["Assistant"] | null
  messageFileItems: DbModels["FileItem"][]
  chatFileItems: DbModels["FileItem"][]
}

export interface ChatAPIPayload {
  chatSettings: ChatSettings
  messages: DbModels["Message"][]
}
