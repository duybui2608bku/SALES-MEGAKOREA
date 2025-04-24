import e, { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { commisionMessages } from '~/constants/messages'
import { ResponseError, ResponseSuccess } from '~/utils/handlers'
import {
  CreateCommisionOfSellerRequestType,
  CreateCommisionOfTechnicanRequestType,
  GetCommisionOfSellerByUserIdParams,
  GetCommisionOfSellerByUserIdQueryType,
  GetCommisionOfTechnicanByUserIdParams,
  GetCommisionOfTechnicanByUserIdQueryType
} from '~/models/requestes/Commision.request'
import commisionServicesOfSale from 'services/commision.services'
import { HttpStatusCode } from '~/constants/enum'
import commisionServicesOfTechnican from 'services/commisionoftechnican'

// SELLER COMMISION
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

export const GetCommisionOfSellerByUserId = async (
  req: Request<ParamsDictionary, GetCommisionOfSellerByUserIdParams, any, GetCommisionOfSellerByUserIdQueryType>,
  res: Response
) => {
  const { user_id } = req.params
  const { start_date, end_date } = req.query
  const data = {
    user_id,
    start_date: start_date,
    end_date: end_date
  }
  const result = await commisionServicesOfSale.getCommisionOfSellerByUserId(data)
  if (result.length === 0) {
    return ResponseError({
      res,
      message: commisionMessages.COMMISION_OF_SELLER_EMPTY,
      statusCode: HttpStatusCode.NotFound
    })
  } else {
    return ResponseSuccess({
      res,
      message: commisionMessages.GET_COMMISION_OF_SELLER_SUCCESS,
      result
    })
  }
}

// TECHNICIAN COMMISION

export const createCommisionOfTechnican = async (
  req: Request<ParamsDictionary, any, CreateCommisionOfTechnicanRequestType>,
  res: Response
) => {
  const data = req.body
  const result = await commisionServicesOfTechnican.createCommisionOfTechnican(data)
  return ResponseSuccess({
    res,
    message: commisionMessages.CREATE_COMMISION_OF_TECHNICAN_SUCCESS,
    result
  })
}

export const GetCommisionOfTechnicanByUserId = async (
  req: Request<ParamsDictionary, GetCommisionOfSellerByUserIdParams, any, GetCommisionOfTechnicanByUserIdQueryType>,
  res: Response
) => {
  const { user_id } = req.params
  const { start_date, end_date } = req.query
  const data = {
    user_id,
    start_date: start_date,
    end_date: end_date
  }
  const result = await commisionServicesOfSale.getCommisionOfSellerByUserId(data)
  if (result.length === 0) {
    return ResponseError({
      res,
      message: commisionMessages.COMMISION_OF_SELLER_EMPTY,
      statusCode: HttpStatusCode.NotFound
    })
  } else {
    return ResponseSuccess({
      res,
      message: commisionMessages.GET_COMMISION_OF_SELLER_SUCCESS,
      result
    })
  }
}
