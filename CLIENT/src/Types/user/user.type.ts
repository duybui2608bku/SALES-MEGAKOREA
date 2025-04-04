import { UserGeneralInterface } from 'src/Interfaces/user.interface'
import { SuccessResponse } from '../util.type'

export interface UserWithRole {
  _id: string
  name: string
  role: number
}

export type GetUserResponse = SuccessResponse<{
  users: UserGeneralInterface[]
  limit: number
  page: number
  total: number
}>

export type GetUsersWithRoleResponse = SuccessResponse<UserWithRole[]>
