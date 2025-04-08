import { TypeCommision } from 'src/Constants/enum'
import { User } from '../user/user.interface'
import { BranchType } from '../branch/branch.interface'

export interface ProductOfServices {
  product_id: string
  quantity: number
}

export interface StepServicesType {
  id_employee: string
  commision: number
  commision_other_month: {
    date: Date
    commision: number
  }[]
  employee_details: User
  type_step_price: TypeCommision
  descriptions?: string
  type_step?: unknown
  products: ProductOfServices[]
}

export interface ServicesType {
  _id: string
  code: string
  is_active: boolean
  name: string
  branch: string[] | BranchType[]
  price: number
  descriptions: string
  service_group: ServicesCategoryType
  step_services: StepServicesType[]
  products: ProductOfServices[]
}

export interface HistoryPaid {
  code: string
  date: Date
  user_id: string
  paid: number
  out_standing: number
  method: string
  descriptions?: string
  user_details?: User
}

export interface ServicesOfCardType {
  _id: string
  customer_id: string | null
  code: string
  is_active: boolean
  name: string
  branch: BranchType[]
  descriptions: string
  session_time: number
  price: number
  price_paid: number
  history_paid: HistoryPaid[]
  date_different_paid: Date[]
  user_id: string | string
  service_group: ServicesCategoryType
  services_of_card: ServicesOfCard[]
  employee: EmployeeOfServices[]
  created_at: Date
  updated_at: Date
}

export interface GetAllServicesCategoryRequestQuery {
  page: number
  limit: number
}

export interface ServicesCategoryType {
  _id: string
  name: string
  descriptions: string
}

export interface CreateServicesCategoryRequestBody {
  name: string
  descriptions?: string
}

export interface UpdateServicesCategoryRequestBody {
  _id: string
  name?: string
  descriptions?: string
  [key: string]: unknown
}

export interface GetAllServicesRequestQuery {
  page: number
  limit: number
  branch?: string
}

export interface CreateServicesRequestBody {
  _id: string
  is_active: boolean
  name: string
  branch?: string[]
  descriptions?: string
  service_group_id?: string
  price?: number
  user_id: string
  step_services?: StepServicesType[]
  products?: ProductOfServices[]
  employee?: EmployeeOfServices[]
  [key: string]: unknown
}

export interface EmployeeOfServices {
  commision: number
  commision_other_month: {
    date: Date
    commision: number
  }[]
  id_employee: string
  type_price: TypeCommision
  descriptions?: string
  employee_details: User
}

export interface StepServicesFieldType {
  commision: number
  employee_id: string
  type_step_price: TypeCommision
  descriptions?: string
  type_step?: unknown
  products: ProductOfServices[]
}

export interface UpdateServicesRequestBody {
  _id: string
  is_active: boolean
  name: string
  branch?: string[]
  descriptions?: string
  service_group_id?: string
  price?: number
  user_id: string
  step_services?: StepServicesFieldType[]
  products?: ProductOfServices[]
  employee?: EmployeeOfServices[]
  [key: string]: unknown
}

export interface ServicesOfCard {
  services_id: string
  quantity: number
  discount: number
  price: number
  service_details: ServicesType
  total: number
}

export interface CreateServicesCardRequestBody {
  _id: string
  code: string
  is_active: boolean
  name: string
  branch: string[]
  descriptions: string
  session_time: number
  price: number
  price_paid: number
  user_id: string
  service_group_id: string
  services_of_card: ServicesOfCard[]
  employee: EmployeeOfServices[]
  [key: string]: unknown
}

export interface UpdateServicesCardRequestBody {
  _id?: string
  code?: string
  is_active?: boolean
  name?: string
  customer_id?: string | null
  branch?: string[]
  descriptions?: string
  session_time?: number
  price?: number
  price_paid?: number
  history_paid?: HistoryPaid[]
  date_different_paid?: Date[]
  user_id?: string
  service_group_id?: string
  services_of_card?: ServicesOfCard[]
  employee?: EmployeeOfServices[]
  created_at?: Date
  updated_at?: Date
  [key: string]: unknown
}

export interface GetServicesCardRequestBody {
  name?: string
  page: number
  code?: string
  limit: number
  search?: string
  branch?: string[]
  service_group_id?: string
  is_active?: boolean
}

export interface UpdatePaidOfServicesCardRequestBody {
  card_services_id: string
  code: string
  date: Date
  paid_initial: number
  user_id: string
  paid: number
  out_standing: number
  method: string
  descriptions?: string
}
