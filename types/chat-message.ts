import { DbModels } from "./dbModels.ts"

export interface ChatMessage {
  message: DbModels["Message"]
  fileItems: string[]
}
