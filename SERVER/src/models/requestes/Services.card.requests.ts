import { ObjectId } from 'mongodb'
import { GetServicesCardSoldOfCustomerSearchType } from '~/constants/enum'
import {
  EmployeeOfServices,
  HistoryPaid,
  HistoryUsed,
  RefundType,
  ServicesOfCard
} from '~/interface/services/services.interface'

export interface CreateServicesCardRequestBody {
  code?: string
  is_active?: boolean
  customer_id?: string
  name: string
  branch?: string[]
  descriptions?: string
  session_time?: number
  price?: number
  price_paid?: number
  user_id?: string
  service_group_id?: string
  services_of_card?: ServicesOfCard[]
  employee?: EmployeeOfServices[]
}

export interface CreateServicesCardSoldRequestBody {
  services_card_id: string[]
}

export interface UpdateCardRequestBody {
  _id: string
  code?: string
  is_active?: boolean
  customer_id?: string
  name: string
  branch?: string[]
  descriptions?: string
  session_time?: number
  price?: number
  price_paid?: number
  history_paid?: HistoryPaid[]
  price_paid_other_month?: {
    date: Date
    price: number
  }
  user_id?: string
  service_group_id?: string
  services_of_card?: ServicesOfCard[]
  employee?: EmployeeOfServices[]
}

export interface GetServicesCardRequestBody {
  name: string
  page: number
  code?: string
  limit: number
  search?: string
  branch?: string[]
  service_group_id?: string
  is_active?: boolean
}

export interface GetCommisionOfDateRequestBody {
  start_date: Date
  end_date?: Date
  branch?: string[]
  user_id?: string
}

export interface UpdateHistoryPaidOfServicesCardRequestBody {
  code?: string
  services_card_sold_of_customer_id: string
  paid: number
  out_standing: number
  method: string
  descriptions?: string
  user_id: string
  date: Date
}

export interface CreateServicesCardSoldOfCustomerRequestBody {
  code?: string
  customer_id: string
  descriptions?: string
  branch: string[]
  card_services_sold_id: string[]
  user_id: string
}

export interface GetServicesCardSoldOfCustomerRequestBody {
  limit?: number
  page?: number
  branch?: string[]
  search?: string
  search_type?: GetServicesCardSoldOfCustomerSearchType
  date?: string
}

export interface UpdateServicesCardSoldOfCustomerRequestBody {
  _id: string
  card_services_sold_id?: string[]
  history_paid_id?: string
  history_used?: HistoryUsed
  employee_commision_id?: string[]
  refund?: RefundType
}

export interface UpdateServicesCardSoldOfCustomerData {
  _id: ObjectId
  card_services_sold_id?: ObjectId[] | null
  history_paid_id?: ObjectId | null
  history_used?: HistoryUsed | null | any
  employee_commision_id?: ObjectId[] | null
  refund?: RefundType | null
}

export interface DeleteHistoryPaidOfServicesCardRequestParams {
  id: string
}

export interface DeleteServicesCardParams {
  _id: string
}

export interface UpdateUsedServicesCardSoldRequestBody {
  id: string
  commision_of_technician_id: string
  services_id: string
  services_card_sold_id: string
  history_used: HistoryUsed
}

export interface UpdateQuantityServicesCardSoldRequestBody {
  id: string
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
