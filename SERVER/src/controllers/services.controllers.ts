import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { CreateServicesCategoryRequestBody } from '~/models/requestes/Services.requests'
import servicesServices from '../../services/services.services'
import { ResponseSuccess } from '~/utils/handlers'
import { servicesMessages } from '~/constants/messages'

export const createServicesCategory = async (
  req: Request<ParamsDictionary, any, CreateServicesCategoryRequestBody>,
  res: Response
) => {
  const data = req.body
  await servicesServices.CreateServicesCategory(data)
  ResponseSuccess({
    message: servicesMessages.CREATE_SERVICES_CATEGORY_SUCCESS,
    res
  })
}
