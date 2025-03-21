import { ObjectId } from 'mongodb'
import { PriceType } from '~/constants/enum'
import { ServicesCategoryType, ServicesType } from '~/interface/services/services.interface'

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
  is_active: boolean
  name: string
  branch: ObjectId[]
  descriptions: string
  service_group_id: ObjectId | string
  price: number
  id_employee: ObjectId | string
  tour_price: number
  type_tour_price: number
  id_Product: ObjectId | string
  constructor(servicesCategory: ServicesType) {
    this._id = servicesCategory._id || new ObjectId()
    this.is_active = servicesCategory.is_active || true
    this.name = servicesCategory.name
    this.branch = (servicesCategory.branch || []).map((branch) => new ObjectId(branch))
    this.descriptions = servicesCategory.descriptions || ''
    this.service_group_id = servicesCategory.service_group_id || ''
    this.price = servicesCategory.price || 0
    this.id_employee = servicesCategory.id_employee || ''
    this.tour_price = servicesCategory.tour_price || 0
    this.type_tour_price = servicesCategory.type_tour_price || PriceType.FIXED
    this.id_Product = servicesCategory.id_Product || ''
  }
}
