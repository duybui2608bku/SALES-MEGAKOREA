import { Router } from 'express'
import {
  createProduct,
  deleteProduct,
  getAllProduct,
  importProducts,
  SearchProduct,
  updateProduct
} from '~/controllers/product.controllers'
import {
  CreateProductValidator,
  DeleteProductValidator,
  UpdateProductValidator
} from '~/middlewares/product.middlewares'
import { accessTokenValidator, isAdminValidator } from '~/middlewares/users.middlewares'
import { paginatonValidator } from '~/middlewares/utils.middlewares'
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

/*
Description: Get All Product 
path: /
method: GET
Query: { page: string, limit: string, branch?: string ,is_consumable: boolean }
*/

productRouters.get('/', accessTokenValidator, isAdminValidator, paginatonValidator, wrapRequestHandler(getAllProduct))

/*
Description: Search Product 
path: /search
method: GET
Query: { branch?: string,q: string,is_consumable: boolean }
*/

productRouters.get('/search', accessTokenValidator, isAdminValidator, wrapRequestHandler(SearchProduct))

/*
Description: Import multiple products
path: /import
method: POST
Body: { file: any }
*/

productRouters.post('/import', accessTokenValidator, isAdminValidator, wrapRequestHandler(importProducts))

export default productRouters
