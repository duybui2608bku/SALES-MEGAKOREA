import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  CreateServicesCategoryRequestBody,
  CreateServicesRequestBody,
  DeleteServicesCategoryRequestParams,
  UpdateServicesCategoryRequestBody,
  UpdateServicesRequestBody
} from '~/models/requestes/Services.requests'
import servicesServices from '../../services/services.services'
import { ResponseSuccess } from '~/utils/handlers'
import { servicesMessages } from '~/constants/messages'
import { ObjectId } from 'mongodb'

//Category Services

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
  req: Request<ParamsDictionary, any, UpdateServicesCategoryRequestBody>,
  res: Response
) => {
  const data = req.body
  await servicesServices.UpdateServicesCategory(data)
  ResponseSuccess({
    message: servicesMessages.UPDATE_SERVICES_CATEGORY_SUCCESS,
    res
  })
}

//End Category Services

//Services

export const createServices = async (req: Request<ParamsDictionary, any, CreateServicesRequestBody>, res: Response) => {
  const data = req.body
  await servicesServices.CreateServies(data)
  ResponseSuccess({
    message: servicesMessages.CREATE_SERVICES_SUCCESS,
    res
  })
}

export const deleteServices = async (
  req: Request<ParamsDictionary, DeleteServicesCategoryRequestParams, any, any>,
  res: Response
) => {
  const { id } = req.params
  const objectId = new ObjectId(id)
  await servicesServices.DeleteServices(objectId)
  ResponseSuccess({
    message: servicesMessages.DELETE_SERVICES_SUCCESS,
    res
  })
}

export const updateServices = async (req: Request<ParamsDictionary, any, UpdateServicesRequestBody>, res: Response) => {
  const data = req.body
  await servicesServices.UpdateServices(data)
  ResponseSuccess({
    message: servicesMessages.UPDATE_SERVICES_CATEGORY_SUCCESS,
    res
  })
}
