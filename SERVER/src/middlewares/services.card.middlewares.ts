import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import databaseServiceSale from 'services/database.services.sale'
import { GetServicesCardSoldOfCustomerSearchType, HttpStatusCode } from '~/constants/enum'
import { paginationMessages, servicesMessages, userMessages } from '~/constants/messages'
import { ServicesOfCard } from '~/interface/services/services.interface'
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
      user_id: {
        isString: {
          errorMessage: servicesMessages.EMPOYEE_ID_MUST_BE_STRING
        },
        isMongoId: {
          errorMessage: servicesMessages.INVALID_ID
        },
        custom: {
          options: async (value: string) => {
            const user = await databaseServiceSale.users.findOne({ _id: new ObjectId(value) })
            if (!user) {
              throw new ErrorWithStatusCode({
                message: userMessages.USER_NOT_FOUND,
                statusCode: HttpStatusCode.NotFound
              })
            }
            return true
          }
        },
        optional: true
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
      },
      custom: {
        options: async (value: string) => {
          const user = await databaseServiceSale.users.findOne({ _id: new ObjectId(value) })
          if (!user) {
            throw new ErrorWithStatusCode({
              message: userMessages.USER_NOT_FOUND,
              statusCode: HttpStatusCode.NotFound
            })
          }
          return true
        }
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

export const CreateServicesCardSoldValidator = validate(
  checkSchema(
    {
      services_card_id: {
        isArray: {
          errorMessage: servicesMessages.SERVICES_CARD_ID_MUST_BE_ARRAY
        },
        custom: {
          options: (value: string[]) => {
            if (value && !value.every((item) => typeof item === 'string' && ObjectId.isValid(item))) {
              throw new Error(servicesMessages.SERVICES_CARD_ID_MUST_BE_ARRAY)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const CreateServicesCardSoldOfCustomerValidator = validate(
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
        }
      },
      descriptions: {
        isString: {
          errorMessage: servicesMessages.DESCRIPTIONS_MUST_BE_STRING
        },
        optional: true,
        trim: true
      },
      branch: {
        isArray: {
          errorMessage: servicesMessages.BRANCH_MUST_BE_ARRAY_STRING
        },
        custom: {
          options: (value: string[]) => {
            if (value && !value.every((item) => typeof item === 'string' && ObjectId.isValid(item))) {
              throw new Error(servicesMessages.BRANCH_MUST_BE_ARRAY_STRING)
            }
            return true
          }
        }
      },
      card_services_sold_id: {
        isArray: {
          errorMessage: servicesMessages.CARD_SERVICES_SOLD_ID_MUST_BE_ARRAY
        },
        custom: {
          options: (value: string[]) => {
            if (value && !value.every((item) => typeof item === 'string' && ObjectId.isValid(item))) {
              throw new Error(servicesMessages.CARD_SERVICES_SOLD_ID_MUST_BE_ARRAY)
            }
            return true
          }
        }
      },
      user_id: {
        isString: {
          errorMessage: servicesMessages.EMPOYEE_ID_MUST_BE_STRING
        },
        isMongoId: {
          errorMessage: servicesMessages.INVALID_ID
        },
        custom: {
          options: async (value: string) => {
            const user = await databaseServiceSale.users.findOne({ _id: new ObjectId(value) })
            if (!user) {
              throw new ErrorWithStatusCode({
                message: userMessages.USER_NOT_FOUND,
                statusCode: HttpStatusCode.NotFound
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const GetServicesCardSoldOfCustomerValidator = validate(
  checkSchema(
    {
      page: {
        isInt: {
          options: { min: 0 },
          errorMessage: paginationMessages.PAGE_MUST_BE_NUMBER_GREATER_THAN_ZERO
        }
      },
      limit: {
        isInt: {
          options: { min: 0 },
          errorMessage: paginationMessages.LIMIT_MUST_BE_NUMBER_GREATER_THAN_ZERO
        }
      },
      branch: {
        isArray: {
          errorMessage: servicesMessages.BRANCH_MUST_BE_ARRAY_STRING
        },
        custom: {
          options: (value: string[]) => {
            if (value && !value.every((item) => typeof item === 'string' && ObjectId.isValid(item))) {
              throw new Error(servicesMessages.BRANCH_MUST_BE_ARRAY_STRING)
            }
            return true
          }
        },
        optional: true
      },
      date: {
        isString: {
          errorMessage: servicesMessages.DATE_MUST_BE_STRING
        },
        optional: true,
        trim: true
      },
      search: {
        isString: {
          errorMessage: servicesMessages.SEARCH_MUST_BE_STRING
        },
        optional: true,
        trim: true
      },
      search_type: {
        isInt: {
          errorMessage: servicesMessages.SEARCH_TYPE_MUST_BE_NUMBER,
          options: {
            min: GetServicesCardSoldOfCustomerSearchType.NAME_CUSTOMER,
            max: GetServicesCardSoldOfCustomerSearchType.PHONE__CUSTOMER
          }
        },
        optional: true
      }
    },
    ['body']
  )
)

export const UpdateHistoryPaidOfServicesCardValidator = validate(
  checkSchema(
    {
      services_card_sold_of_customer_id: {
        isString: {
          errorMessage: servicesMessages.SERVICES_CARD_SOLD_OF_CUSTOMER_ID_MUST_BE_STRING
        },
        isMongoId: {
          errorMessage: servicesMessages.INVALID_ID
        }
      },
      paid: {
        isInt: {
          options: { min: 0 },
          errorMessage: servicesMessages.PRICE_MUST_BE_NUMBER_GREATER_THAN_ZERO
        },
        custom: {
          options: (value) => {
            if (typeof value !== 'number' || !Number.isInteger(value)) {
              throw new Error(servicesMessages.PRICE_MUST_BE_NUMBER_GREATER_THAN_ZERO)
            }
            return true
          }
        }
      },
      out_standing: {
        isInt: {
          errorMessage: servicesMessages.OUT_STANDING_MUST_BE_NUMBER
        },
        custom: {
          options: (value) => {
            if (typeof value !== 'number' || !Number.isInteger(value)) {
              throw new Error(servicesMessages.PRICE_MUST_BE_NUMBER_GREATER_THAN_ZERO)
            }
            return true
          }
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
      },
      user_id: {
        isString: {
          errorMessage: servicesMessages.EMPOYEE_ID_MUST_BE_STRING
        },
        isMongoId: {
          errorMessage: servicesMessages.INVALID_ID
        },
        custom: {
          options: async (value: string) => {
            const user = await databaseServiceSale.users.findOne({ _id: new ObjectId(value) })
            if (!user) {
              throw new ErrorWithStatusCode({
                message: userMessages.USER_NOT_FOUND,
                statusCode: HttpStatusCode.NotFound
              })
            }
            return true
          }
        }
      },
      date: {
        isString: {
          errorMessage: servicesMessages.DATE_MUST_BE_STRING
        },
        trim: true,
        optional: true
      }
    },
    ['body']
  )
)

export const DeleteHistoryPaidOfServicesCardValidator = validate(
  checkSchema(
    {
      id: {
        isString: {
          errorMessage: servicesMessages.HISTORY_PAID_ID_MUST_BE_STRING
        },
        isMongoId: {
          errorMessage: servicesMessages.INVALID_ID
        }
      }
    },
    ['params']
  )
)

export const UpdateServicesCardSoldOfCustomerValidator = validate(
  checkSchema({
    _id: {
      isString: {
        errorMessage: servicesMessages.SERVICES_CARD_SOLD_OF_CUSTOMER_ID_MUST_BE_STRING
      },
      isMongoId: {
        errorMessage: servicesMessages.INVALID_ID
      }
    },
    card_services_sold_id: {
      isArray: {
        errorMessage: servicesMessages.CARD_SERVICES_SOLD_ID_MUST_ARRAY_STRING
      },
      isMongoId: {
        errorMessage: servicesMessages.INVALID_ID
      },
      optional: true
    },
    history_paid_id: {
      isString: {
        errorMessage: servicesMessages.HISTORY_PAID_ID_MUST_BE_STRING
      },
      isMongoId: {
        errorMessage: servicesMessages.INVALID_ID
      },
      optional: true
    },
    employee_commision_id: {
      isArray: {
        errorMessage: servicesMessages.EMPLOYEE_COMMISSION_ID_MUST_BE_ARRAY
      },
      custom: {
        options: (value: string[]) => {
          if (value && !value.every((item) => typeof item === 'string' && ObjectId.isValid(item))) {
            throw new Error(servicesMessages.EMPLOYEE_COMMISSION_ID_MUST_BE_ARRAY)
          }
          return true
        }
      },
      optional: true
    }
  })
)

export const DeleteSerivcesCardValidator = validate(
  checkSchema(
    {
      id: {
        isString: {
          errorMessage: servicesMessages.SERVICES_CARD_ID_MUST_BE_STRING
        },
        isMongoId: {
          errorMessage: servicesMessages.INVALID_ID
        }
      }
    },
    ['params']
  )
)
