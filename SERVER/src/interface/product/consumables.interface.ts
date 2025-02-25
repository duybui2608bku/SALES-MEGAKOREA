import { ObjectId } from 'mongodb'

export interface ConsumablesType {
  _id?: ObjectId
  branch?: string[]
  code?: string
  price?: number
  label?: string
  category?: string
  type?: string
  name: string
  unit?: string
  inStock?: number
}

export interface CreateConsumablesData {
  branch?: string[]
  code?: string
  price?: number
  label?: string
  category?: string
  type?: string
  name: string
  unit?: string
  inStock?: number
}

export interface UpdateConsumablesData {
  id: string
  branch?: string[]
  code?: string
  price?: number
  label?: string
  category?: string
  type?: string
  name: string
  unit?: string
  inStock?: number
}
