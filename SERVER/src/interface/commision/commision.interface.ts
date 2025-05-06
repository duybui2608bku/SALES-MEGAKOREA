import { ObjectId } from 'mongodb'
import { TypeCommision } from '~/constants/enum'

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

export interface GetCommisionOfSellerRequests {
  user_id: string
  start_date?: Date
  end_date?: Date
}

export interface GetCommisionOfSellerData {
  user_id: ObjectId
  query: any
}

export interface CreateCommisionOfTechnicanData {
  _id?: ObjectId
  user_id: ObjectId
  commision: number
  type: TypeCommision
  services_card_sold_of_customer_id: ObjectId
  created_at?: Date
  updated_at?: Date
}

export interface CommisionOfTechnicanType {
  _id?: ObjectId
  user_id: ObjectId
  commision: number
  services_card_sold_of_customer_id: ObjectId
  type: TypeCommision
  created_at?: Date
  updated_at?: Date
}

export interface GetCommisionOfTechnicanRequests {
  user_id: string
  start_date?: Date
  end_date?: Date
}

export interface GetCommisionOfTechnicanData {
  user_id: ObjectId
  query: any
}

export interface GetCommisionOfTechnicanReportData {
  query: any
  page: number
  limit: number
}

export interface GetCommisionOfSellerReportData {
  query: any
  page: number
  limit: number
}
