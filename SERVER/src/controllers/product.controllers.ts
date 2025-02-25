import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { productMessages } from '~/constants/messages'
import { CreateConsumablesRequestBody } from '~/models/requestes/Product.requests'
import { ResponseSuccess } from '~/utils/handlers'
import productServices from '../../services/product.services'
export const createConsumables = async (
  req: Request<ParamsDictionary, any, CreateConsumablesRequestBody>,
  res: Response
) => {
  const data = req.body
  await productServices.CreateConsumables(data)
  ResponseSuccess({
    message: productMessages.CREATE_CONSUMABLES_SUCCESS,
    res
  })
}
