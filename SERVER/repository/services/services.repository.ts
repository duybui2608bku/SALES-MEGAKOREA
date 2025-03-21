import { ObjectId } from 'mongodb'
import {
  CreateServicesCategoryData,
  CreateServicesData,
  UpdateServicesData
} from '../../src/interface/services/services.interface'
import { Services, ServicesCategory } from '../../src/models/schemas/services/services.schema'
import {
  GetAllServicesCategoryRequestQuery,
  UpdateServicesCategoryRequestBody
} from '~/models/requestes/Services.requests'
import { toObjectId } from '~/utils/utils'
import databaseServiceSale from 'services/database.services.sale'

class ServicesRepository {
  //Category Services
  private convertBranchToObjectId(branch?: string[]) {
    return branch?.map((b) => new ObjectId(b)) || []
  }

  async createServicesCategory(servicesCategoryData: CreateServicesCategoryData) {
    const branch_id = this.convertBranchToObjectId(servicesCategoryData.branch)
    await databaseServiceSale.services_category.insertOne(
      new ServicesCategory({
        ...servicesCategoryData,
        branch: branch_id
      })
    )
  }

  async getAllServicesCategory(data: GetAllServicesCategoryRequestQuery) {
    const { page, limit } = data
    const skip = (page - 1) * limit
    const [categoryServices, total] = await Promise.all([
      databaseServiceSale.services_category.find().sort({ _id: -1 }).skip(skip).limit(limit).toArray(),
      databaseServiceSale.services_category.countDocuments()
    ])
    return { categoryServices, limit, page, total }
  }

  async deleteServicesCategory(id: ObjectId) {
    await databaseServiceSale.services_category.deleteOne({
      _id: id
    })
  }
  async updateServicesCategory(data: UpdateServicesCategoryRequestBody) {
    const { _id, branch, ...body } = data
    const branchObjectId = this.convertBranchToObjectId(branch)
    await databaseServiceSale.services_category.updateOne(
      { _id: new ObjectId(_id) },
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

    await databaseServiceSale.services.insertOne(new Services(servicesDataWithObjectId))
  }

  async deleteServices(id: ObjectId) {
    await databaseServiceSale.services.deleteOne({
      _id: id
    })
  }

  async updateServices(data: UpdateServicesData) {
    const { id, branch, ...body } = data
    const branchObjectId = this.convertBranchToObjectId(branch)
    await databaseServiceSale.services.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...body,
          branch: branchObjectId
        }
      }
    )
  }
}

const serverRepository = new ServicesRepository()
export default serverRepository
