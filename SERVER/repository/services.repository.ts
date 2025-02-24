import { ObjectId } from 'mongodb'
import databaseService from '../services/database.services'
import { CreateServicesCategoryData } from '../src/interface/services/services.interface'
import ServicesCategory from '../src/models/schemas/services/services.schema'
import { UpdatewServicesCategoryRequestBody } from '~/models/requestes/Services.requests'

class ServicesRepository {
  async createServicesCategory(servicesCategoryData: CreateServicesCategoryData) {
    await databaseService.services_category.insertOne(new ServicesCategory(servicesCategoryData))
  }
  async deleteServicesCategory(id: ObjectId) {
    await databaseService.services_category.deleteOne({
      _id: id
    })
  }
  async updateServicesCategory(data: UpdatewServicesCategoryRequestBody) {
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
}

const serverRepository = new ServicesRepository()
export default serverRepository
