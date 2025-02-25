import { checkSchema } from 'express-validator'
import { productMessages } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const CreateConsumablesValidator = validate(
  checkSchema(
    {
      name: {
        isString: true,
        notEmpty: true,
        errorMessage: productMessages.NAME_MUST_BE_STRING
      },
      branch: {
        isArray: true,
        optional: true,
        errorMessage: productMessages.BRANCH_MUST_BE_ARRAY_STRING
      },
      code: {
        isString: true,
        notEmpty: true,
        optional: true,
        errorMessage: productMessages.CODE_MUST_BE_STRING
      },
      price: {
        isNumeric: true,
        optional: true,
        errorMessage: productMessages.PRICE_MUST_BE_NUMBER
      },
      label: {
        isString: true,
        optional: true,
        errorMessage: productMessages.LABEL_MUST_BE_STRING
      },
      category: {
        isString: true,
        optional: true,
        errorMessage: productMessages.CATEGORY_MUST_BE_STRING
      },
      type: {
        isString: true,
        optional: true,
        errorMessage: productMessages.TYPE_MUST_BE_STRING
      },
      unit: {
        isString: true,
        optional: true,
        errorMessage: productMessages.UNIT_MUST_BE_STRING
      },
      inStock: {
        isNumeric: true,
        optional: true,
        errorMessage: productMessages.IN_STOCK_MUST_BE_NUMBER
      }
    },
    ['body']
  )
)

export const DeleteConsumablesValidator = validate(
  checkSchema(
    {
      id: {
        isString: true,
        isMongoId: true,
        errorMessage: productMessages.INVALID_ID
      }
    },
    ['params']
  )
)

export const UpdateConsumablesValidator = validate(
  checkSchema(
    {
      name: {
        isString: true,
        notEmpty: true,
        errorMessage: productMessages.NAME_MUST_BE_STRING,
        optional: true
      },
      branch: {
        isArray: true,
        optional: true,
        errorMessage: productMessages.BRANCH_MUST_BE_ARRAY_STRING
      },
      code: {
        isString: true,
        notEmpty: true,
        optional: true,
        errorMessage: productMessages.CODE_MUST_BE_STRING
      },
      price: {
        isNumeric: true,
        optional: true,
        errorMessage: productMessages.PRICE_MUST_BE_NUMBER
      },
      label: {
        isString: true,
        optional: true,
        errorMessage: productMessages.LABEL_MUST_BE_STRING
      },
      category: {
        isString: true,
        optional: true,
        errorMessage: productMessages.CATEGORY_MUST_BE_STRING
      },
      type: {
        isString: true,
        optional: true,
        errorMessage: productMessages.TYPE_MUST_BE_STRING
      },
      unit: {
        isString: true,
        optional: true,
        errorMessage: productMessages.UNIT_MUST_BE_STRING
      },
      inStock: {
        isNumeric: true,
        optional: true,
        errorMessage: productMessages.IN_STOCK_MUST_BE_NUMBER
      }
    },
    ['body']
  )
)
