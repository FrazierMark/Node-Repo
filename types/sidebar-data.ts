import { DbModels } from "./dbModels.ts"

export type DataListType =
  | DbModels["Chat"][]
  | DbModels["Preset"][]
  | DbModels["Prompt"][]

export type DataItemType =
  | DbModels["Chat"]
  | DbModels["Preset"]
  | DbModels["Prompt"]
