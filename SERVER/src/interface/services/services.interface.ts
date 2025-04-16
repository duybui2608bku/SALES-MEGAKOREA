import { ObjectId } from 'mongodb'
import { TypeCommision } from '~/constants/enum'

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
  commision: number
  commision_other_month?: {
    date: Date
    commision: number
  }[]
  id_employee: string | ObjectId
  type_step_price: TypeCommision
  descriptions?: string
  type_step?: any
  products: ProductOfServices[]
}

export interface ServicesType {
  _id?: ObjectId
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
  commision: number
  commision_other_month?: {
    date: Date
    commision: number
  }[]
  id_employee: string | ObjectId
  type_price: TypeCommision
  descriptions?: string
}

export interface ServicesOfCard {
  services_id?: ObjectId | string
  quantity?: number
  discount?: number
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

export interface UpdateCardRequestBody {
  _id: string
  code?: string
  is_active?: boolean
  name?: string
  branch?: ObjectId[]
  descriptions?: string
  session_time?: number
  price?: number
  price_paid?: number
  date_different_paid?: Date[]
  history_paid?: HistoryPaid[]
  user_id?: string
  service_group_id?: string
  services_of_card?: ServicesOfCard[]
  employee?: EmployeeOfServices[]
}

export interface UpdateServicesCardData {
  _id: ObjectId
  code?: string
  is_active?: boolean
  customer_id?: string
  name?: string
  branch?: ObjectId[]
  descriptions?: string
  session_time?: number
  price?: number
  price_paid?: number
  date_different_paid?: Date[]
  history_paid?: HistoryPaid[]
  user_id?: string
  service_group_id?: string
  services_of_card?: ServicesOfCard[]
  employee?: EmployeeOfServices[]
}

export interface EmployeeOfHistoryPaid {
  id_employee: string | ObjectId
  commision: number
  type_price: TypeCommision
  descriptions?: string
}

export interface HistoryPaid {
  code: string
  date: Date
  user_id: ObjectId | string
  paid: number
  out_standing: number
  method: string
  descriptions?: string
}

export interface HistoryUsed {
  name_order: string
  name_service: string
  user_id: ObjectId | string
  date: Date
  descriptions?: string
}

export interface CardServicesType {
  _id?: ObjectId
  code?: string
  is_active?: boolean
  name: string
  branch?: ObjectId[]
  descriptions?: string
  price?: number | null
  user_id?: ObjectId | string
  services_of_card?: ServicesOfCard[]
  created_at?: Date
  updated_at?: Date
}

export interface CardServicesSoldOfCustomerType {
  _id?: ObjectId
  code?: string
  customer_id: ObjectId
  descriptions?: string
  price?: number | null
  card_services_sold_id: ObjectId[]
  history_paid?: HistoryPaid[]
  history_used?: HistoryUsed[]
  user_id: ObjectId | string
  employee_commision?: ObjectId[]
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

export interface UpdateHistoryPaidData {
  history_paid: HistoryPaid
  card_services_id: ObjectId
  paid_initial: number
}

export interface CommisionCardServicesType {
  _id?: ObjectId
  card_services_sold_id: ObjectId
  employee_id: ObjectId
  commision: number
  type_commision: TypeCommision
  created_at?: Date
  updated_at?: Date
}

export interface CreateCommisionCardServicesData {
  _id?: ObjectId
  card_services_id: ObjectId
  employee_id: ObjectId
  commision: number
  type_commision: TypeCommision
  created_at?: Date
  updated_at?: Date
}

export interface CreateServicesCardSoldOfCustomerData {
  code?: string
  customer_id: ObjectId
  descriptions?: string
  card_services_sold_id: ObjectId[]
  user_id: ObjectId
}
