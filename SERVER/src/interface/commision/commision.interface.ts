import { ObjectId } from 'mongodb'

export interface CreateCommisionOfSellerData {
  _id?: ObjectId
  user_id: ObjectId
  commision: number
  services_card_sold_of_customer_id: ObjectId
  created_at?: Date
  updated_at?: Date
}

export interface CommisionOfSellerType {
  _id?: ObjectId
  user_id: ObjectId
  commision: number
  services_card_sold_of_customer_id: ObjectId
  created_at?: Date
  updated_at?: Date
}
