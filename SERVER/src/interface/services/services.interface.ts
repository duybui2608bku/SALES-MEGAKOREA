import { ObjectId } from 'mongodb'

export interface ServicesCategoryType {
  _id?: ObjectId
  name: string
  descriptions?: string
  branch?: string[]
}

export interface CreateServicesCategoryData {
  name: string
  descriptions?: string
  branch?: string[]
}

export interface UpdateServicesCategoryData {
  id: string
  name?: string
  descriptions?: string
  branch?: string[]
}

export interface ServicesType {
  _id?: ObjectId
  is_active: boolean
  name: string
  branch: string[]
  descriptions: string
  service_group_id: ObjectId | string
  price: number
  id_employee: ObjectId | string
  tour_price: number
  type_tour_price: number
  id_consumables: ObjectId | string
}

export interface CreateServicesData {
  is_active: boolean
  name: string
  branch: string[]
  descriptions: string
  service_group_id: string
  price: number
  id_employee: string
  tour_price: number
  type_tour_price: number
  id_consumables: string
}

export interface UpdateServicesData {
  id: string
  is_active?: boolean
  name?: string
  branch?: string[]
  descriptions?: string
  service_group_id?: string
  price?: number
  id_employee?: string
  tour_price?: number
  type_tour_price?: number
  id_consumables?: string
}
