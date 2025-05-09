import { ObjectId } from 'mongodb'
import { TypeCommision } from '~/constants/enum'
import { StepServicesType } from '~/interface/services/services.interface'

export class ServicesStep {
  _id?: ObjectId
  services_category_id: ObjectId | null
  name: string
  type: TypeCommision
  commision: number
  descriptions?: string
  created_at?: Date
  updated_at?: Date
  constructor(servicesCategory: StepServicesType) {
    this._id = servicesCategory._id || new ObjectId()
    this.services_category_id = servicesCategory.services_category_id || null
    this.name = servicesCategory.name || ''
    this.descriptions = servicesCategory.descriptions || ''
    this.type = servicesCategory.type || TypeCommision.FIXED
    this.commision = servicesCategory.commision || 0
    this.created_at = servicesCategory.created_at || new Date()
    this.updated_at = servicesCategory.updated_at || new Date()
  }
}
