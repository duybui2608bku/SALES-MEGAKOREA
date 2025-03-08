export interface CreateProductRequestBody {
  branch?: string[]
  code: string
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

export interface DeleteProductRequestParams {
  id: string
}

export interface UpdateProductRequestBody {
  _id: string
  branch?: string[]
  code: string
  price?: number
  label?: string
  is_consumable?: boolean
  category?: string
  type?: string
  name: string
  unit?: string
  inStock?: number
}

export interface CreateProductGeneralRequestBody {
  branch?: string[]
  code: string
  price?: number
  label?: string
  category?: string
  type?: string
  name: string
  unit?: string
  inStock?: number
}

export interface GetAllProductRequestQuery {
  page: string
  limit: string
  branch: string
  is_consumable: boolean
}

export interface SearchProductRequestQuery {
  q: string
  branch?: string
  is_consumable: boolean
}
