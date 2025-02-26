import { ObjectId } from 'mongodb'
import databaseService from '../services/database.services'
import {
  CreateServicesCategoryData,
  CreateServicesData,
  UpdateServicesData
} from '../src/interface/services/services.interface'
import { Services, ServicesCategory } from '../src/models/schemas/services/services.schema'
import { UpdateServicesCategoryRequestBody } from '~/models/requestes/Services.requests'
import { toObjectId } from '~/utils/utils'

class ServicesRepository {
  //Category Services
  async createServicesCategory(servicesCategoryData: CreateServicesCategoryData) {
    await databaseService.services_category.insertOne(new ServicesCategory(servicesCategoryData))
  }
  async deleteServicesCategory(id: ObjectId) {
    await databaseService.services_category.deleteOne({
      _id: id
    })
  }
  async updateServicesCategory(data: UpdateServicesCategoryRequestBody) {
    const { id, ...body } = data
    await databaseService.services_category.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...body
        }
      }
    )
  }
  //End Category Services

  //Services

  async createServices(servicesData: CreateServicesData) {
    const { service_group_id, id_employee, id_Product, ...data } = servicesData
    const servicesDataWithObjectId = {
      ...data,
      service_group_id: toObjectId(service_group_id) || '',
      id_employee: toObjectId(id_employee) || '',
      id_Product: toObjectId(id_Product) || ''
    }

    await databaseService.services.insertOne(new Services(servicesDataWithObjectId))
  }

  async deleteServices(id: ObjectId) {
    await databaseService.services.deleteOne({
      _id: id
    })
  }

  async updateServices(data: UpdateServicesData) {
    const { id, ...body } = data
    await databaseService.services.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...body
        }
      }
    )
  }
}

const serverRepository = new ServicesRepository()
export default serverRepository
