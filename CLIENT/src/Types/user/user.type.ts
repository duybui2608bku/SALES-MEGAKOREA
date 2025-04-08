import { UserGeneralInterface } from 'src/Interfaces/user.interface'
import { SuccessResponse } from '../util.type'

export interface UserWithRole {
  _id: string
  name: string
  role: number
}

export type CreateUserResponse = SuccessResponse<void>

export type DeleteUserResponse = SuccessResponse<void>

export type GetUserResponse = SuccessResponse<UserGeneralInterface[]>

export type SearchUserResponse = SuccessResponse<UserGeneralInterface[]>

export type GetUsersWithRoleResponse = SuccessResponse<UserWithRole[]>
