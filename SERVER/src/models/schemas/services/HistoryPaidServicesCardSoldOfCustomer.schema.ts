import { ObjectId } from 'mongodb'
import { HistoryPaid } from '~/interface/services/services.interface'
import { generateCode } from '~/utils/utils'

class HistoryPaidServicesCardSoldOfCustomer {
  code?: string
  services_card_sold_of_customer_id: ObjectId
  paid: number
  out_standing: number
  method: string
  descriptions?: string
  user_id: ObjectId
  date: Date
  is_deleted?: boolean
  created_at?: Date
  updated_at?: Date
  constructor(historyPaid: HistoryPaid) {
    this.code = historyPaid.code || generateCode()
    this.services_card_sold_of_customer_id = historyPaid.services_card_sold_of_customer_id
    this.paid = historyPaid.paid
    this.out_standing = historyPaid.out_standing
    this.method = historyPaid.method
    this.descriptions = historyPaid.descriptions || ''
    this.user_id = historyPaid.user_id
    this.date = historyPaid.date || new Date()
    this.is_deleted = historyPaid.is_deleted || false
    this.created_at = historyPaid.created_at || new Date()
    this.updated_at = historyPaid.updated_at || new Date()
  }
}

export default HistoryPaidServicesCardSoldOfCustomer
