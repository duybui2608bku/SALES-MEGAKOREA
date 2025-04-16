import { ObjectId } from 'mongodb'
import { CustomerType } from '~/interface/customer/customer.interface'

export default class Customer {
  _id?: ObjectId
  branch: string
  date: string
  source: string
  name: string
  phone: string
  address: string
  sex: string
  created_at: Date
  updated_at: Date
  constructor(customer: CustomerType) {
    this._id = new ObjectId(customer._id)
    this.branch = customer.branch || ''
    this.date = customer.date || ''
    this.source = customer.source || ''
    this.name = customer.name || ''
    this.phone = customer.phone
    this.address = customer.address || ''
    this.sex = customer.sex || ''
    this.created_at = customer.created_at ? new Date(customer.created_at) : new Date()
    this.updated_at = customer.updated_at || new Date()
  }
}
