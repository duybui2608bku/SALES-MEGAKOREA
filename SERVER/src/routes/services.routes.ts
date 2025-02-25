import { Router } from 'express'
import {
  createServices,
  createServicesCategory,
  deleteServices,
  deleteServicesCategory,
  updateServices,
  updateServicesCategory
} from '~/controllers/services.controllers'
import {
  CreateServicesCategoryValidator,
  CreateServicesValidator,
  DeleteServicesCategoryValidator,
  DeleteServicesValidator,
  upDateCategoryValidator,
  updateServicesValidator
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

/*
Description: Create Service Detail
path: /detail-create
method: POST
Body:{any}
*/

ServicesRouters.post(
  '/detail-create',
  accessTokenValidator,
  isAdminValidator,
  CreateServicesValidator,
  wrapRequestHandler(createServices)
)

/*
Description: Delete Service 
path: /detail-delete/:id
method: DELETE
Params: id
*/

ServicesRouters.delete(
  '/detail-delete/:id',
  accessTokenValidator,
  isAdminValidator,
  DeleteServicesValidator,
  wrapRequestHandler(deleteServices)
)

/*
Description: Updatge Service
path: /detail-update/
method: PATCH
Body:{id ?:string ,
name?: string,
branch?: string[],
descriptions?: string,
service_group_id?: string,
price?: number,
id_employee?: string,
tour_price?: number,
type_tour_price?: number,
id_consumables?: string}
}
*/

ServicesRouters.patch(
  '/detail-update',
  accessTokenValidator,
  isAdminValidator,
  updateServicesValidator,
  wrapRequestHandler(updateServices)
)

export default ServicesRouters
