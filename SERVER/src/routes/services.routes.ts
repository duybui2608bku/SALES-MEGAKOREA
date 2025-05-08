import { Router } from 'express'
import {
  createServices,
  createServicesCategory,
  createStepService,
  deleteServices,
  deleteServicesCategory,
  getAllServices,
  getAllServicesCategory,
  getStepService,
  updateServices,
  updateServicesCategory,
  updateStepService,
  deleteStepService
} from '~/controllers/services.controllers'
import {
  CreateServicesCategoryValidator,
  CreateServicesValidator,
  DeleteServicesCategoryValidator,
  DeleteServicesValidator,
  DeleteStepServiceValidator,
  UpDateCategoryValidator,
  UpdateStepServiceValidator,
  updateServicesValidator
} from '~/middlewares/services.middlewares'
import { accessTokenValidator, isAdminValidator } from '~/middlewares/users.middlewares'
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
  // isAdminValidator,
  CreateServicesCategoryValidator,
  wrapRequestHandler(createServicesCategory)
)

/*
Description:Get All Service Category
path: /category-all
method: GET
Query: { page: string, limit: string,  }
*/

ServicesRouters.get('/category-all', accessTokenValidator, wrapRequestHandler(getAllServicesCategory))

/*
Description: Delete Service Category
path: /category-delete/:id
method: DELETE
Params: id
*/

ServicesRouters.delete(
  '/category-delete/:id',
  accessTokenValidator,
  // isAdminValidator,
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
  // isAdminValidator,
  UpDateCategoryValidator,
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
  // isAdminValidator,
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
  // isAdminValidator,
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
id_Product?: string}
}
*/

ServicesRouters.patch(
  '/detail-update',
  accessTokenValidator,
  // isAdminValidator,
  updateServicesValidator,
  wrapRequestHandler(updateServices)
)

/*
Description:Get All Service 
path: /all
method: GET
Query: { page: string, limit: string,branch?:string[]  }
*/

ServicesRouters.get('/all', accessTokenValidator, wrapRequestHandler(getAllServices))

ServicesRouters.post('/step/create', accessTokenValidator, wrapRequestHandler(createStepService))

ServicesRouters.get('/step/all', accessTokenValidator, wrapRequestHandler(getStepService))

/*
Description: Update Step Service
path: /step/update
method: PATCH
Body: {id: string, services_category_id?: string, name?: string, type?: TypeCommision, commission?: number}
*/

ServicesRouters.patch(
  '/step/update',
  accessTokenValidator,
  // isAdminValidator,
  UpdateStepServiceValidator,
  wrapRequestHandler(updateStepService)
)

/*
Description: Delete Step Service
path: /step/delete/:id
method: DELETE
Params: id
*/

ServicesRouters.delete(
  '/step/delete/:id',
  accessTokenValidator,
  // isAdminValidator,
  DeleteStepServiceValidator,
  wrapRequestHandler(deleteStepService)
)

export default ServicesRouters
