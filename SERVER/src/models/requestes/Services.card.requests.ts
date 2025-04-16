import { ObjectId } from 'mongodb'
import { EmployeeOfServices, HistoryPaid, HistoryUsed, ServicesOfCard } from '~/interface/services/services.interface'

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

export interface CreateServicesCardSoldOfCustomerRequestBody {
  code?: string
  customer_id: string
  descriptions?: string
  card_services_sold_id: string[]
  user_id: string
}
