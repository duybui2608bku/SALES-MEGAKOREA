import { ObjectId } from 'mongodb'

export interface ProductCategoryType {
  _id?: ObjectId
  name: string
  user_id?: ObjectId[]
  created_at?: Date
  updated_at?: Date
}
