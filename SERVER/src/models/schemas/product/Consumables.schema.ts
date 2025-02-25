import { ObjectId } from 'mongodb'
import { ConsumablesType } from '~/interface/product/consumables.interface'

export default class Consumables {
  _id?: ObjectId
  branch?: string[]
  code?: string
  price?: number
  label?: string
  category?: string
  type?: string
  name?: string
  unit?: string
  inStock?: number
  constructor(consumables: ConsumablesType) {
    this._id = consumables._id || new ObjectId()
    this.branch = consumables.branch || []
    this.code = consumables.code || ''
    this.price = consumables.price || 0
    this.label = consumables.label || ''
    this.category = consumables.category || ''
    this.type = consumables.type || ''
    this.name = consumables.name || ''
    this.unit = consumables.unit || ''
    this.inStock = consumables.inStock || 0
  }
}
