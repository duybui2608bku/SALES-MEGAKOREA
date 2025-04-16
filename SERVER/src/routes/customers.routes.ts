import { Router } from 'express'
import { createCustomerControllers } from '~/controllers/customer.controllers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const CustomersRouter = Router()

CustomersRouter.post('/create', accessTokenValidator, wrapRequestHandler(createCustomerControllers))

export default CustomersRouter
