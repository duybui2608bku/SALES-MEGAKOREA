import { ObjectId } from 'mongodb'
import databaseService from '../services/database.services'
import { CreateServicesCategoryData, CreateServicesData } from '../src/interface/services/services.interface'
import { Services, ServicesCategory } from '../src/models/schemas/services/services.schema'
import { UpdateServicesCategoryRequestBody, UpdateServicesRequestBody } from '~/models/requestes/Services.requests'
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
    const { service_group_id, id_employee, id_consumables, ...data } = servicesData
    const servicesDataWithObjectId = {
      ...data,
      service_group_id: toObjectId(service_group_id) || '',
      id_employee: toObjectId(id_employee) || '',
      id_consumables: toObjectId(id_consumables) || ''
    }

    await databaseService.services.insertOne(new Services(servicesDataWithObjectId))
  }

  async deleteServices(id: ObjectId) {
    await databaseService.services.deleteOne({
      _id: id
    })
  }

  async updateServices(data: UpdateServicesRequestBody) {
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
