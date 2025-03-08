import { ObjectId } from 'mongodb'
import { UserRole, UserStatus } from '~/constants/enum'

export interface UserType {
  _id?: ObjectId
  name: string
  email: string
  password: string
  branch?: ObjectId[]
  created_at?: Date
  updated_at?: Date
  role?: UserRole
  status?: UserStatus
  forgot_password_token?: string
  avatar?: string
}
