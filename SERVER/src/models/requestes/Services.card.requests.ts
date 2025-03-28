import { EmployeeOfServices, ServicesOfCard } from '~/interface/services/services.interface'

export interface CreateServicesCardRequestBody {
  code?: string
  is_active?: boolean
  name: string
  branch?: string[]
  descriptions?: string
  session_time?: number
  price?: number
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
