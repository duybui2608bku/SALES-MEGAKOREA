import { Router } from 'express'
import {
  createServicesCard,
  getCommissionOfDate,
  getServicesCard,
  UpdateHistoryPaid,
  UpdateServicesCard
} from '~/controllers/services.card.controllers'
import { CreateServicesCardValidator, UpdateHistoryPaidOfCardValidator } from '~/middlewares/services.card.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const servicesOfCardRouters = Router()

servicesOfCardRouters.post(
  '/create',
  accessTokenValidator,
  CreateServicesCardValidator,
  wrapRequestHandler(createServicesCard)
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

servicesOfCardRouters.post('/commission', accessTokenValidator, wrapRequestHandler(getCommissionOfDate))

export default servicesOfCardRouters
