import { Router } from 'express'
import {
  createServicesCard,
  createServicesCardSold,
  createServicesCardSoldOfCustomer,
  getServicesCard,
  UpdateHistoryPaid,
  UpdateServicesCard
} from '~/controllers/services.card.controllers'
import {
  CreateServicesCardSoldValidator,
  CreateServicesCardValidator,
  UpdateHistoryPaidOfCardValidator
} from '~/middlewares/services.card.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const servicesOfCardRouters = Router()

servicesOfCardRouters.post(
  '/create',
  accessTokenValidator,
  CreateServicesCardValidator,
  wrapRequestHandler(createServicesCard)
)

servicesOfCardRouters.post(
  '/sold/create',
  accessTokenValidator,
  CreateServicesCardSoldValidator,
  wrapRequestHandler(createServicesCardSold)
)

servicesOfCardRouters.patch(
  '/update',
  accessTokenValidator,
  CreateServicesCardValidator,
  wrapRequestHandler(UpdateServicesCard)
)

servicesOfCardRouters.patch(
  '/update-paid',
  accessTokenValidator,
  UpdateHistoryPaidOfCardValidator,
  wrapRequestHandler(UpdateHistoryPaid)
)

servicesOfCardRouters.post('/all', accessTokenValidator, wrapRequestHandler(getServicesCard))

servicesOfCardRouters.post(
  '/sold-of-customer/create',
  accessTokenValidator,
  wrapRequestHandler(createServicesCardSoldOfCustomer)
)

export default servicesOfCardRouters
