import { ObjectId } from 'mongodb'
import { TypeCommision } from '~/constants/enum'

import {
  EmployeeOfServices,
  ProductOfServices,
  ServicesCategoryType,
  ServicesType,
  StepServicesType
} from '~/interface/services/services.interface'
import { generateCode } from '~/utils/utils'

export class ServicesCategory {
  _id?: ObjectId
  name: string
  descriptions: string
  tour_price?: number
  branch?: ObjectId[]
  type_price?: TypeCommision
  created_at?: Date
  updated_at?: Date
  constructor(servicesCategory: ServicesCategoryType) {
    this._id = servicesCategory._id || new ObjectId()
    this.name = servicesCategory.name || ''
    this.tour_price = servicesCategory.tour_price || 0
    this.type_price = servicesCategory.type_price || TypeCommision.FIXED
    this.branch = servicesCategory.branch || []
    this.descriptions = servicesCategory.descriptions || ''
    this.created_at = servicesCategory.created_at || new Date()
    this.updated_at = servicesCategory.updated_at || new Date()
  }
}

export class Services {
  _id?: ObjectId
  code?: string
  is_active?: boolean
  name: string
  branch?: ObjectId[]
  descriptions?: string
  price?: number
  type_price?: TypeCommision
  user_id?: ObjectId
  service_group_id?: ObjectId | null
  step_services?: ObjectId[]
  products?: ProductOfServices[]
  employee?: EmployeeOfServices[]
  created_at?: Date
  updated_at?: Date
  constructor(servicesCategory: ServicesType) {
    this.code = servicesCategory.code || generateCode()
    this._id = servicesCategory._id || new ObjectId()
    this.is_active = servicesCategory.is_active || true
    this.name = servicesCategory.name
    this.user_id = servicesCategory.user_id
    this.price = servicesCategory.price || 0
    this.type_price = servicesCategory.type_price || TypeCommision.FIXED
    this.employee = servicesCategory.employee || []
    this.branch = (servicesCategory.branch || []).map((branch) => new ObjectId(branch))
    this.descriptions = servicesCategory.descriptions || ''
    this.service_group_id = servicesCategory.service_group_id || null
    this.step_services = servicesCategory.step_services || []
    this.products = servicesCategory.products || []
    this.created_at = servicesCategory.created_at || new Date()
    this.updated_at = servicesCategory.updated_at || new Date()
  }
}
