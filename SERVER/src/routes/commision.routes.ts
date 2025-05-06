import { Router } from 'express'
import {
  createCommisionOfSeller,
  createCommisionOfTechnican,
  GetAllCommisionOfSellerReport,
  GetAllCommisionOfTechnicanReport,
  GetCommisionOfSellerByUserId
} from '~/controllers/commision.controllers'
import {
  CreateCommisionOfSellerValidator,
  GetCommisionOfSellerByUserIdValidator,
  GetCommisionOfSellerValidator,
  GetCommisionOfTechnicanByUserIdValidator
} from '~/middlewares/commision.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { paginatonValidator } from '~/middlewares/utils.middlewares'
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
  '/technican/create',
  accessTokenValidator,
  CreateCommisionOfSellerValidator,
  wrapRequestHandler(createCommisionOfTechnican)
)

CommisionRouter.get(
  '/seller/get-commisions-of-technican/:user_id',
  accessTokenValidator,
  GetCommisionOfSellerByUserIdValidator,
  wrapRequestHandler(GetCommisionOfSellerByUserId)
)

CommisionRouter.post(
  '/technican/report',
  accessTokenValidator,
  GetCommisionOfTechnicanByUserIdValidator,
  wrapRequestHandler(GetAllCommisionOfTechnicanReport)
)

CommisionRouter.post(
  '/seller/report',
  accessTokenValidator,
  GetCommisionOfSellerValidator,
  wrapRequestHandler(GetAllCommisionOfSellerReport)
)

export default CommisionRouter
