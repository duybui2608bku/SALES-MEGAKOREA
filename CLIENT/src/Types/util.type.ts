export interface SuccessResponse<Data = void> {
  mesage: string
  success: boolean
  result: Data
}

export interface SuccessArrayResponse<Data = void> {
  mesage: string
  success: boolean
  result: Data[]
}

export interface PaginationType {
  page: number
  limit: number
  total: number
}
