import { ObjectId } from 'mongodb'
import { TypeCommision } from '~/constants/enum'

export interface ServicesCategoryType {
  _id?: ObjectId
  name: string
  descriptions?: string
  tour_price?: number
  type_price?: TypeCommision
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
  user_id: ObjectId
  type_price?: TypeCommision
  descriptions?: string
  employee?: EmployeeOfServices[]
  service_group_id?: ObjectId | null
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
  user_id: ObjectId
  descriptions?: string
  employee?: EmployeeOfServices[]
  service_group_id?: ObjectId | null
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
  user_id?: ObjectId
  descriptions?: string
  employee?: EmployeeOfServices[]
  service_group_id?: ObjectId | null
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
  id_employee: ObjectId
  type_price: TypeCommision
  descriptions?: string
}

export interface ServicesOfCard {
  services_id?: ObjectId
  quantity?: number
  used?: number
  discount?: number
  up_sale?: boolean
}

export interface ServicesOfCardSold {
  services_id: ObjectId
  quantity: number
  discount: number
  used: number
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

export interface CreateServicesCardSoldData {
  code?: string
  is_active?: boolean
  name: string
  branch?: ObjectId[]
  descriptions?: string
  session_time?: number
  price?: number
  user_id?: ObjectId
  service_group_id?: ObjectId
  services_of_card?: ServicesOfCardSold[]
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
  code?: string
  services_card_sold_of_customer_id: ObjectId
  paid: number
  out_standing: number
  method: string
  descriptions?: string
  user_id: ObjectId
  date: Date
  is_deleted?: boolean
  created_at?: Date
  updated_at?: Date
}

export interface HistoryUsed {
  name_service: string
  user_name: string
  count: number
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

export interface CardServicesSoldType {
  _id?: ObjectId
  code?: string
  is_active?: boolean
  name: string
  branch?: ObjectId[]
  descriptions?: string
  price?: number | null
  user_id?: ObjectId
  services_of_card?: ServicesOfCardSold[]
  created_at?: Date
  updated_at?: Date
}

export interface CardServicesSoldOfCustomerType {
  _id?: ObjectId
  code?: string
  customer_id: ObjectId
  descriptions?: string
  price?: number | null
  price_paid?: number
  branch: ObjectId[]
  card_services_sold_id: ObjectId[]
  history_paid?: ObjectId[]
  history_used?: HistoryUsed[]
  user_id: ObjectId
  employee_commision?: ObjectId[]
  seller_commission?: ObjectId[]
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

export interface UpdateHistoryPaidServicesCardOfCustomerData {
  code?: string
  services_card_sold_of_customer_id: ObjectId
  paid: number
  out_standing: number
  method: string
  descriptions?: string
  user_id: ObjectId
  date: Date
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
  branch: ObjectId[]
  card_services_sold_id: ObjectId[]
  user_id: ObjectId
}

export interface GetServicesCardSoldOfCustomerData {
  limit: number
  page: number
  query: any
}

export interface UpdateUsedServicesCardSoldOfCustomerData {
  services_card_sold_id: ObjectId
  commision_of_technician_id: ObjectId
  services_card_sold_of_customer_id: ObjectId
  services_id: ObjectId
  history_used: HistoryUsed
}
