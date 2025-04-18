import {
  AddUsertoBranchRequestBody,
  DeleteUserFromBranchRequestBody,
  GetAllUserRequestBody,
  GetAllUserRequestBodyTest,
  RegisterRequestBody,
  UpdateUserRequestBody
} from '~/models/requestes/User.requests'
import databaseServiceSale from '../services/database.services.sale'
import User from '../src/models/schemas/User.schema'
import { hashPassword } from '~/utils/crypro'
import { signToken } from '~/utils/jwt'
import { HttpStatusCode, TokenType, UserRole } from '~/constants/enum'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { userMessages } from '~/constants/messages'
import _ from 'lodash'
import { ErrorWithStatusCode } from '~/models/Errors'

config()

class UsersService {
  // Prive
  private async checkUserExist(id: ObjectId) {
    const User = await databaseServiceSale.users.findOne({ _id: id })
    if (!User) {
      throw new ErrorWithStatusCode({
        message: userMessages.USER_EXISTS,
        statusCode: HttpStatusCode.NotFound
      })
    }
  }

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
      databaseServiceSale.users
        .aggregate([
          {
            $match: {
              _id: new ObjectId(user_id)
            }
          },
          {
            $lookup: {
              from: 'branch',
              localField: 'branch',
              foreignField: '_id',
              as: 'branch'
            }
          },
          {
            $unwind: {
              path: '$branch',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              password: 0,
              created_at: 0,
              updated_at: 0
            }
          }
        ])
        .toArray()
    ])
    return { access_token, refresh_token, user: user[0] || null }
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
            localField: 'branch',
            foreignField: '_id',
            as: 'branch_info'
          }
        },
        {
          $addFields: {
            branch: { $arrayElemAt: ['$branch_info', 0] }
          }
        },
        {
          $project: {
            password: 0,
            email_verify_token: 0,
            forgot_password_token: 0,
            branch_info: 0
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
      user: user[0]
    }
  }

  async updateUser(payload: UpdateUserRequestBody) {
    const { _id, branch, password, ...rest } = payload

    const userObjectId = new ObjectId(_id)

    const updateDoc: Record<string, any> = {
      ...rest,
      updated_at: new Date()
    }

    // Hash mật khẩu nếu có truyền lên
    if (password) {
      const hashedPassword = hashPassword(password)
      updateDoc.password = hashedPassword
    }

    // Nếu có branch -> ép về ObjectId
    if (branch) {
      try {
        updateDoc.branch = new ObjectId(branch)
      } catch (error) {
        console.error('Ivalid branch ID: ', branch)
        throw new Error('Chi nhánh không hợp lệ!')
      }
    }

    const user = await databaseServiceSale.users.findOneAndUpdate(
      {
        _id: new ObjectId(userObjectId)
      },
      {
        $set: updateDoc
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
    console.log('UserUpdate: ', user)

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

  async getAllUsers(data: GetAllUserRequestBody) {
    const { page = 1, limit = 10, role, branch } = data
    const branch_ids = branch?.map((b) => new ObjectId(b))
    const skip = (Number(page) - 1) * Number(limit)
    const query: Record<string, any> = {}

    if (role) {
      const roleNumbers = role.map((r) => Number(r))
      query.role = { $in: roleNumbers, $nin: [UserRole.ADMIN] }
    } else {
      query.role = { $nin: [UserRole.ADMIN] }
    }

    if (branch_ids?.length) {
      query.branch = { $in: branch_ids }
    }
    const result = await databaseServiceSale.users
      .aggregate([
        {
          $match: {
            ...query
          }
        },
        // {
        //   $lookup: {
        //     from: 'branch',
        //     localField: 'branch',
        //     foreignField: '_id',
        //     as: 'branch'
        //   }
        // },
        // {
        //   $addFields: {
        //     branch: {
        //       $map: {
        //         input: '$branch',
        //         as: 'b',
        //         in: {
        //           _id: '$$b._id',
        //           name: '$$b.name'
        //         }
        //       }
        //     }
        //   }
        // },
        {
          $project: {
            password: 0,
            email_verify_token: 0,
            forgot_password_token: 0
          }
        },
        {
          $sort: { _id: -1 }
        },
        {
          $skip: skip
        },
        {
          $limit: Number(limit)
        }
      ])
      .toArray()
    return result
  }

  // Test
  async getAllUsersTest(data: GetAllUserRequestBodyTest) {
    const { page = 1, limit = 10, branch } = data

    let parsedPage = Number(page)
    let parsedLimit = Number(limit)
    if (isNaN(parsedPage) || parsedPage <= 0) parsedPage = 1
    if (isNaN(parsedLimit) || parsedLimit <= 0) parsedLimit = 10

    const skip = (parsedPage - 1) * parsedLimit
    const query: Record<string, any> = {}
    query.role = { $nin: [UserRole.ADMIN] }

    // Xử lý branch (dạng string, chỉ 1 branch)
    if (branch) {
      try {
        query.branch = new ObjectId(branch)
      } catch (error) {
        console.error('Invalid branch ID format: ', branch)
        throw new Error('Chi nhánh không hợp lệ!')
      }
    }

    const result = await databaseServiceSale.users
      .aggregate([
        {
          $match: query
        },
        {
          $lookup: {
            from: 'branch',
            localField: 'branch',
            foreignField: '_id',
            as: 'branch_info'
          }
        },
        {
          $unwind: {
            path: '$branch_info',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            branch: {
              _id: '$branch_info._id',
              name: '$branch_info.name'
            }
          }
        },
        {
          $project: {
            password: 0,
            email_verify_token: 0,
            forgot_password_token: 0,
            branch_info: 0
          }
        },
        {
          $sort: { _id: -1 }
        },
        {
          $skip: skip
        },
        {
          $limit: parsedLimit
        }
      ])
      .toArray()
    return result
  }

  async getUserWithRole(role: string) {
    const result = await databaseServiceSale.users
      .aggregate([
        {
          $match: {
            role: Number(role)
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            role: 1
          }
        }
      ])
      .toArray()
    return result
  }

  async deleteUser(user_id: string) {
    const _id = new ObjectId(user_id)
    await this.checkUserExist(_id)
    await databaseServiceSale.users.deleteOne({ _id: _id })
  }
}

const usersService = new UsersService()
export default usersService
