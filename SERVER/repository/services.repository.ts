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
  private convertBranchToObjectId(branch?: string[]) {
    return branch?.map((b) => new ObjectId(b)) || []
  }

  async createServicesCategory(servicesCategoryData: CreateServicesCategoryData) {
    const branch_id = this.convertBranchToObjectId(servicesCategoryData.branch)
    await databaseService.services_category.insertOne(
      new ServicesCategory({
        ...servicesCategoryData,
        branch: branch_id
      })
    )
  }
  async deleteServicesCategory(id: ObjectId) {
    await databaseService.services_category.deleteOne({
      _id: id
    })
  }
  async updateServicesCategory(data: UpdateServicesCategoryRequestBody) {
    const { id, branch, ...body } = data
    const branchObjectId = this.convertBranchToObjectId(branch)
    await databaseService.services_category.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...body,
          branch: branchObjectId
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
