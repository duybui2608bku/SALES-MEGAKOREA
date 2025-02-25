import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { productMessages } from '~/constants/messages'
import {
  CreateConsumablesRequestBody,
  DeleteConsumablesRequestParams,
  UpdateConsumablesRequestBody
} from '~/models/requestes/Product.requests'
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

export const deleteConsumables = async (
  req: Request<ParamsDictionary, DeleteConsumablesRequestParams, any, CreateConsumablesRequestBody>,
  res: Response
) => {
  const { id } = req.params
  await productServices.DeleteConsumables(id)
  ResponseSuccess({
    message: productMessages.DELETE_CONSUMABLES_SUCCESS,
    res
  })
}

export const updateConsumables = async (
  req: Request<ParamsDictionary, any, UpdateConsumablesRequestBody>,
  res: Response
) => {
  const data = req.body
  await productServices.UpdateConsumables(data)
  ResponseSuccess({
    message: productMessages.UPDATE_CONSUMABLES_SUCCESS,
    res
  })
}
