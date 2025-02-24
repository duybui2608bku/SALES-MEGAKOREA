import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'

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
