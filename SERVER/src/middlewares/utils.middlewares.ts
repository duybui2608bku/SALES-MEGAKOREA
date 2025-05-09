import { checkSchema } from 'express-validator'
import { utilsMessages } from '~/constants/messages'
import { validate } from '~/utils/validation'
import { Request, Response, NextFunction } from 'express'
import { TokenPayload } from '~/models/requestes/User.requests'
import { UserRole } from '~/constants/enum'
import { ObjectId } from 'mongodb'

export const paginatonValidator = validate(
  checkSchema(
    {
      limit: {
        isNumeric: true,
        custom: {
          options: (value) => {
            const num = Number(value)
            if (num > 100) {
              throw new Error(utilsMessages.LIMIT_MUST_BE_SMALLER_THAN_100)
            } else if (num < 1) {
              throw new Error(utilsMessages.LIMIT_MUST_BE_BIGGER_THAN_0)
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: (value) => {
            const num = Number(value)
            if (num < 1) {
              throw new Error(utilsMessages.PAGE_MUST_BE_BIGGER_THAN_0)
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)

/**
 * Middleware to inject branch_id into request based on user role
 * - For admin users: Uses branch_id(s) from request body/query
 * - For regular users: Forces branch_id to user's assigned branch
 */
export const branchAccessMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { decode_authorization } = req
  if (!decode_authorization) {
    return next()
  }

  const { role, user_id } = decode_authorization as TokenPayload

  // Admin can access multiple branches (use the one provided in request)
  if (role === UserRole.ADMIN) {
    return next()
  }

  // For non-admin users, get user's branch from profile
  // and ensure they can only access their assigned branch
  if (req.user?.branch) {
    const userBranchId = req.user.branch.toString()

    // Handle different request methods
    if (req.method === 'GET') {
      // For GET requests, branch is often in query params
      if (req.query.branch) {
        req.query.branch = userBranchId
      } else if (req.query.branch_id) {
        req.query.branch_id = userBranchId
      }
    } else {
      // For POST, PUT, PATCH, DELETE - branch is in body
      if (req.body.branch) {
        req.body.branch = [userBranchId]
      } else if (req.body.branch_id) {
        req.body.branch_id = userBranchId
      }
    }
  }

  next()
}
