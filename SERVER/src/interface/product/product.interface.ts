import { ObjectId } from 'mongodb'

export interface ProductCategoryType {
  _id?: ObjectId
  name: string
  user_id?: ObjectId[]
  created_at?: Date
  updated_at?: Date
}

export interface ProductType {
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

export interface UpdateProductData {
  id: string
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
