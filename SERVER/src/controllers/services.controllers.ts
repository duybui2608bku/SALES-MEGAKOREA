import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  CreateServicesCategoryRequestBody,
  DeleteServicesCategoryRequestParams,
  UpdatewServicesCategoryRequestBody
} from '~/models/requestes/Services.requests'
import servicesServices from '../../services/services.services'
import { ResponseSuccess } from '~/utils/handlers'
import { servicesMessages } from '~/constants/messages'
import { ObjectId } from 'mongodb'

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

export const deleteServicesCategory = async (
  req: Request<ParamsDictionary, DeleteServicesCategoryRequestParams, any, CreateServicesCategoryRequestBody>,
  res: Response
) => {
  const { id } = req.params
  const objectId = new ObjectId(id)
  await servicesServices.DeleteServicesCategory(objectId)
  ResponseSuccess({
    message: servicesMessages.CREATE_SERVICES_CATEGORY_SUCCESS,
    res
  })
}

export const updateServicesCategory = async (
  req: Request<ParamsDictionary, any, UpdatewServicesCategoryRequestBody>,
  res: Response
) => {
  const data = req.body
  await servicesServices.UpdateServicesCategory(data)
  ResponseSuccess({
    message: servicesMessages.UPDATE_SERVICES_CATEGORY_SUCCESS,
    res
  })
}
