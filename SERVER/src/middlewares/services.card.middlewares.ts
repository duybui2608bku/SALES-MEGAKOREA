import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { HttpStatusCode, TypeCommision } from '~/constants/enum'
import { servicesMessages } from '~/constants/messages'
import { EmployeeOfServices, ServicesOfCard } from '~/interface/services/services.interface'
import { ErrorWithStatusCode } from '~/models/Errors'
import { validate } from '~/utils/validation'

export const CreateServicesCardValidator = validate(
  checkSchema(
    {
      code: {
        isString: {
          errorMessage: servicesMessages.CODE_MUST_BE_STRING
        },
        optional: true,
        trim: true
      },
      customer_id: {
        isString: {
          errorMessage: servicesMessages.CUSTOMER_ID_MUST_BE_STRING
        },
        isMongoId: {
          errorMessage: servicesMessages.INVALID_ID
        },
        optional: true
      },
      is_active: {
        isBoolean: {
          errorMessage: servicesMessages.IS_ACTIVE_MUST_BE_BOOLEAN
        },
        optional: true
      },
      name: {
        isString: {
          errorMessage: servicesMessages.NAME_MUST_BE_STRING
        },
        notEmpty: {
          errorMessage: servicesMessages.NAME_MUST_NOT_BE_EMPTY
        },
        trim: true,
        optional: true
      },
      branch: {
        isArray: {
          errorMessage: servicesMessages.BRANCH_MUST_BE_ARRAY_STRING
        },
        optional: true,
        custom: {
          options: (value: string[]) => {
            if (value && !value.every((item) => typeof item === 'string' && ObjectId.isValid(item))) {
              throw new Error(servicesMessages.BRANCH_MUST_BE_ARRAY_STRING)
            }
            return true
          }
        }
      },
      descriptions: {
        isString: {
          errorMessage: servicesMessages.DESCRIPTIONS_MUST_BE_STRING
        },
        optional: true,
        trim: true
      },
      session_time: {
        isNumeric: {
          errorMessage: servicesMessages.SESSION_TIME_MUST_BE_NUMBER_GREATER_THAN_ZERO
        },
        isInt: {
          options: { min: 0 },
          errorMessage: servicesMessages.SESSION_TIME_MUST_BE_NUMBER_GREATER_THAN_ZERO
        },
        optional: true
      },
      price: {
        isNumeric: {
          errorMessage: servicesMessages.PRICE_MUST_BE_NUMBER_GREATER_THAN_ZERO
        },
        isInt: {
          options: { min: 0 },
          errorMessage: servicesMessages.PRICE_MUST_BE_NUMBER_GREATER_THAN_ZERO
        },
        optional: true
      },
      price_paid: {
        isNumeric: {
          errorMessage: servicesMessages.PRICE_MUST_BE_NUMBER_GREATER_THAN_ZERO
        },
        isInt: {
          options: { min: 0 },
          errorMessage: servicesMessages.PRICE_MUST_BE_NUMBER_GREATER_THAN_ZERO
        },
        optional: true
      },
      user_id: {
        isString: {
          errorMessage: servicesMessages.EMPOYEE_ID_MUST_BE_STRING
        },
        isMongoId: {
          errorMessage: servicesMessages.INVALID_ID
        },
        optional: true
      },
      service_group_id: {
        isString: {
          errorMessage: servicesMessages.SERVICE_GROUP_ID_MUST_BE_STRING
        },
        isMongoId: {
          errorMessage: servicesMessages.INVALID_ID
        },
        optional: { options: { nullable: true, checkFalsy: true } }
      },
      services_of_card: {
        isArray: {
          errorMessage: servicesMessages.SERVICES_OF_CARD_MUST_BE_ARRAY
        },
        optional: true,
        custom: {
          options: (value: ServicesOfCard[]) => {
            if (!value) return true
            value.forEach((service) => {
              if (!ObjectId.isValid(service.services_id || '')) {
                throw new ErrorWithStatusCode({
                  message: servicesMessages.EMPOYEE_ID_MUST_BE_STRING_AND_OBJECT_ID,
                  statusCode: HttpStatusCode.BadRequest
                })
              }
              if (typeof service.quantity !== 'number' || service.quantity < 0) {
                throw new ErrorWithStatusCode({
                  message: servicesMessages.QUANTITY_MUST_BE_NUMBER_GREATER_THAN_ZERO,
                  statusCode: HttpStatusCode.BadRequest
                })
              }
              if (service.discount !== undefined && typeof service.discount !== 'number' && service.discount < 0) {
                throw new ErrorWithStatusCode({
                  message: servicesMessages.PRICE_MUST_BE_NUMBER_GREATER_THAN_ZERO,
                  statusCode: HttpStatusCode.BadRequest
                })
              }
              if (service.price !== undefined && typeof service.price !== 'number' && service.price < 0) {
                throw new ErrorWithStatusCode({
                  message: servicesMessages.PRICE_MUST_BE_NUMBER_GREATER_THAN_ZERO,
                  statusCode: HttpStatusCode.BadRequest
                })
              }
            })
            return true
          }
        }
      },
      employee: {
        isArray: {
          errorMessage: servicesMessages.EMPLOYEE_MUST_BE_ARRAY
        },
        optional: true,
        custom: {
          options: (value: EmployeeOfServices[]) => {
            if (!value) return true
            value.forEach((employee) => {
              if (!ObjectId.isValid(employee.id_employee)) {
                throw new ErrorWithStatusCode({
                  message: servicesMessages.EMPOYEE_ID_MUST_BE_STRING_AND_OBJECT_ID,
                  statusCode: HttpStatusCode.BadRequest
                })
              }
              if (
                (employee.commision !== undefined && typeof employee.commision !== 'number') ||
                employee.commision < 0
              ) {
                throw new ErrorWithStatusCode({
                  message: servicesMessages.PRICE_MUST_BE_NUMBER_GREATER_THAN_ZERO,
                  statusCode: HttpStatusCode.BadRequest
                })
              }
              if (employee.type_price !== TypeCommision.FIXED && employee.type_price !== TypeCommision.PRECENT) {
                throw new ErrorWithStatusCode({
                  message: servicesMessages.TYPE_PRICE_MUST_BE_FIXED_OR_PERCENT,
                  statusCode: HttpStatusCode.BadRequest
                })
              }
            })
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const UpdateHistoryPaidOfCardValidator = validate(
  checkSchema({
    card_services_id: {
      isString: {
        errorMessage: servicesMessages.CARD_SERVICE_ID_MUST_BE_STRING
      },
      isMongoId: {
        errorMessage: servicesMessages.INVALID_ID
      }
    },
    code: {
      isString: {
        errorMessage: servicesMessages.CODE_MUST_BE_STRING
      },
      trim: true
    },
    date: {
      isString: {
        errorMessage: servicesMessages.DATE_MUST_BE_STRING
      },
      trim: true
    },
    paid: {
      isInt: {
        options: { min: 0 },
        errorMessage: servicesMessages.PRICE_MUST_BE_NUMBER_GREATER_THAN_ZERO
      }
    },
    paid_initial: {
      isInt: {
        options: { min: 0 },
        errorMessage: servicesMessages.PRICE_INITIAL_MUST_BE_NUMBER_GREATER_THAN_ZERO
      }
    },
    out_standing: {
      isInt: {
        errorMessage: servicesMessages.OUT_STANDING_MUST_BE_NUMBER
      }
    },
    user_id: {
      isString: {
        errorMessage: servicesMessages.EMPOYEE_ID_MUST_BE_STRING
      },
      isMongoId: {
        errorMessage: servicesMessages.INVALID_ID
      }
    },
    method: {
      isString: {
        errorMessage: servicesMessages.METHOD_PAYMENT_MUST_BE_STRING
      },
      trim: true
    },
    descriptions: {
      isString: {
        errorMessage: servicesMessages.DESCRIPTIONS_MUST_BE_STRING
      },
      optional: true,
      trim: true
    }
  })
)
