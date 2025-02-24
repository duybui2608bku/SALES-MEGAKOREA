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
