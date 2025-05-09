import { Router } from 'express'
import {
  createProduct,
  deleteProduct,
  getAllProduct,
  importProducts,
  updateProduct,
  updateStockProduct
} from '~/controllers/product.controllers'
import {
  CreateProductValidator,
  DeleteProductValidator,
  UpdateProductValidator
} from '~/middlewares/product.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
import { branchAccessMiddleware } from '~/middlewares/utils.middlewares'
import { requireBranchArrayValidator } from '~/middlewares/branch.middlewares'

const productRouters = Router()

/*
Description: Create Product 
path: /
method: POST
Body:{ branch?: string[] ,code: string,price?: number ,label?: string ,category?: string ,type?: string ,name: string ,unit?: string ,inStock?: number}
*/

productRouters.post(
  '/add',
  accessTokenValidator,
  CreateProductValidator,
  branchAccessMiddleware,
  wrapRequestHandler(createProduct)
)

productRouters.post(
  '/add-general',
  accessTokenValidator,
  CreateProductValidator,
  branchAccessMiddleware,
  wrapRequestHandler(createProduct)
)

/*
Description: Delete Product 
path: /:id
method: DELETE
*/

productRouters.delete('/delete/:id', accessTokenValidator, DeleteProductValidator, wrapRequestHandler(deleteProduct))

/*
Description: Update Product 
path: /
method: PATCH
Body:{ branch?: string[] ,code?: string,price?: number ,label?: string ,category?: string ,type?: string ,name: string ,unit?: string ,inStock?: number}
*/

productRouters.patch(
  '/update/:id',
  accessTokenValidator,
  UpdateProductValidator,
  branchAccessMiddleware,
  wrapRequestHandler(updateProduct)
)

/*
Description: Get All Product 
path: /
method: GET
Query: { page: string, limit: string, branch?: string ,is_consumable: boolean }
*/

productRouters.get(
  '/all',
  accessTokenValidator,
  branchAccessMiddleware,
  requireBranchArrayValidator,
  wrapRequestHandler(getAllProduct)
)

/*
Description: Import multiple products
path: /import
method: POST
Body: { file: any }
*/

productRouters.post(
  '/import/:id',
  accessTokenValidator,
  UpdateProductValidator,
  branchAccessMiddleware,
  wrapRequestHandler(importProducts)
)

productRouters.post(
  '/update-stock/:id',
  accessTokenValidator,
  UpdateProductValidator,
  branchAccessMiddleware,
  wrapRequestHandler(updateStockProduct)
)

export default productRouters
