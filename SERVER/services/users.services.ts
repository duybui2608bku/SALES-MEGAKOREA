import {
  AddUsertoBranchRequestBody,
  DeleteUserFromBranchRequestBody,
  RegisterRequestBody,
  updateMeRequestBody
} from '~/models/requestes/User.requests'
import databaseServiceSale from '../services/database.services.sale'
import User from '../src/models/schemas/User.schema'
import { hashPassword } from '~/utils/crypro'
import { signToken } from '~/utils/jwt'
import { TokenType, UserRole } from '~/constants/enum'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { userMessages } from '~/constants/messages'

config()

class UsersService {
  private signAccessToken(user_id: string, role?: UserRole) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken, role },
      priveKey: process.env.JWT_SECRET_ACCESSTOKEN as string,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN, algorithm: 'HS256' }
    })
  }

  private signRefreshToken(user_id: string, role?: UserRole) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken, role },
      priveKey: process.env.JWT_SECRET_REFRESHTOKEN as string,
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN, algorithm: 'HS256' }
    })
  }

  async register(payload: RegisterRequestBody) {
    const result = await databaseServiceSale.users.insertOne(
      new User({
        ...payload,
        password: hashPassword(payload.password)
      })
    )
    const user_id = result.insertedId.toHexString()
    const role = payload?.role
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id, role),
      this.signRefreshToken(user_id, role)
    ])

    return { access_token, refresh_token }
  }

  async checkEmail(email: string) {
    const user = await databaseServiceSale.users.findOne({ email })
    return Boolean(user)
  }

  async login(user_id: string, role: UserRole) {
    const [access_token, refresh_token, user] = await Promise.all([
      this.signAccessToken(user_id, role),
      this.signRefreshToken(user_id, role),
      databaseServiceSale.users.findOne(
        { _id: new ObjectId(user_id) },
        {
          projection: {
            password: 0,
            created_at: 0,
            updated_at: 0
          }
        }
      )
    ])
    return { access_token, refresh_token, user }
  }

  async resetPassword(user_id: string, password: string) {
    await databaseServiceSale.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: { password: hashPassword(password), forgot_password_token: '' },
        $currentDate: { updated_at: true }
      }
    )
    return {
      message: userMessages.RESET_PASSWORD_SUCCESS
    }
  }

  async changePassword(user_id: string, password: string) {
    await databaseServiceSale.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: { password: hashPassword(password) }
      }
    )
    return {
      message: userMessages.CHANGE_PASSWORD_SUCCESS
    }
  }

  async getProfile(user_id: string) {
    const user = await databaseServiceSale.users
      .aggregate([
        {
          $match: {
            _id: new ObjectId(user_id)
          }
        },
        {
          $lookup: {
            from: 'branch',
            localField: '_id',
            foreignField: 'user_id',
            as: 'branch'
          }
        },
        {
          $addFields: {
            branch: '$branch._id'
          }
        },
        {
          $project: {
            password: 0,
            email_verify_token: 0,
            forgot_password_token: 0
          }
        }
      ])
      .toArray()

    if (!user) {
      return {
        message: userMessages.USER_NOT_FOUND
      }
    }
    return {
      message: userMessages.GET_PROFILE_SUCCESS,
      user
    }
  }

  async updateProfile(user_id: string, payload: updateMeRequestBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    const user = await databaseServiceSale.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...(_payload as updateMeRequestBody & { date_of_birth: Date })
        },
        $currentDate: { updated_at: true }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }

  async addUserToBranch({ user_id, branch_id }: AddUsertoBranchRequestBody) {
    await databaseServiceSale.branch.updateMany(
      {
        _id: new ObjectId(branch_id)
      },
      {
        $addToSet: { user_id: { $each: user_id.map((id) => new ObjectId(id)) } }
      }
    )
  }

  async deleteUserFromBranch({ user_id, branch_id }: DeleteUserFromBranchRequestBody) {
    const user_ids: ObjectId[] = user_id.map((id) => new ObjectId(id))
    await databaseServiceSale.branch.updateMany(
      {
        _id: new ObjectId(branch_id)
      },
      {
        $pull: { user_id: { $in: user_ids as any } }
      }
    )
  }

  async getAllUsers() {
    const result = await databaseServiceSale.users
      .aggregate([
        {
          $lookup: {
            from: process.env.BRANCH_COLLECTION as string,
            localField: '_id',
            foreignField: 'user_id',
            as: 'branch'
          }
        },
        {
          $addFields: {
            branch: {
              $map: {
                input: '$branch',
                as: 'b',
                in: {
                  _id: '$$b._id',
                  name: '$$b.name'
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: process.env.ACCOUNTS_COLLECTION as string,
            localField: '_id',
            foreignField: 'user_id',
            as: 'account'
          }
        }
      ])
      .toArray()
    return result
  }
}

const usersService = new UsersService()
export default usersService
