export interface CreateProductRequestBody {
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
}

export interface ProductGeneralInterface {
  _id: string
  branch: string[]
  code: string
  price: number
  user_name: string
  category: string
  name: string
  unit: string
  inStock: number
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
