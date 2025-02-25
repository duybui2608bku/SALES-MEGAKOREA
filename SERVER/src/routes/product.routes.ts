import { Router } from 'express'
import { accessTokenValidator, isAdminValidator } from '~/middlewares/users.middlewares'

const productRoutes = Router()

productRoutes.post('/', accessTokenValidator, isAdminValidator)

export default productRoutes
