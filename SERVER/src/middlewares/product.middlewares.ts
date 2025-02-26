import { checkSchema } from 'express-validator'
import { productMessages } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const CreateProductValidator = validate(
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
      user_id: {
        isString: true,
        isMongoId: true,
        errorMessage: productMessages.INVALID_ID
      },
      code: {
        isString: true,
        notEmpty: true,
        optional: true,
        errorMessage: productMessages.CODE_MUST_BE_STRING
      },
      price: {
        isInt: {
          options: { min: 0 },
          errorMessage: productMessages.PRICE_MUST_BE_NUMBER_GREATER_THAN_ZERO
        },
        toInt: true,
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
        isInt: {
          options: { min: 0 },
          errorMessage: productMessages.IN_STOCK_MUST_BE_NUMBER_GREATER_THAN_ZERO
        },
        optional: true,
        errorMessage: productMessages.IN_STOCK_MUST_BE_NUMBER
      },
      is_consumable: {
        isBoolean: true,
        optional: true,
        errorMessage: productMessages.IS_CONSUMABLE_MUST_BE_BOOLEAN
      }
    },
    ['body']
  )
)

export const DeleteProductValidator = validate(
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

export const UpdateProductValidator = validate(
  checkSchema(
    {
      name: {
        isString: true,
        notEmpty: true,
        errorMessage: productMessages.NAME_MUST_BE_STRING,
        optional: true
      },
      id: {
        isString: true,
        isMongoId: true,
        errorMessage: productMessages.INVALID_ID
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
        isInt: {
          options: { min: 0 },
          errorMessage: productMessages.PRICE_MUST_BE_NUMBER_GREATER_THAN_ZERO
        },
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
        isInt: {
          options: { min: 0 },
          errorMessage: productMessages.IN_STOCK_MUST_BE_NUMBER_GREATER_THAN_ZERO
        },
        optional: true,
        errorMessage: productMessages.IN_STOCK_MUST_BE_NUMBER,
        toInt: true
      }
    },
    ['body']
  )
)
