import { RoleUser, UserStatus } from 'src/Constants/enum'
import { BranchType } from '../branch/branch.interface'

export interface UserGeneralInterface {
  _id: string
  name: string
  email: string
  avatar: string
  role: RoleUser
  status: UserStatus
  branch: BranchType
  created_at: Date
  updated_at: Date
  coefficient: number
}

export interface CreateUserRequestBody {
  name: string
  email: string
  avatar?: string
  role?: RoleUser
  status?: UserStatus
  branch?: string
  created_at?: Date
  updated_at?: Date
  coefficient?: number
}

export interface GetAllUserRequestQuery {
  page: number
  limit: number
  branch?: string
  role?: string
}

export interface UpdateUserRequestBody {
  _id: string
  name?: string
  email?: string
  avatar?: string
  role?: RoleUser
  status?: UserStatus
  branch?: string
  created_at?: Date
  coefficient?: number
}

export interface SearchUserRequestQuery {
  branch?: string
  result: string
}
