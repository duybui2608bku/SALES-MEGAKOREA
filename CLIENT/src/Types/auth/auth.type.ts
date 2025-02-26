import { User } from 'src/Interfaces/user.interface'
import { SuccessResponse } from '../util.type'

export type LoginResponse = SuccessResponse<{
  access_token: string
  refresh_token: string
  user: User
}>
