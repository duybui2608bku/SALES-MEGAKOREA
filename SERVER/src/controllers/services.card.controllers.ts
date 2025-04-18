import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  CreateServicesCardRequestBody,
  CreateServicesCardSoldOfCustomerRequestBody,
  CreateServicesCardSoldRequestBody,
  GetCommisionOfDateRequestBody,
  GetServicesCardRequestBody,
  GetServicesCardSoldOfCustomerRequestBody,
  UpdateCardRequestBody,
  UpdateHistoryPaidOfServicesCardRequestBody
} from '~/models/requestes/Services.card.requests'
import servicesCardServices from '../../services/services.card.services'
import { ResponseError, ResponseSuccess } from '~/utils/handlers'
import { servicesMessages } from '~/constants/messages'
// import { TokenPayload } from '~/models/requestes/User.requests'
import { HttpStatusCode, UserRole } from '~/constants/enum'

export const createServicesCard = async (
  req: Request<ParamsDictionary, any, CreateServicesCardRequestBody>,
  res: Response
) => {
  const data = req.body
  await servicesCardServices.CreateServicesCard(data)
  ResponseSuccess({
    message: servicesMessages.CREATE_SERVICES_CARD_SUCCESS,
    res
  })
}

export const createServicesCardSold = async (
  req: Request<ParamsDictionary, any, CreateServicesCardSoldRequestBody>,
  res: Response
) => {
  const data = req.body
  await servicesCardServices.CreateServicesCardSold(data)
  ResponseSuccess({
    message: servicesMessages.CREATE_SERVICES_CARD_SOLD_SUCCESS,
    res
  })
}

export const UpdateServicesCard = async (req: Request<ParamsDictionary, any, UpdateCardRequestBody>, res: Response) => {
  const data = req.body
  await servicesCardServices.UpdateServicesCard(data)
  ResponseSuccess({
    message: servicesMessages.UPDATE_SERVICES_CARD_SUCCESS,
    res
  })
}

export const UpdateHistoryPaid = async (
  req: Request<ParamsDictionary, any, UpdateHistoryPaidOfServicesCardRequestBody>,
  res: Response
) => {
  const data = req.body
  await servicesCardServices.UpdateHistoryPaid(data)
  ResponseSuccess({
    message: servicesMessages.UPDATE_HISTORY_PAID_SUCCESS,
    res
  })
}

export const getServicesCard = async (
  req: Request<ParamsDictionary, any, GetServicesCardRequestBody>,
  res: Response
) => {
  // const { role } = req.decode_authorization as TokenPayload
  const data = req.body
  const result = await servicesCardServices.GetServicesCard(data)
  result.servicesCard.length > 0
    ? ResponseSuccess({
        message: servicesMessages.GET_SERVICES_CARD_SUCCESS,
        result: result,
        res
      })
    : ResponseError({ message: servicesMessages.SERVICES_CARD_NOT_FOUND, res, statusCode: HttpStatusCode.BadRequest })
}

export const getCommissionOfDate = async (
  req: Request<ParamsDictionary, any, GetCommisionOfDateRequestBody>,
  res: Response
) => {
  const data = req.body
  const result = await servicesCardServices.GetCommissionOfDate(data)
  ResponseSuccess({
    message: servicesMessages.GET_COMMISSION_SUCCESS,
    result,
    res
  })
}

export const createServicesCardSoldOfCustomer = async (
  req: Request<ParamsDictionary, any, CreateServicesCardSoldOfCustomerRequestBody>,
  res: Response
) => {
  const data = req.body
  const result = await servicesCardServices.CreateServicesCardSoldOfCustomer(data)
  ResponseSuccess({
    message: servicesMessages.CREATE_SERVICES_CARD_SOLD_OF_CUSTOMER_SUCCESS,
    result,
    res
  })
}

export const getServicesCardSoldOfCustomer = async (
  req: Request<ParamsDictionary, any, GetServicesCardSoldOfCustomerRequestBody>,
  res: Response
) => {
  const data = req.body
  const result = await servicesCardServices.GetServicesCardSoldOfCustomer(data)
  ResponseSuccess({
    message: servicesMessages.GET_SERVICES_CARD_SOLD_OF_CUSTOMER_SUCCESS,
    result,
    res
  })
}
