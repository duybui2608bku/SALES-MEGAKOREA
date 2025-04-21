import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { commisionMessages } from '~/constants/messages'
import { ResponseSuccess } from '~/utils/handlers'
import { CreateCommisionOfSellerRequestType } from '~/models/requestes/Commision.request'
import commisionServicesOfSale from 'services/commision.services'

export const createCommisionOfSeller = async (
  req: Request<ParamsDictionary, any, CreateCommisionOfSellerRequestType>,
  res: Response
) => {
  const data = req.body
  const result = await commisionServicesOfSale.createCommisionOfSeller(data)
  return ResponseSuccess({
    res,
    message: commisionMessages.CREATE_COMMISION_OF_SELLER_SUCCESS,
    result
  })
}
