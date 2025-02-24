import { Router } from 'express'
import { createServicesCategory } from '~/controllers/services.controllers'
import { CreateServicesCategoryValidator } from '~/middlewares/services.middlewares'
import { accessTokenValidator, isAdminValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const ServicesRouters = Router()

/*
Description: Create Service Category
path: /create
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

export default ServicesRouters
