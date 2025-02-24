import { ObjectId } from 'mongodb'
import { ProductCategoryType } from '~/interface/product/product.interface'

export default class ProductCategory {
  _id?: ObjectId
  name: string
  user_id?: ObjectId[]
  created_at: Date
  updated_at: Date
  constructor(branch: ProductCategoryType) {
    this._id = branch._id || new ObjectId()
    this.name = branch.name || ''
    this.user_id = branch.user_id || []
    this.created_at = branch.created_at || new Date()
    this.updated_at = branch.updated_at || new Date()
  }
}
