import { Router } from 'express'
import {
  createServicesCard,
  createServicesCardSold,
  createServicesCardSoldOfCustomer,
  DeleteHistoryPaid,
  getServicesCard,
  getServicesCardSoldOfCustomer,
  UpdateHistoryPaid,
  UpdateServicesCard,
  updateServicesCardSoldOfCustomer
} from '~/controllers/services.card.controllers'
import {
  CreateServicesCardSoldOfCustomerValidator,
  CreateServicesCardSoldValidator,
  CreateServicesCardValidator,
  DeleteHistoryPaidOfServicesCardValidator,
  GetServicesCardSoldOfCustomerValidator,
  UpdateHistoryPaidOfCardValidator,
  UpdateHistoryPaidOfServicesCardValidator,
  UpdateServicesCardSoldOfCustomerValidator
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

servicesOfCardRouters.delete(
  '/history-paid/:id',
  accessTokenValidator,
  DeleteHistoryPaidOfServicesCardValidator,
  wrapRequestHandler(DeleteHistoryPaid)
)

servicesOfCardRouters.post('/all', accessTokenValidator, wrapRequestHandler(getServicesCard))

servicesOfCardRouters.post(
  '/sold-of-customer/create',
  accessTokenValidator,
  CreateServicesCardSoldOfCustomerValidator,
  wrapRequestHandler(createServicesCardSoldOfCustomer)
)

servicesOfCardRouters.post(
  '/sold-of-customer',
  accessTokenValidator,
  GetServicesCardSoldOfCustomerValidator,
  wrapRequestHandler(getServicesCardSoldOfCustomer)
)

servicesOfCardRouters.post(
  '/sold-of-customer/paid-history',
  accessTokenValidator,
  UpdateHistoryPaidOfServicesCardValidator,
  wrapRequestHandler(UpdateHistoryPaid)
)

servicesOfCardRouters.patch(
  '/sold-of-customer/update',
  accessTokenValidator,
  UpdateServicesCardSoldOfCustomerValidator,
  wrapRequestHandler(updateServicesCardSoldOfCustomer)
)

export default servicesOfCardRouters
