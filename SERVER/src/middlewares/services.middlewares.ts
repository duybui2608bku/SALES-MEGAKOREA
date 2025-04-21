import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { HttpStatusCode } from '~/constants/enum'
import { productMessages, servicesMessages } from '~/constants/messages'
import { EmployeeOfServices, ProductOfServices, StepServicesType } from '~/interface/services/services.interface'
import { ErrorWithStatusCode } from '~/models/Errors'
import { validate } from '~/utils/validation'

export const CreateServicesCategoryValidator = validate(
  checkSchema(
    {
      name: {
        isString: true,
        notEmpty: true
      },
      descriptions: {
        isString: true,
        optional: true
      },
      branch: {
        isArray: true,
        optional: true,
        errorMessage: servicesMessages.BRANCH_MUST_BE_ARRAY_STRING
      },
      tour_price: {
        isNumeric: true,
        isInt: {
          options: { min: 0 },
          errorMessage: servicesMessages.TOUR_PRICE_MUST_BE_NUMBER_GREATER_THAN_ZERO
        },
        optional: true
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

export const UpDateCategoryValidator = validate(
  checkSchema(
    {
      _id: {
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
      },
      tour_price: {
        isNumeric: true,
        isInt: {
          options: { min: 0 },
          errorMessage: servicesMessages.TOUR_PRICE_MUST_BE_NUMBER_GREATER_THAN_ZERO
        },
        optional: true
      }
    },
    ['body']
  )
)

export const CreateServicesValidator = validate(
  checkSchema(
    {
      is_active: {
        isBoolean: {
          errorMessage: servicesMessages.IS_ACTIVE_MUST_BE_BOOLEAN
        },
        optional: true
      },
      code: {
        isString: {
          errorMessage: servicesMessages.CODE_MUST_BE_STRING
        },
        optional: true,
        trim: true
      },
      name: {
        isString: {
          errorMessage: servicesMessages.NAME_MUST_BE_STRING
        },
        notEmpty: {
          errorMessage: 'name cannot be empty'
        },
        trim: true
      },
      branch: {
        isArray: {
          errorMessage: servicesMessages.BRANCH_MUST_BE_ARRAY_STRING
        },
        optional: true,
        custom: {
          options: (value: any[]) => {
            if (value && !value.every((item) => typeof item === 'string')) {
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
      service_group_id: {
        isString: {
          errorMessage: servicesMessages.SERVICE_GROUP_ID_MUST_BE_STRING
        },
        isMongoId: {
          errorMessage: servicesMessages.INVALID_ID
        },
        optional: { options: { nullable: true, checkFalsy: true } }
      },
      step_services: {
        isArray: {
          errorMessage: servicesMessages.STEP_PRICE_MUST_BE_ARRAY
        },
        optional: true,
        custom: {
          options: (value: StepServicesType[]) => {
            if (!value) return true
            value.forEach((step) => {
              if (step.commision !== undefined && typeof step.commision !== 'number') {
                throw new ErrorWithStatusCode({
                  message: servicesMessages.STEP_PRICE_MUST_NUMBER,
                  statusCode: HttpStatusCode.BadRequest
                })
              }
              if (step.id_employee && !ObjectId.isValid(step.id_employee)) {
                throw new ErrorWithStatusCode({
                  message: servicesMessages.INVALID_ID,
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
              if (employee.id_employee && !ObjectId.isValid(employee.id_employee)) {
                throw new ErrorWithStatusCode({
                  message: servicesMessages.INVALID_ID,
                  statusCode: HttpStatusCode.BadRequest
                })
              }
              if (employee.commision && typeof employee.commision !== 'number') {
                throw new ErrorWithStatusCode({
                  message: servicesMessages.EMPLOYEE_PRICE_MUST_BE_NUMBER,
                  statusCode: HttpStatusCode.BadRequest
                })
              }
            })
            return true
          }
        }
      },
      products: {
        isArray: {
          errorMessage: productMessages.STEP_PRICE_MUST_BE_ARRAY
        },
        optional: true,
        custom: {
          options: (value: ProductOfServices[]) => {
            if (!value) return true
            value.forEach((product) => {
              if (!ObjectId.isValid(product.product_id)) {
                throw new ErrorWithStatusCode({
                  message: productMessages.PRODUCT_ID_MUST_BE_VALID,
                  statusCode: HttpStatusCode.BadRequest
                })
              }
              if (typeof product.quantity !== 'number' || product.quantity < 0) {
                throw new ErrorWithStatusCode({
                  message: productMessages.IN_STOCK_MUST_BE_NUMBER_GREATER_THAN_ZERO,
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

export const DeleteServicesValidator = validate(
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

export const updateServicesValidator = validate(
  checkSchema(
    {
      _id: {
        isString: true,
        isMongoId: true,
        errorMessage: servicesMessages.INVALID_ID
      },
      is_active: {
        isBoolean: {
          errorMessage: servicesMessages.IS_ACTIVE_MUST_BE_BOOLEAN
        },
        optional: true
      },

      code: {
        isString: {
          errorMessage: servicesMessages.CODE_MUST_BE_STRING
        },
        optional: true,
        trim: true
      },
      name: {
        isString: {
          errorMessage: servicesMessages.NAME_MUST_BE_STRING
        },
        notEmpty: {
          errorMessage: 'name cannot be empty'
        },
        trim: true
      },
      branch: {
        isArray: {
          errorMessage: servicesMessages.BRANCH_MUST_BE_ARRAY_STRING
        },
        optional: true,
        custom: {
          options: (value: any[]) => {
            if (value && !value.every((item) => typeof item === 'string')) {
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
      service_group_id: {
        isString: {
          errorMessage: servicesMessages.SERVICE_GROUP_ID_MUST_BE_STRING
        },
        isMongoId: {
          errorMessage: servicesMessages.INVALID_ID
        },
        optional: { options: { nullable: true, checkFalsy: true } }
      },
      step_services: {
        isArray: {
          errorMessage: servicesMessages.STEP_PRICE_MUST_BE_ARRAY
        },
        optional: true,
        custom: {
          options: (value: StepServicesType[]) => {
            if (!value) return true
            value.forEach((step) => {
              if (step.commision !== undefined && typeof step.commision !== 'number') {
                throw new ErrorWithStatusCode({
                  message: servicesMessages.STEP_PRICE_MUST_NUMBER,
                  statusCode: HttpStatusCode.BadRequest
                })
              }
              if (step.id_employee && !ObjectId.isValid(step.id_employee)) {
                throw new ErrorWithStatusCode({
                  message: servicesMessages.INVALID_ID,
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
              if (employee.id_employee && !ObjectId.isValid(employee.id_employee)) {
                throw new ErrorWithStatusCode({
                  message: servicesMessages.INVALID_ID,
                  statusCode: HttpStatusCode.BadRequest
                })
              }
              if (employee.commision && typeof employee.commision !== 'number') {
                throw new ErrorWithStatusCode({
                  message: servicesMessages.EMPLOYEE_PRICE_MUST_BE_NUMBER,
                  statusCode: HttpStatusCode.BadRequest
                })
              }
            })
            return true
          }
        }
      },
      products: {
        isArray: {
          errorMessage: productMessages.STEP_PRICE_MUST_BE_ARRAY
        },
        optional: true,
        custom: {
          options: (value: ProductOfServices[]) => {
            if (!value) return true
            value.forEach((product) => {
              if (!ObjectId.isValid(product.product_id)) {
                throw new ErrorWithStatusCode({
                  message: productMessages.PRODUCT_ID_MUST_BE_VALID,
                  statusCode: HttpStatusCode.BadRequest
                })
              }
              if (typeof product.quantity !== 'number' || product.quantity < 0) {
                throw new ErrorWithStatusCode({
                  message: productMessages.IN_STOCK_MUST_BE_NUMBER_GREATER_THAN_ZERO,
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
