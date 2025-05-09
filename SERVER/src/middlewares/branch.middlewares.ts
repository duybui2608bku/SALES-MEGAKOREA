import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { Request, Response, NextFunction } from 'express'
import { HttpStatusCode, UserRole } from '~/constants/enum'
import { branchMessages } from '~/constants/messages'
import { ErrorWithStatusCode } from '~/models/Errors'
import { TokenPayload } from '~/models/requestes/User.requests'
import { ObjectId } from 'mongodb'
import databaseServiceSale from 'services/database.services.sale'

export const addBranchValidator = validate(
  checkSchema(
    {
      name: {
        isString: true,
        notEmpty: true
      }
    },
    ['body']
  )
)

/**
 * Middleware to validate that branch_id is present in the request
 * Admin users: Can select multiple branches, validate the branch_ids exist
 * Regular users: Will have their branch_id enforced in the request
 */
export const requireBranchIdValidator = validate(
  checkSchema(
    {
      branch_id: {
        custom: {
          options: async (value: string, { req }) => {
            const { decode_authorization } = req
            const { role } = decode_authorization as TokenPayload

            // For admin, ensure branch_id is provided
            if (role === UserRole.ADMIN) {
              if (!value && !req.body?.branch && !(req.query && req.query.branch)) {
                throw new ErrorWithStatusCode({
                  message: branchMessages.BRANCH_ID_REQUIRED,
                  statusCode: HttpStatusCode.BadRequest
                })
              }

              // Check branch_id validity if provided
              if (value) {
                const branch = await databaseServiceSale.branch.findOne({ _id: new ObjectId(value) })
                if (!branch) {
                  throw new ErrorWithStatusCode({
                    message: branchMessages.BRANCH_NOT_FOUND,
                    statusCode: HttpStatusCode.NotFound
                  })
                }
              }
            }

            return true
          }
        }
      }
    },
    ['body', 'query', 'params']
  )
)

/**
 * Alternative branch validation for arrays of branch IDs in requests
 */
export const requireBranchArrayValidator = validate(
  checkSchema(
    {
      branch: {
        custom: {
          options: async (value: string[], { req }) => {
            const { decode_authorization } = req
            const { role } = decode_authorization as TokenPayload

            // For admin, ensure branch array is provided
            if (role === UserRole.ADMIN) {
              if (!value && !req.body?.branch_id && !(req.query && req.query.branch_id)) {
                throw new ErrorWithStatusCode({
                  message: branchMessages.BRANCH_REQUIRED,
                  statusCode: HttpStatusCode.BadRequest
                })
              }

              // Validate each branch ID if provided
              if (Array.isArray(value) && value.length > 0) {
                for (const branchId of value) {
                  const branch = await databaseServiceSale.branch.findOne({
                    _id: new ObjectId(branchId)
                  })

                  if (!branch) {
                    throw new ErrorWithStatusCode({
                      message: `${branchMessages.BRANCH_NOT_FOUND}: ${branchId}`,
                      statusCode: HttpStatusCode.NotFound
                    })
                  }
                }
              }
            }

            return true
          }
        }
      }
    },
    ['body', 'query']
  )
)
