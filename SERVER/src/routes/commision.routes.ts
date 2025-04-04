import { Router } from 'express'
import { createCommisionServicesOfCard } from '~/controllers/commision.controllers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const CommisionRouter = Router()

CommisionRouter.post('/card-services/create', accessTokenValidator, wrapRequestHandler(createCommisionServicesOfCard))

export default CommisionRouter
