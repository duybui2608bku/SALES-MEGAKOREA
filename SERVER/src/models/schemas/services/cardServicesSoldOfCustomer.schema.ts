import { ObjectId } from 'mongodb'
import { CardServicesSoldOfCustomerType, HistoryPaid, HistoryUsed } from '~/interface/services/services.interface'
import { generateCode } from '~/utils/utils'

export class CardServicesSoldOfCustomer {
  _id?: ObjectId
  code?: string
  customer_id: ObjectId
  descriptions?: string
  price?: number | null
  branch: ObjectId[]
  card_services_sold_id: ObjectId[]
  history_paid?: HistoryPaid[]
  history_used?: HistoryUsed[]
  user_id: ObjectId | string
  employee_commision?: ObjectId[]
  created_at?: Date
  updated_at?: Date
  constructor(cardServices: CardServicesSoldOfCustomerType) {
    this._id = cardServices._id || new ObjectId()
    this.code = cardServices.code || generateCode()
    this.user_id = cardServices.user_id
    this.price = cardServices.price || null
    this.branch = cardServices.branch || []
    this.history_paid = cardServices.history_paid || []
    this.history_used = cardServices.history_used || []
    this.card_services_sold_id = cardServices.card_services_sold_id
    this.employee_commision = cardServices.employee_commision || []
    this.customer_id = cardServices.customer_id
    this.descriptions = cardServices.descriptions || ''
    this.created_at = cardServices.created_at || new Date()
    this.updated_at = cardServices.updated_at || new Date()
  }
}
