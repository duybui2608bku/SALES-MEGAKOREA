import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'

export const addAccountValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: true,
        isString: true
      },
      service: {
        isString: true,
        notEmpty: true
      },
      branch_id: {
        isMongoId: true,
        notEmpty: true
      }
    },
    ['body']
  )
)

export const getAccountOfMeValidator = validate(
  checkSchema(
    {
      branch_id: {
        isMongoId: true,
        notEmpty: true
      },
      report_date: {
        isString: true,
        notEmpty: true
      }
    },
    ['query']
  )
)
