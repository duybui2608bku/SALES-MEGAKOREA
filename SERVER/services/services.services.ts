import { CreateServicesCategoryRequestBody } from '../src/models/requestes/Services.requests'
import serverRepository from '../repository/services.repository'

class ServicesServices {
  async CreateServicesCategory(servicesCategory: CreateServicesCategoryRequestBody) {
    await serverRepository.createServicesCategory(servicesCategory)
  }
}

const servicesServices = new ServicesServices()

export default servicesServices
