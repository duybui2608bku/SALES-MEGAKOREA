import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { productMessages } from '~/constants/messages'
import {
  CreateProductRequestBody,
  DeleteProductRequestParams,
  GetAllProductRequestQuery,
  SearchProductRequestQuery,
  UpdateProductRequestBody,
  UpdateProductStockRequestBody
} from '~/models/requestes/Product.requests'
import { ResponseSuccess } from '~/utils/handlers'
import productServices from '../../services/product.services'
import { ObjectId } from 'mongodb'
import { UserRole } from '~/constants/enum'
import { TokenPayload } from '~/models/requestes/User.requests'

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

export const getAllProduct = async (
  req: Request<ParamsDictionary, any, any, GetAllProductRequestQuery>,
  res: Response
) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const branchQuery = req.query.branch
  const { role } = req.decode_authorization as TokenPayload
  const isAdmin = role === UserRole.ADMIN
  const is_consumable = String(req.query.is_consumable) === 'true' ? true : false
  const branch = branchQuery ? decodeURIComponent(branchQuery as string).split(',') : []
  const result = await productServices.GetAllProduct({ page, limit, branch, is_consumable, isAdmin })
  result.products.length > 0
    ? ResponseSuccess({
        message: productMessages.GET_ALL_PRODUCT_SUCCESS,
        result: result,
        res
      })
    : ResponseSuccess({ message: productMessages.PRODUCT_NOT_FOUND, res })
}

export const SearchProduct = async (
  req: Request<ParamsDictionary, any, any, SearchProductRequestQuery>,
  res: Response
) => {
  const { role } = req.decode_authorization as TokenPayload
  const isAdmin = role === UserRole.ADMIN
  const is_consumable = String(req.query.is_consumable) === 'true' ? true : false
  const q = req.query.q.replace('+', ' ')
  const branchQuery = req.query.branch
  const branch = branchQuery ? decodeURIComponent(branchQuery as string).split(',') : []
  const result = await productServices.searchProduct({
    q,
    branch,
    is_consumable,
    isAdmin
  })
  result.length > 0
    ? ResponseSuccess({
        message: productMessages.GET_ALL_PRODUCT_SUCCESS,
        result: result,
        res
      })
    : ResponseSuccess({ message: productMessages.PRODUCT_NOT_FOUND, res })
}

export const importProducts = async (
  req: Request<ParamsDictionary, any, CreateProductRequestBody[]>,
  res: Response
) => {
  const products = req.body
  await productServices.ImportProducts(products)
  products.length > 0
    ? ResponseSuccess({
        message: productMessages.IMPORT_PRODUCT_SUCCESS,
        res
      })
    : ResponseSuccess({ message: productMessages.PRODUCT_NOT_VALID, res })
}

export const updateStockProduct = async (
  req: Request<ParamsDictionary, any, UpdateProductStockRequestBody>,
  res: Response
) => {
  const data = req.body
  await productServices.UpdateStockProduct(data)
  ResponseSuccess({
    message: productMessages.UPDATE_STOCK_PRODUCT_SUCCESS,
    res
  })
}
