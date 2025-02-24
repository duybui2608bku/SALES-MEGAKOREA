import { Router } from 'express'
import {
  createServicesCategory,
  deleteServicesCategory,
  updateServicesCategory
} from '~/controllers/services.controllers'
import {
  CreateServicesCategoryValidator,
  DeleteServicesCategoryValidator,
  upDateCategoryValidator
} from '~/middlewares/services.middlewares'
import { accessTokenValidator, deleteUserFormBranchValidator, isAdminValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const ServicesRouters = Router()

/*
Description: Create Service Category
path: /category-create
method: POST
Body:{name: string, descriptions: string, branch: string[]}
*/

ServicesRouters.post(
  '/category-create',
  accessTokenValidator,
  isAdminValidator,
  CreateServicesCategoryValidator,
  wrapRequestHandler(createServicesCategory)
)

/*
Description: Delete Service Category
path: /category-delete/:id
method: DELETE
Params: id
*/

ServicesRouters.delete(
  '/category-delete/:id',
  accessTokenValidator,
  isAdminValidator,
  DeleteServicesCategoryValidator,
  wrapRequestHandler(deleteServicesCategory)
)

/*
Description: Updatge Service Category
path: /category-update/
method: PATCH
Body:{id ?:string ,name?: string, descriptions?: string, branch?: string[]}
*/

ServicesRouters.patch(
  '/category-update',
  accessTokenValidator,
  isAdminValidator,
  upDateCategoryValidator,
  wrapRequestHandler(updateServicesCategory)
)

export default ServicesRouters
