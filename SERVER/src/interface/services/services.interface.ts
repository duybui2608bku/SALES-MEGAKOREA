import { ObjectId } from 'mongodb'

export interface ServicesCategoryType {
  _id?: ObjectId
  name: string
  descriptions: string
  branch?: string[]
}

export interface CreateServicesCategoryData {
  name: string
  descriptions: string
  branch?: string[]
}
