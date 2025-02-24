import {
  CreateServicesCategoryRequestBody,
  DeleteServicesCategoryRequestParams,
  UpdatewServicesCategoryRequestBody
} from '../src/models/requestes/Services.requests'
import serverRepository from '../repository/services.repository'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import { servicesMessages } from '~/constants/messages'
import { ErrorWithStatusCode } from '~/models/Errors'
import { HttpStatusCode } from '~/constants/enum'

class ServicesServices {
  async CreateServicesCategory(servicesCategory: CreateServicesCategoryRequestBody) {
    await serverRepository.createServicesCategory(servicesCategory)
  }
  async DeleteServicesCategory(id: ObjectId) {
    const servicesCategory = await databaseService.services_category.findOne({ _id: id })
    if (!servicesCategory) {
      throw new ErrorWithStatusCode({
        message: servicesMessages.SERVICES_CATEGORY_NOT_FOUND,
        statusCode: HttpStatusCode.NotFound
      })
    }
    await serverRepository.deleteServicesCategory(id)
  }
  async UpdateServicesCategory(data: UpdatewServicesCategoryRequestBody) {
    const servicesCategory = await databaseService.services_category.findOne({ _id: new ObjectId(data.id) })
    if (!servicesCategory) {
      throw new ErrorWithStatusCode({
        message: servicesMessages.SERVICES_CATEGORY_NOT_FOUND,
        statusCode: HttpStatusCode.NotFound
      })
    }
    await serverRepository.updateServicesCategory(data)
  }
}

const servicesServices = new ServicesServices()

export default servicesServices
