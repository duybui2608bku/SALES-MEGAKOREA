import { ObjectId } from 'mongodb'
import { UserRole } from '~/constants/enum'

interface UserType {
  _id?: ObjectId
  name: string
  email: string
  password: string
  created_at?: Date
  updated_at?: Date
  role?: UserRole
  forgot_password_token?: string
  avatar?: string
}

export default class User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  created_at: Date
  updated_at: Date
  forgot_password_token: string
  avatar: string
  role?: UserRole
  constructor(user: UserType) {
    this._id = user._id
    this.name = user.name || ''
    this.email = user.email
    this.password = user.password
    this.created_at = user.created_at || new Date()
    this.updated_at = user.updated_at || new Date()
    this.forgot_password_token = user.forgot_password_token || ''
    this.avatar = user.avatar || ''
    this.role = user.role || UserRole.USER
  }
}
