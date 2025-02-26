import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { productMessages } from '~/constants/messages'
import {
  CreateProductRequestBody,
  CreateProductGeneralRequestBody,
  DeleteProductRequestParams,
  UpdateProductRequestBody
} from '~/models/requestes/Product.requests'
import { ResponseSuccess } from '~/utils/handlers'
import productServices from '../../services/product.services'

export const createProduct = async (req: Request<ParamsDictionary, any, CreateProductRequestBody>, res: Response) => {
  const data = req.body
  await productServices.CreateProduct(data)
  ResponseSuccess({
    message: productMessages.CREATE_PRODUCT_SUCCESS,
    res
  })
}

export const deleteProduct = async (
  req: Request<ParamsDictionary, DeleteProductRequestParams, any, CreateProductRequestBody>,
  res: Response
) => {
  const { id } = req.params
  await productServices.DeleteProduct(id)
  ResponseSuccess({
    message: productMessages.DELETE_PRODUCT_SUCCESS,
    res
  })
}

export const updateProduct = async (req: Request<ParamsDictionary, any, UpdateProductRequestBody>, res: Response) => {
  const data = req.body
  await productServices.UpdateProduct(data)
  ResponseSuccess({
    message: productMessages.UPDATE_PRODUCT_SUCCESS,
    res
  })
}
