import { SuccessResponse } from '../util.type'

export interface UserWithRole {
  _id: string
  name: string
  role: number
}

export type GetUsersWithRoleResponse = SuccessResponse<UserWithRole[]>
