import { BranchType } from '../branch/branch.interface'

export interface CreateProductRequestBody {
  _id: string
  branch?: string[]
  code?: string
  price?: number
  label?: string
  user_id: string
  is_consumable?: boolean
  category?: string
  type?: string
  name: string
  unit?: string
  inStock?: number
  [key: string]: unknown
}

export interface UpdateProductBody {
  _id: string
  branch?: string[]
  code?: string
  price?: number
  label?: string
  is_active?: boolean
  is_consumable?: boolean
  category?: string
  type?: string
  name?: string
  unit?: string
  inStock?: number
  [key: string]: unknown
}

export interface UpdateProductStockRequestBody {
  _id: string
  isIncrease: boolean
  inStockOldValue: number
  inStockNewValue: number
  [key: string]: unknown
}

export interface ProductGeneralInterface {
  _id: string
  branch: BranchType[]
  code: string
  price: number
  user_name: string
  is_active: boolean
  user_id: string
  is_consumable: boolean
  category: string
  name: string
  unit: string
  inStock: number
  create_at: Date
  update_at: Date
}

export interface GetAllProductRequestQuery {
  page: number
  limit: number
  branch?: string
}

export interface SearchProductRequestQuery {
  branch?: string
  q: string
}
