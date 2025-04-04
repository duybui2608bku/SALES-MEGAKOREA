import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { commisionMessages } from '~/constants/messages'
import { ResponseSuccess } from '~/utils/handlers'
import { CreateCommisionCardServicesRequestType } from '~/models/requestes/Commision.request'
import commisiomServicesOfCardRepository from 'repository/services/commision.services.card.repository'

export const createCommisionServicesOfCard = async (
  req: Request<ParamsDictionary, any, CreateCommisionCardServicesRequestType>,
  res: Response
) => {
  const data = req.body
  await commisiomServicesOfCardRepository.createCommisionServicesOfCard(data)
  return ResponseSuccess({
    res,
    message: commisionMessages.CREATE_COMMISION_SERVICES_OF_CARD_SUCCESS
  })
}
