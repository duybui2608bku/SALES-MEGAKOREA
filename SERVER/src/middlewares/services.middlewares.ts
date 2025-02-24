import { checkSchema } from 'express-validator'
import { servicesMessages } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const CreateServicesCategoryValidator = validate(
  checkSchema(
    {
      name: {
        isString: true,
        notEmpty: true
      },
      branch: {
        isArray: true,
        errorMessage: servicesMessages.BRANCH_MUST_BE_ARRAY_STRING
      }
    },
    ['body']
  )
)

export const DeleteServicesCategoryValidator = validate(
  checkSchema(
    {
      id: {
        isString: true,
        isMongoId: true,
        errorMessage: servicesMessages.INVALID_ID
      }
    },
    ['params']
  )
)

export const upDateCategoryValidator = validate(
  checkSchema(
    {
      id: {
        isString: true,
        isMongoId: true,
        errorMessage: servicesMessages.INVALID_ID
      },
      name: {
        isString: true,
        optional: true
      },
      branch: {
        isArray: true,
        optional: true,
        errorMessage: servicesMessages.BRANCH_MUST_BE_ARRAY_STRING
      },
      descriptions: {
        isString: true,
        optional: true
      }
    },
    ['body']
  )
)
