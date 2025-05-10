import { GetServicesCardSoldOfCustomerSearchType, TypeCommision, RefundEnum } from 'src/Constants/enum'
import { BranchType } from '../branch/branch.interface'
import { UserGeneralInterface } from '../user/user.interface'
import { Customer } from '../customers/customers.interfaces'

export interface ProductOfServices {
  product_id: string
  quantity: number
}

export interface HistoryUsed {
  name_service: string
  user_name: string
  count: number
  date: Date
  descriptions?: string
}

export interface StepServicesType {
  _id: string
  id?: string
  name: string
  type: TypeCommision
  commision: number
  services_category_id: string | null
  branch: string[]
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
  step_services_details: string[] | StepServicesType[]
  products: ProductOfServices[]
}

export interface HistoryPaid {
  _id: string
  code: string
  services_card_sold_of_customer_id: string
  paid: number
  out_standing: number
  method: string
  descriptions: string
  user_id: string
  date: string
  is_deleted: boolean
  created_at: Date
  updated_at: Date
  user_details: UserGeneralInterface
}
export interface ServicesOfCardType {
  _id: string
  customer_id: string | null
  code: string
  is_active: boolean
  name: string
  branch: BranchType[]
  descriptions: string
  user_id: string | string
  price: number
  price_paid: number
  services_of_card: ServicesOfCard[]
  employee: EmployeeOfServices[]
  created_at: Date
  updated_at: Date
}

export interface GetAllServicesCategoryRequestQuery {
  page: number
  limit: number
  branch?: string[]
}

export interface ServicesCategoryType {
  _id: string
  name: string
  descriptions: string
  tour_price?: number
  type_price?: TypeCommision
  branch?: string[]
}

export interface CreateServicesCategoryRequestBody {
  name: string
  descriptions?: string
  branch?: string[]
}

export interface UpdateServicesCategoryRequestBody {
  _id: string
  name?: string
  descriptions?: string
  branch?: string[]
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
  step_services?: string[]
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
  employee_details: UserGeneralInterface
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
  step_services?: string[]
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
  code: string
  services_card_sold_of_customer_id: string
  paid: number
  out_standing: number
  method: string
  descriptions?: string
  user_id: string
  date: Date
}

export interface GetServicesCardSoldOfCustomerRequestBody {
  limit?: number
  page?: number
  branch?: string[]
  code?: string
  search?: string
  search_type?: GetServicesCardSoldOfCustomerSearchType
  date?: string | string[]
}

export interface RefundType {
  type: RefundEnum
  price: number
  date?: Date
}

export interface GetServicesCardSoldOfCustomer {
  _id: string
  code: string
  descriptions: string
  price: number | null
  price_paid: number | null
  branch: BranchType[]
  history_paid: HistoryPaid[]
  history_used: HistoryUsed[]
  employee_commision: any[]
  customers: Customer
  userInfo: UserGeneralInterface
  created_at: string
  refund?: RefundType | null
  cards: {
    _id: string
    price: number | null
    name: string
    services_of_card: {
      _id: string
      name: string
      lineTotal: number
      price: number
      type_price: TypeCommision
      quantity: number
      used: number
    }[]
  }[]
}

export interface CreateServicesCardSoldOfCustomerRequestBody {
  branch: string[]
  code?: string
  customer_id: string
  descriptions?: string
  card_services_sold_id: string[]
  user_id: string
}

export interface UpdateServicesCardSoldOfCustomerRequestBody {
  _id: string
  card_services_sold_id?: string[]
  history_paid_id?: string
  history_used?: HistoryUsed
  employee_commision_id?: string[]
  refund?: RefundType
}

export interface UpdateUsedServicesRequestBody {
  id: string
  commision_of_technician_id: string
  services_card_sold_id: string
  services_id: string
  history_used: {
    name_service: string
    user_name: string
    count: number
    date: Date
    descriptions?: string
  }
}

export interface UpdateQuantityServicesRequestBody {
  id: string
  commision_of_technician_id: string
  services_card_sold_id: string
  services_id: string
  media: string[]
  history_increase_quantity: {
    name_service: string
    user_name: string
    count: number
    date: string
    descriptions?: string
  }
}

export interface UpdateUsedServicesData {
  commision: number
  type: TypeCommision
  services_card_sold_of_customer_id: string
  user_id: string
  services_card_sold_id: string
  services_id: string
  name_service: string
  user_name: string
  count: number
  date: Date
  descriptions?: string
}

export interface StepServicesInterface {
  _id: string
  services_category_id?: string
  name: string
  type: TypeCommision
  commision: number
  category: ServicesCategoryType
  branch: string[]
}

export interface GetAllStepServiceRequestBody {
  services_category_id?: string
  search?: string
}

export interface CreateStepServiceRequestBody {
  services_category_id?: string
  name: string
  type: TypeCommision
  commision: number
  branch: string[]
}

export interface UpdateQuantityServicesData {
  commision: number
  type: TypeCommision
  services_card_sold_of_customer_id: string
  user_id: string
  services_card_sold_id: string
  services_id: string
  name_service: string
  user_name: string
  count: number
  date: string
  descriptions?: string
}

// Sold Services Card
export interface CreateSoldServicesCardRequestBody {
  services_card_id: string[]
}
