import databaseService from '../services/database.services'
import { CreateServicesCategoryData } from '../src/interface/services/services.interface'
import ServicesCategory from '../src/models/schemas/services/services.schema'

class ServicesRepository {
  async createServicesCategory(servicesCategoryData: CreateServicesCategoryData) {
    await databaseService.services_category.insertOne(new ServicesCategory(servicesCategoryData))
  }
}

const serverRepository = new ServicesRepository()
export default serverRepository
