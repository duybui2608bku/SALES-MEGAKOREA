import { ObjectId } from 'mongodb'
import { TypeCommision } from '~/constants/enum'
import { EmployeeOfServices, ProductOfServices, StepServicesType } from '~/interface/services/services.interface'

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
  commission: number
}

export interface GetServicesStepRequestQuery {
  services_category_id?: string
  search?: string
  page?: string
  limit?: string
}

export interface UpdateStepServiceRequestBody {
  id: string
  name?: string
  services_category_id?: string
  type?: TypeCommision
  commission?: number
}

export interface DeleteStepServiceRequestParams {
  id: string
}
