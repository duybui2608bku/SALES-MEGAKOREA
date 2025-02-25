import { ObjectId } from 'mongodb'

export interface ProductCategoryType {
  _id?: ObjectId
  name: string
  user_id?: ObjectId[]
  created_at?: Date
  updated_at?: Date
}

export interface UpdateConsumablesData {
  id: string
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
