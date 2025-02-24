import { ObjectId } from 'mongodb'
import { ServicesCategoryType } from '~/interface/services/services.interface'

export default class ServicesCategory {
  _id?: ObjectId
  name: string
  descriptions: string
  branch?: string[]
  constructor(servicesCategory: ServicesCategoryType) {
    this._id = servicesCategory._id || new ObjectId()
    this.name = servicesCategory.name || ''
    this.descriptions = servicesCategory.descriptions || ''
    this.branch = servicesCategory.branch || []
  }
}
