import { JwtPayload } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { TokenType, UserRole, UserStatus } from '~/constants/enum'
import User from '../schemas/User.schema'

export interface RegisterRequestBody {
  name: string
  email: string
  password: string
  confirm_password: string
  role?: number
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  role: number
  token_type: TokenType
}

export interface LogoutRequestBody {
  refresh_token: string
}

export interface LoginRequestBody {
  email: string
  password: string
}

export interface resetPasswordRequestBody {
  password: string
  confirm_password: string
  forgot_password_token: string
}

export interface getProfileRequestBody {
  user_id: string
}

export interface UpdateUserRequestBody {
  _id: string
  name: string
  email: string
  password: string
  branch: string
  created_at?: Date
  updated_at?: Date
  role?: UserRole
  coefficient?: number
  status?: UserStatus
  forgot_password_token?: string
  avatar?: string
}

export interface changePasswordRequestBody {
  old_password: string
  password: string
  confirm_password: string
}

export interface AddUsertoBranchRequestBody {
  user_id: string[]
  branch_id: string
}

export interface DeleteUserFromBranchRequestBody {
  user_id: string[] | ObjectId[]
  branch_id: string
}

export interface GetAllUserWithRoleRequestParams {
  role: string
}

export interface GetAllUserRequestBody {
  limit?: string
  page?: string
  branch?: string[]
  role?: UserRole[]
}

// Test
export interface GetAllUserRequestBodyTest {
  limit?: number
  page?: number
  branch?: string
  rol?: UserRole
}
