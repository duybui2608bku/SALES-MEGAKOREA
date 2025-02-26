import { ObjectId } from 'mongodb'
import { ProductType } from '~/interface/product/product.interface'

export default class Product {
  _id?: ObjectId
  branch?: string[]
  code?: string
  price?: number
  label?: string
  is_consumable?: boolean
  category?: string
  type?: string
  name?: string
  unit?: string
  inStock?: number
  constructor(Product: ProductType) {
    this._id = new ObjectId()
    this.branch = Product.branch || []
    this.code = Product.code || ''
    this.price = Product.price || 0
    this.label = Product.label || ''
    this.is_consumable = Product.is_consumable || false
    this.category = Product.category || ''
    this.type = Product.type || ''
    this.name = Product.name || ''
    this.unit = Product.unit || ''
    this.inStock = Product.inStock || 0
  }
}
