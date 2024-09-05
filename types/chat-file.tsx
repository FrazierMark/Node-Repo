import { DbModels } from './dbModels'

export interface ChatFile {
  id: string
  name: string
  type: string
  file: File | null
}
