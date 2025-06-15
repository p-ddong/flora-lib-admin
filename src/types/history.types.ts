import { PlantDetail } from "./plant.types"

export interface RawHistoryItem {
  _id: string
  action: "create" | "edit" | "update" | "delete" | "rollback"
  plant?: string
  before?: PlantDetail
  updatedBy: string
  createdAt: string
  updatedAt: string
}

export interface HistoryResponse {
  data: RawHistoryItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface HistoryAction {
  id: string
  type: "create" | "edit" | "delete" | "update" | "rollback"
  description: string
  timestamp: Date
  user: string
  details?: string
  canUndo: boolean
  undone?: boolean
  plant?: string
}