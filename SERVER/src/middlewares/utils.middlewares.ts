import { checkSchema } from 'express-validator'
import { utilsMessages } from '~/constants/messages'
import { validate } from '~/utils/validation'

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
