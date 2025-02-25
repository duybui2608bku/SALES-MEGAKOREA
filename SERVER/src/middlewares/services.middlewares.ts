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

export const CreateServicesValidator = validate(
  checkSchema(
    {
      is_active: {
        isBoolean: true,
        optional: true
      },
      name: {
        isString: true,
        notEmpty: true
      },
      branch: {
        isArray: true,
        errorMessage: servicesMessages.BRANCH_MUST_BE_ARRAY_STRING,
        optional: true
      },
      descriptions: {
        isString: true,
        errorMessage: servicesMessages.DESCRIPTIONS_MUST_BE_STRING,
        optional: true
      },
      service_group_id: {
        isString: true,
        isMongoId: true,
        errorMessage: servicesMessages.INVALID_ID,
        optional: { options: { nullable: true, checkFalsy: true } }
      },
      price: {
        isNumeric: true,
        optional: true
      },
      id_employee: {
        isString: true,
        isMongoId: true,
        optional: { options: { nullable: true, checkFalsy: true } }
      },
      tour_price: {
        isNumeric: true,
        optional: true
      },
      type_tour_price: {
        isNumeric: true,
        optional: true
      },
      id_consumables: {
        isString: true,
        isMongoId: true,
        errorMessage: servicesMessages.INVALID_ID,
        optional: { options: { nullable: true, checkFalsy: true } }
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
      },
      service_group_id: {
        isString: true,
        isMongoId: true,
        errorMessage: servicesMessages.INVALID_ID,
        optional: { options: { nullable: true, checkFalsy: true } }
      },
      price: {
        isNumeric: true,
        optional: true
      },
      id_employee: {
        isString: true,
        isMongoId: true,
        errorMessage: servicesMessages.INVALID_ID,
        optional: { options: { nullable: true, checkFalsy: true } }
      },
      tour_price: {
        isNumeric: true,
        optional: true
      },
      type_tour_price: {
        isNumeric: true,
        optional: true
      },
      id_consumables: {
        isString: true,
        isMongoId: true,
        errorMessage: servicesMessages.INVALID_ID,
        optional: { options: { nullable: true, checkFalsy: true } }
      }
    },
    ['body']
  )
)
