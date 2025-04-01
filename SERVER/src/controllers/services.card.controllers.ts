import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  CreateServicesCardRequestBody,
  GetCommisionOfDateRequestBody,
  GetServicesCardRequestBody,
  UpdateCardRequestBody
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

export const UpdateServicesCard = async (req: Request<ParamsDictionary, any, UpdateCardRequestBody>, res: Response) => {
  const data = req.body
  await servicesCardServices.UpdateServicesCard(data)
  ResponseSuccess({
    message: servicesMessages.UPDATE_SERVICES_CARD_SUCCESS,
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
