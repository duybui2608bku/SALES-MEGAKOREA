import { ObjectId } from 'mongodb'
import { ProductType } from '~/interface/product/product.interface'

export default class Product {
  _id?: ObjectId
  branch?: ObjectId[]
  distribution?: string[]
  code?: string
  price?: number
  label?: string
  user_id: string
  is_active?: boolean
  is_consumable?: boolean
  category?: string
  type?: string
  name?: string
  unit?: string
  inStock?: number
  constructor(Product: ProductType) {
    this._id = new ObjectId()
    this.branch = (Product.branch || []).map((b) => new ObjectId(b))
    this.distribution = Product.distribution || []
    this.code = Product.code || ''
    this.price = Product.price || 0
    this.label = Product.label || ''
    this.user_id = Product.user_id
    this.is_consumable = Product.is_consumable || false
    this.category = Product.category || ''
    this.is_active = Product.is_active || true
    this.type = Product.type || ''
    this.name = Product.name || ''
    this.unit = Product.unit || ''
    this.inStock = Product.inStock || 0
  }
}
