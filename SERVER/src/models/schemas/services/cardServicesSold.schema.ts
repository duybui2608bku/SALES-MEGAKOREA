import { ObjectId } from 'mongodb'
import { CardServicesType, ServicesOfCard } from '~/interface/services/services.interface'
import { generateCode } from '~/utils/utils'

export class CardServicesSold {
  _id?: ObjectId
  code?: string
  is_active?: boolean
  name: string
  branch?: ObjectId[]
  descriptions?: string
  price?: number | null
  user_id?: ObjectId | string
  services_of_card?: ServicesOfCard[]
  created_at?: Date
  updated_at?: Date
  constructor(cardServices: CardServicesType) {
    this.code = cardServices.code || generateCode()
    this._id = cardServices._id || new ObjectId()
    this.is_active = cardServices.is_active || true
    this.name = cardServices.name
    this.user_id = cardServices.user_id || new ObjectId()
    this.price = cardServices.price || null
    this.branch = (cardServices.branch || []).map((branch) => new ObjectId(branch))
    this.descriptions = cardServices.descriptions || ''
    this.services_of_card = cardServices.services_of_card || []
    this.created_at = cardServices.created_at || new Date()
    this.updated_at = cardServices.updated_at || new Date()
  }
}
