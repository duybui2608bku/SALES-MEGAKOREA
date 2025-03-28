import { ObjectId } from 'mongodb'
import { PriceType } from '~/constants/enum'

export interface ServicesCategoryType {
  _id?: ObjectId
  name: string
  descriptions?: string
  branch?: ObjectId[]
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

export interface ProductOfServices {
  product_id: ObjectId
  quantity: number
}

export interface StepServicesType {
  price: number
  id_employee: string | ObjectId
  type_step_price: PriceType
  descriptions?: string
  type_step?: any
  products: ProductOfServices[]
}

export interface ServicesType {
  _id?: ObjectId
  parent_id?: ObjectId | null
  price_paid?: number
  history_price?: any[]
  code?: string
  is_active?: boolean
  name: string
  branch: ObjectId[]
  price?: number
  user_id?: ObjectId | string
  descriptions?: string
  employee?: EmployeeOfServices[]
  service_group_id?: ObjectId | string
  step_services?: StepServicesType[]
  products?: ProductOfServices[]
  created_at?: Date
  updated_at?: Date
}

export interface CreateServicesData {
  parent_id?: ObjectId | null
  code?: string
  is_active?: boolean
  name: string
  branch: ObjectId[]
  price?: number
  user_id?: ObjectId | string
  descriptions?: string
  employee?: EmployeeOfServices[]
  service_group_id?: ObjectId | string
  step_services?: StepServicesType[]
  products?: ProductOfServices[]
  created_at?: Date
  updated_at?: Date
}

export interface UpdateServicesData {
  _id?: ObjectId
  code?: string
  is_active?: boolean
  name?: string
  branch?: ObjectId[]
  price?: number
  user_id?: ObjectId | string
  descriptions?: string
  employee?: EmployeeOfServices[]
  service_group_id?: ObjectId | string
  step_services?: StepServicesType[]
  products?: ProductOfServices[]
  created_at?: Date
  updated_at?: Date
}

export interface EmployeeOfServices {
  price: number | null
  id_employee: string | ObjectId
  type_price: PriceType
  descriptions?: string
  rate?: number | null
}

export interface ServicesOfCard {
  services_id?: ObjectId | string
  quantity?: number
  discount?: number
  price?: number
  up_sale?: boolean
}

export interface CreateServicesCardData {
  code?: string
  is_active?: boolean
  name: string
  branch?: ObjectId[]
  descriptions?: string
  session_time?: number
  price?: number
  user_id?: string
  service_group_id?: string
  services_of_card?: ServicesOfCard[]
  employee?: EmployeeOfServices[]
}

export interface HistoryPaid {
  code: string
  date: Date
  name_user: string
  paid: number
  out_standing: number
  method: string
}

export interface CardServicesType {
  _id?: ObjectId
  customer_id?: ObjectId | string | null
  code?: string
  is_active?: boolean
  name: string
  branch?: ObjectId[]
  descriptions?: string
  session_time?: number
  price?: number
  price_paid?: number
  history_paid?: HistoryPaid[]
  user_id?: ObjectId | string
  service_group_id?: ObjectId | string
  services_of_card?: ServicesOfCard[]
  employee?: EmployeeOfServices[]
  created_at?: Date
  updated_at?: Date
}

export interface GetServicesCardData {
  query: any
  page: number
  limit: number
}

export interface GetCommisionOfDateData {
  start_date: Date
  end_date: Date
  branch: ObjectId[]
  user_id: ObjectId | null
}
