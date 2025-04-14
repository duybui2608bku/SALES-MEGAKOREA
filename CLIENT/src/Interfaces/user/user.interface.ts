import { RoleUser, UserStatus } from 'src/Constants/enum'

export interface UserGeneralInterface {
  _id: string
  name: string
  email: string
  avatar: string
  role: RoleUser
  status: UserStatus
  branch: string
  created_at: Date
  updated_at: Date
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
}

export interface GetAllUserRequestQuery {
  page: number
  limit: number
  branch?: string
  role?: string
}

export interface UpdateUserBody {
  _id: string
  name?: string
  email?: string
  avatar?: string
  role?: RoleUser
  status?: UserStatus
  branch?: string
  created_at?: Date
}

export interface SearchUserRequestQuery {
  branch?: string
  result: string
}
