import { ObjectId } from 'mongodb'
import { UserRole, UserStatus } from '~/constants/enum'
import { UserType } from '~/interface/user/user.interface'

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
  status?: UserStatus
  branch?: ObjectId[]
  constructor(user: UserType) {
    this._id = user._id
    this.name = user.name || ''
    this.email = user.email
    this.branch = (user.branch || []).map((b) => new ObjectId(b))
    this.password = user.password
    this.forgot_password_token = user.forgot_password_token || ''
    this.avatar = user.avatar || ''
    this.role = user.role || UserRole.USER
    this.created_at = user.created_at || new Date()
    this.updated_at = user.updated_at || new Date()
    this.status = user.status || UserStatus.ACTIVE
  }
}
