import { Router } from 'express'
import {
  createCommisionOfSeller,
  createCommisionOfTechnican,
  GetCommisionOfSellerByUserId
} from '~/controllers/commision.controllers'
import {
  CreateCommisionOfSellerValidator,
  GetCommisionOfSellerByUserIdValidator
} from '~/middlewares/commision.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const CommisionRouter = Router()

CommisionRouter.post(
  '/seller/create',
  accessTokenValidator,
  CreateCommisionOfSellerValidator,
  wrapRequestHandler(createCommisionOfSeller)
)

CommisionRouter.get(
  '/seller/get-commisions-of-seller/:user_id',
  accessTokenValidator,
  GetCommisionOfSellerByUserIdValidator,
  wrapRequestHandler(GetCommisionOfSellerByUserId)
)

CommisionRouter.post(
  '/technician/create',
  accessTokenValidator,
  CreateCommisionOfSellerValidator,
  wrapRequestHandler(createCommisionOfTechnican)
)

CommisionRouter.get(
  '/seller/get-commisions-of-technician/:user_id',
  accessTokenValidator,
  GetCommisionOfSellerByUserIdValidator,
  wrapRequestHandler(GetCommisionOfSellerByUserId)
)

export default CommisionRouter
