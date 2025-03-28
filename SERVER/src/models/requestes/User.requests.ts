import { JwtPayload } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { TokenType } from '~/constants/enum'

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

export interface updateMeRequestBody {
  name?: string
  date_of_birth?: string
  bio?: string
  website?: string
  location?: string
  username?: string
  avatar?: string
  coverphoto?: string
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
