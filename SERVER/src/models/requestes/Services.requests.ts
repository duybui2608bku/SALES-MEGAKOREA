import { ObjectId } from 'mongodb'
import { TypeCommision } from '~/constants/enum'
import { EmployeeOfServices, ProductOfServices } from '~/interface/services/services.interface'
import { QuantityRequestStatus } from '../schemas/services/quantity-request.schema'

export interface CreateServicesCategoryRequestBody {
  name: string
  descriptions: string
  branch?: string[]
}

export interface DeleteServicesCategoryRequestParams {
  id: string
}

export interface UpdateServicesCategoryRequestBody {
  _id: string
  name?: string
  descriptions?: string
  branch?: string[]
}

export interface CreateServicesRequestBody {
  _id?: string
  code?: string
  is_active?: boolean
  name: string
  branch?: string[]
  descriptions?: string
  user_id?: ObjectId
  employee?: EmployeeOfServices[]
  service_group_id?: string
  price?: number
  step_services?: string[]
  products?: ProductOfServices[]
}

export interface UpdateServicesRequestBody {
  _id: string
  code?: string
  is_active: boolean
  name: string
  branch: string[]
  descriptions?: string
  user_id: ObjectId
  employee?: EmployeeOfServices[]
  service_group_id?: string
  price?: number
  step_services?: string[]
  products?: ProductOfServices[]
}

export interface GetAllServicesCategoryRequestQuery {
  page: number
  limit: number
  branch?: string[]
}

export interface GetAllServicesCategoryRequestData {
  page: number
  limit: number
  query: any
}

export interface GetAllServicesRequestQuery {
  page: number
  limit: number
  branch?: string
}

export interface GetAllServicesRequestData {
  page: number
  limit: number
  branch?: string[] | ObjectId[]
}

export interface CreateServicesStepRequestBody {
  services_category_id?: string
  name: string
  type: TypeCommision
  commision: number
  branch?: string[]
}

export interface GetServicesStepRequestQuery {
  services_category_id?: string
  search?: string
  page?: string
  limit?: string
  branch?: string[]
}

export interface UpdateStepServiceRequestBody {
  _id: string
  name?: string
  services_category_id?: string
  type?: TypeCommision
  commision?: number
  branch?: string[]
}

export interface DeleteStepServiceRequestParams {
  id: string
}

export interface CreateQuantityRequestBody {
  page: number
  limit: number
  serviceId: string
  branch?: string
  requestedQuantity: number
  reason?: string
  currentQuantity: number
  servicesCardSoldId: string
  media: string[]
}

export interface GetAllQuantityRequestBody {
  user_id: string
  page: number
  limit: number
  branch?: string
  status?: QuantityRequestStatus
  date?: string
}

export interface GetAllQuantityAdminRequestBody {
  page: number
  limit: number
  branch?: string
  status?: QuantityRequestStatus
  date?: string
}

export interface ApproveQuantityRequestBody {
  requestId: string
  note: string
  userId?: string
}

export interface RejectQuantityRequestBody {
  requestId: string
  note: string
  userId?: string
}
