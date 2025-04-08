import { BranchType } from './branch/branch.interface'

export interface UserGeneralInterface {
  // _id: string
  id: string
  name: string
  email: string
  avatar: string
  role: number
  status: number
  branch: BranchType[]
  created_at: Date
  updated_at: Date
}

export interface CreateUserRequestBody {
  name: string
  email: string
  avatar?: string
  role?: number
  status?: number
  branch?: string[]
  created_at: Date
  updated_at?: Date
}


export interface GetAllUserRequestQuery {
  page: number
  limit: number
  branch?: string
  role?: string
}

export interface UpdateUserBody {
  id: string
  name?: string
  email?: string
  avatar?: string
  role?: number
  status?: number
  branch?: BranchType[]
  updated_at: Date
}

export interface SearchUserRequestQuery {
  branch?: string
  result: string
}
