import { ObjectId } from 'mongodb'

import {
  EmployeeOfServices,
  ProductOfServices,
  ServicesCategoryType,
  ServicesType,
  StepServicesType
} from '~/interface/services/services.interface'
import { generateProductCode } from '~/utils/utils'

export class ServicesCategory {
  _id?: ObjectId
  name: string
  descriptions: string
  constructor(servicesCategory: ServicesCategoryType) {
    this._id = servicesCategory._id || new ObjectId()
    this.name = servicesCategory.name || ''
    this.descriptions = servicesCategory.descriptions || ''
  }
}

export class Services {
  _id?: ObjectId
  code?: string
  is_active?: boolean
  name: string
  branch: ObjectId[]
  descriptions?: string
  price?: number
  user_id?: ObjectId | string
  service_group_id?: ObjectId | string
  step_services?: StepServicesType[]
  products?: ProductOfServices[]
  employee?: EmployeeOfServices[]
  created_at?: Date
  updated_at?: Date
  constructor(servicesCategory: ServicesType) {
    this.code = servicesCategory.code || generateProductCode()
    this._id = servicesCategory._id || new ObjectId()
    this.is_active = servicesCategory.is_active || true
    this.name = servicesCategory.name
    this.user_id = servicesCategory.user_id || new ObjectId()
    this.price = servicesCategory.price || 0
    this.employee = servicesCategory.employee || []
    this.branch = (servicesCategory.branch || []).map((branch) => new ObjectId(branch))
    this.descriptions = servicesCategory.descriptions || ''
    this.service_group_id = servicesCategory.service_group_id || ''
    this.step_services = servicesCategory.step_services || []
    this.products = servicesCategory.products || []
    this.created_at = servicesCategory.created_at || new Date()
    this.updated_at = servicesCategory.updated_at || new Date()
  }
}
