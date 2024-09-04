import { DbModels } from "./dbModels.ts"

export type DataListType =
  | DbModels["Collection"][]
  | DbModels["Chat"][]
  | DbModels["Preset"][]
  | DbModels["Prompt"][]
  | DbModels["File"][]
  | DbModels["Assistant"][]
  | DbModels["Tool"][]

export type DataItemType =
  | DbModels["Collection"]
  | DbModels["Chat"]
  | DbModels["Preset"]
  | DbModels["Prompt"]
  | DbModels["File"]
  | DbModels["Assistant"]
  | DbModels["Tool"]
