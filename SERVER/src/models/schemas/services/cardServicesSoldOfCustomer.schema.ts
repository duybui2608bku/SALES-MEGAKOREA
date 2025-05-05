import { ObjectId } from 'mongodb'
import {
  CardServicesSoldOfCustomerType,
  HistoryPaid,
  HistoryUsed,
  RefundType
} from '~/interface/services/services.interface'
import { generateCode } from '~/utils/utils'

export class CardServicesSoldOfCustomer {
  _id?: ObjectId
  code?: string
  customer_id: ObjectId
  descriptions?: string
  price?: number | null
  price_paid?: number
  branch: ObjectId[]
  card_services_sold_id: ObjectId[]
  history_paid?: ObjectId[]
  history_used?: HistoryUsed[]
  user_id: ObjectId
  employee_commision?: ObjectId[]
  seller_commission?: ObjectId[]
  refund: RefundType | null
  created_at?: Date
  updated_at?: Date
  constructor(cardServices: CardServicesSoldOfCustomerType) {
    this._id = cardServices._id || new ObjectId()
    this.code = cardServices.code || generateCode()
    this.user_id = cardServices.user_id
    this.price = cardServices.price || null
    this.price_paid = cardServices.price_paid || 0
    this.branch = cardServices.branch || []
    this.history_paid = cardServices.history_paid || []
    this.history_used = cardServices.history_used || []
    this.card_services_sold_id = cardServices.card_services_sold_id
    this.employee_commision = cardServices.employee_commision || []
    this.seller_commission = cardServices.seller_commission || []
    this.customer_id = cardServices.customer_id
    this.refund = cardServices.refund || null
    this.descriptions = cardServices.descriptions || ''
    this.created_at = cardServices.created_at || new Date()
    this.updated_at = cardServices.updated_at || new Date()
  }
}
