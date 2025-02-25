import { Router } from 'express'
import { createConsumables, deleteConsumables, updateConsumables } from '~/controllers/product.controllers'
import {
  CreateConsumablesValidator,
  DeleteConsumablesValidator,
  UpdateConsumablesValidator
} from '~/middlewares/product.middlewares'
import { accessTokenValidator, isAdminValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const productRouters = Router()

/*
Description: Create Consumables
path: /consumables
method: POST
Body:{ branch?: string[] ,code: string,price?: number ,label?: string ,category?: string ,type?: string ,name: string ,unit?: string ,inStock?: number}
*/

productRouters.post(
  '/consumables',
  accessTokenValidator,
  isAdminValidator,
  CreateConsumablesValidator,
  wrapRequestHandler(createConsumables)
)

/*
Description: Delete Consumables
path: /consumables/:id
method: DELETE
*/

productRouters.delete(
  '/consumables/:id',
  accessTokenValidator,
  isAdminValidator,
  DeleteConsumablesValidator,
  wrapRequestHandler(deleteConsumables)
)

/*
Description: Update Consumables
path: /consumables
method: PATCH
Body:{ branch?: string[] ,code?: string,price?: number ,label?: string ,category?: string ,type?: string ,name: string ,unit?: string ,inStock?: number}
*/

productRouters.patch(
  '/consumables',
  accessTokenValidator,
  isAdminValidator,
  UpdateConsumablesValidator,
  wrapRequestHandler(updateConsumables)
)

export default productRouters
