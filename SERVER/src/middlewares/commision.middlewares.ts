import { checkSchema } from 'express-validator'
import { HttpStatusCode } from '~/constants/enum'
import { commisionMessages, dateMessages, servicesMessages, userMessages } from '~/constants/messages'
import { ErrorWithStatusCode } from '~/models/Errors'
import { validate } from '~/utils/validation'

export const CreateCommisionOfSellerValidator = validate(
  checkSchema(
    {
      user_id: {
        isString: {
          errorMessage: servicesMessages.EMPOYEE_ID_MUST_BE_STRING
        },
        isMongoId: {
          errorMessage: servicesMessages.INVALID_ID
        }
      },
      commision: {
        isInt: {
          options: { min: 0 },
          errorMessage: commisionMessages.COMMISION_MUST_BE_NUMBER_GREATER_THAN_ZERO
        },
        custom: {
          options: (value) => {
            if (typeof value !== 'number' || !Number.isInteger(value)) {
              throw new Error(commisionMessages.COMMISION_MUST_BE_NUMBER_GREATER_THAN_ZERO)
            }
            return true
          }
        }
      },

      services_card_sold_of_customer_id: {
        isString: {
          errorMessage: servicesMessages.SERVICES_CARD_SOLD_OF_CUSTOMER_ID_MUST_BE_STRING
        },
        isMongoId: {
          errorMessage: servicesMessages.INVALID_ID
        }
      }
    },
    ['body']
  )
)

export const GetCommisionOfSellerByUserIdValidator = validate(
  checkSchema(
    {
      user_id: {
        in: ['params'],
        isString: {
          errorMessage: userMessages.ID_MUST_BE_STRING
        },
        isMongoId: {
          errorMessage: servicesMessages.INVALID_ID
        }
      },
      start_date: {
        optional: true,
        isISO8601: {
          errorMessage: dateMessages.START_DATE_MUST_BE_DATE
        },
        custom: {
          options: (value) => {
            const startDate = new Date(value)
            const now = new Date()
            if (startDate > now) {
              throw new ErrorWithStatusCode({
                message: dateMessages.START_DATE_CANNOT_BE_IN_FUTURE,
                statusCode: HttpStatusCode.BadRequest
              })
            }
            return true
          }
        }
      },
      end_date: {
        optional: true,
        isISO8601: {
          errorMessage: dateMessages.END_DATE_MUST_BE_DATE
        },
        custom: {
          options: (value, { req }) => {
            const endDate = new Date(value)
            const now = new Date()
            if (endDate > now) {
              throw new ErrorWithStatusCode({
                message: dateMessages.END_DATE_CANNOT_BE_IN_FUTURE,
                statusCode: HttpStatusCode.BadRequest
              })
            }
            if (req?.query?.start_date) {
              const startDate = new Date(req.query.start_date)
              const endDate = new Date(value)
              if (endDate < startDate) {
                throw new ErrorWithStatusCode({
                  message: dateMessages.END_DATE_CANNOT_BE_BEFORE_START_DATE,
                  statusCode: HttpStatusCode.BadRequest
                })
              }
            }
            return true
          }
        }
      }
    },
    ['query', 'params']
  )
)
