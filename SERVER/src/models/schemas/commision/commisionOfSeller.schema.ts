import { ObjectId } from 'mongodb'
import { CommisionOfSellerType } from '~/interface/commision/commision.interface'

export class CommisionOfSeller {
  _id?: ObjectId
  services_card_sold_of_customer_id: ObjectId
  user_id: ObjectId
  commision: number
  created_at?: Date
  updated_at?: Date
  constructor(commisionCardServices: CommisionOfSellerType) {
    this._id = commisionCardServices._id || new ObjectId()
    this.services_card_sold_of_customer_id = commisionCardServices.services_card_sold_of_customer_id
    this.user_id = commisionCardServices.user_id
    this.commision = commisionCardServices.commision || 0
    this.created_at = commisionCardServices.created_at || new Date()
    this.updated_at = commisionCardServices.updated_at || new Date()
  }
}
