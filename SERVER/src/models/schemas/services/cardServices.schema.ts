import { ObjectId } from 'mongodb'
import {
  CardServicesType,
  EmployeeOfServices,
  HistoryPaid,
  ServicesOfCard
} from '~/interface/services/services.interface'
import { generateProductCode } from '~/utils/utils'

export class CardServices {
  _id?: ObjectId
  code?: string
  is_active?: boolean
  name: string
  customer_id?: ObjectId | string | null
  branch?: ObjectId[]
  descriptions?: string
  session_time?: number
  price?: number
  price_paid?: number
  history_paid?: HistoryPaid[]
  date_different_paid?: Date[]
  user_id?: ObjectId | string
  service_group_id?: ObjectId | string
  services_of_card?: ServicesOfCard[]
  employee?: EmployeeOfServices[]
  created_at?: Date
  updated_at?: Date
  constructor(cardServices: CardServicesType) {
    this.code = cardServices.code || generateProductCode()
    this._id = cardServices._id || new ObjectId()
    this.customer_id = cardServices.customer_id || null
    this.is_active = cardServices.is_active || true
    this.name = cardServices.name
    this.user_id = cardServices.user_id || new ObjectId()
    this.price = cardServices.price || 0
    this.price_paid = cardServices.price_paid || 0
    this.date_different_paid = cardServices.date_different_paid || []
    this.history_paid = cardServices.history_paid || []
    this.session_time = cardServices.session_time || 0
    this.employee = cardServices.employee || []
    this.branch = (cardServices.branch || []).map((branch) => new ObjectId(branch))
    this.descriptions = cardServices.descriptions || ''
    this.service_group_id = cardServices.service_group_id || ''
    this.services_of_card = cardServices.services_of_card || []
    this.created_at = cardServices.created_at || new Date()
    this.updated_at = cardServices.updated_at || new Date()
  }
}
