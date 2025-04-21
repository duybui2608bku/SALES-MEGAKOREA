import { Router } from 'express'
import { createCommisionOfSeller } from '~/controllers/commision.controllers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const CommisionRouter = Router()

CommisionRouter.post('/seller', accessTokenValidator, wrapRequestHandler(createCommisionOfSeller))

export default CommisionRouter
