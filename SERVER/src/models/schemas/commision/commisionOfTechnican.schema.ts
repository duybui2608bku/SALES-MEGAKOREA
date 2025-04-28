import { ObjectId } from 'mongodb'
import { TypeCommision } from '~/constants/enum'
import { CommisionOfTechnicanType } from '~/interface/commision/commision.interface'

export class CommisionOfTechnican {
  _id?: ObjectId
  services_card_sold_of_customer_id: ObjectId
  user_id: ObjectId
  type: TypeCommision
  commision: number
  created_at?: Date
  updated_at?: Date
  constructor(commisionCardServices: CommisionOfTechnicanType) {
    this._id = commisionCardServices._id || new ObjectId()
    this.services_card_sold_of_customer_id = commisionCardServices.services_card_sold_of_customer_id
    this.user_id = commisionCardServices.user_id
    this.type = commisionCardServices.type || TypeCommision.FIXED
    this.commision = commisionCardServices.commision || 0
    this.created_at = commisionCardServices.created_at || new Date()
    this.updated_at = commisionCardServices.updated_at || new Date()
  }
}
