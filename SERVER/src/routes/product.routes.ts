import { Router } from 'express'
import { createProduct, deleteProduct, updateProduct } from '~/controllers/product.controllers'
import {
  CreateProductValidator,
  DeleteProductValidator,
  UpdateProductValidator
} from '~/middlewares/product.middlewares'
import { accessTokenValidator, isAdminValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const productRouters = Router()

/*
Description: Create Product 
path: /
method: POST
Body:{ branch?: string[] ,code: string,price?: number ,label?: string ,category?: string ,type?: string ,name: string ,unit?: string ,inStock?: number}
*/

productRouters.post(
  '/',
  accessTokenValidator,
  isAdminValidator,
  CreateProductValidator,
  wrapRequestHandler(createProduct)
)

/*
Description: Delete Product 
path: /:id
method: DELETE
*/

productRouters.delete(
  '/:id',
  accessTokenValidator,
  isAdminValidator,
  DeleteProductValidator,
  wrapRequestHandler(deleteProduct)
)

/*
Description: Update Product 
path: /
method: PATCH
Body:{ branch?: string[] ,code?: string,price?: number ,label?: string ,category?: string ,type?: string ,name: string ,unit?: string ,inStock?: number}
*/

productRouters.patch(
  '/',
  accessTokenValidator,
  isAdminValidator,
  UpdateProductValidator,
  wrapRequestHandler(updateProduct)
)

export default productRouters
