import { UserGeneralInterface } from 'src/Interfaces/user/user.interface'
import { SuccessArrayResponse, SuccessResponse } from '../util.type'
import { MediaType } from 'src/Interfaces/media/media.interface'

export interface UserWithRole {
  _id: string
  name: string
  role: number
}

export type CreateUserResponse = SuccessResponse<void>

export type UploadAvatarResponse = SuccessArrayResponse<MediaType>

export type DeleteUserResponse = SuccessResponse<void>

export type GetUserResponse = SuccessArrayResponse<UserGeneralInterface>

export type GetUsersResponse = SuccessResponse<UserGeneralInterface[]>

export type SearchUserResponse = SuccessResponse<UserGeneralInterface[]>

export type GetUsersWithRoleResponse = SuccessResponse<UserWithRole[]>
