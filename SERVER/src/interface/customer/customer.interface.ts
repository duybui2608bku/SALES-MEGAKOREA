import { ObjectId } from 'mongodb'

export interface CreateCustomerData {
  branch: ObjectId
  date?: string
  source?: string
  name?: string
  phone: string
  address?: string
  sex?: string
}

export interface CustomerType {
  _id?: ObjectId | string
  branch: ObjectId
  date?: string
  source?: string
  name?: string
  phone: string
  address?: string
  sex?: string
  created_at?: Date
  updated_at?: Date
}
