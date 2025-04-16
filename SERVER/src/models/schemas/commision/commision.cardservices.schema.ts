import { ObjectId } from 'mongodb'
import { TypeCommision } from '~/constants/enum'
import { CommisionCardServicesType } from '~/interface/services/services.interface'

export class Commision {
  _id?: ObjectId
  card_services_sold_id: ObjectId
  employee_id: ObjectId
  commision: number
  type_commision: TypeCommision
  created_at?: Date
  updated_at?: Date
  constructor(commisionCardServices: CommisionCardServicesType) {
    this._id = commisionCardServices._id || new ObjectId()
    this.card_services_sold_id = commisionCardServices.card_services_sold_id
    this.employee_id = commisionCardServices.employee_id
    this.commision = commisionCardServices.commision || 0
    this.type_commision = commisionCardServices.type_commision || TypeCommision.NONE
    this.created_at = commisionCardServices.created_at || new Date()
    this.updated_at = commisionCardServices.updated_at || new Date()
  }
}
