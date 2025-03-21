import {
  CreateServicesCategoryRequestBody,
  CreateServicesRequestBody,
  GetAllServicesCategoryRequestQuery,
  UpdateServicesCategoryRequestBody,
  UpdateServicesRequestBody
} from '../src/models/requestes/Services.requests'
import serverRepository from '../repository/services/services.repository'
import { ObjectId } from 'mongodb'
import { servicesMessages } from '~/constants/messages'
import { ErrorWithStatusCode } from '~/models/Errors'
import { HttpStatusCode } from '~/constants/enum'
import databaseServiceSale from './database.services.sale'

class ServicesServices {
  //Private
  private async checkServicesCategoryExist(id: ObjectId) {
    const servicesCategory = await databaseServiceSale.services_category.findOne({ _id: id })
    if (!servicesCategory) {
      throw new ErrorWithStatusCode({
        message: servicesMessages.SERVICES_CATEGORY_NOT_FOUND,
        statusCode: HttpStatusCode.NotFound
      })
    }
  }

  private async checkServicesExist(id: ObjectId) {
    const services = await databaseServiceSale.services.findOne({ _id: id })
    if (!services) {
      throw new ErrorWithStatusCode({
        message: servicesMessages.SERVICES_NOT_FOUND,
        statusCode: HttpStatusCode.NotFound
      })
    }
  }

  //Services Category

  async CreateServicesCategory(servicesCategory: CreateServicesCategoryRequestBody) {
    await serverRepository.createServicesCategory(servicesCategory)
  }

  async GetAllServicesCategory(query: GetAllServicesCategoryRequestQuery) {
    return await serverRepository.getAllServicesCategory(query)
  }

  async DeleteServicesCategory(id: ObjectId) {
    await this.checkServicesCategoryExist(id)
    await serverRepository.deleteServicesCategory(id)
  }
  async UpdateServicesCategory(data: UpdateServicesCategoryRequestBody) {
    await this.checkServicesCategoryExist(new ObjectId(data._id as string))
    await serverRepository.updateServicesCategory(data)
  }

  //End Services Category

  //Services
  async CreateServies(data: CreateServicesRequestBody) {
    await serverRepository.createServices(data)
  }
  async DeleteServices(id: ObjectId) {
    await this.checkServicesExist(id)
    await serverRepository.deleteServices(id)
  }

  async UpdateServices(data: UpdateServicesRequestBody) {
    await this.checkServicesExist(new ObjectId(data.id as string))
    await serverRepository.updateServices(data)
  }
}

const servicesServices = new ServicesServices()

export default servicesServices
