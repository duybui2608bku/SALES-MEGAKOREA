export interface ProductType {
  branch?: string[]
  code: string
  price?: number
  label?: string
  user_id: string
  is_active?: boolean
  is_consumable?: boolean
  category?: string
  type?: string
  name: string
  unit?: string
  inStock?: number
}

export interface UpdateProductData {
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
