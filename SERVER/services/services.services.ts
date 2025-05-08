import {
  CreateServicesCategoryRequestBody,
  CreateServicesRequestBody,
  CreateServicesStepRequestBody,
  GetAllServicesCategoryRequestQuery,
  GetAllServicesRequestData,
  GetServicesStepRequestQuery,
  UpdateServicesCategoryRequestBody,
  UpdateServicesRequestBody,
  UpdateStepServiceRequestBody
} from '../src/models/requestes/Services.requests'
import serverRepository from '../repository/services/services.repository'
import { ObjectId } from 'mongodb'
import { servicesMessages } from '~/constants/messages'
import { ErrorWithStatusCode } from '~/models/Errors'
import { HttpStatusCode, TypeCommision } from '~/constants/enum'
import databaseServiceSale from './database.services.sale'
import { toObjectId } from '~/utils/utils'

const convertServicesDataToObjectId = (servicesData: CreateServicesRequestBody) => {
  //ghi chú
  // servicesData là dữ liệu đầu vào từ client
  // servicesDataWithObjectId là dữ liệu đã chuyển đổi sang ObjectId
  // sử dụng toObjectId để chuyển đổi các trường có kiểu dữ liệu là ObjectId
  // nếu trường không tồn tại thì gán giá trị rỗng
  // nếu trường tồn tại thì chuyển đổi những trường có kiểu dữ liệu là ObjectId từ string sang ObjectId
  // nếu trường là mảng thì sử dụng map để chuyển đổi từng phần tử trong mảng
  // nếu trường là mảng thì gán giá trị rỗng
  const { service_group_id, step_services, products, branch, user_id, ...data } = servicesData
  const servicesDataWithObjectId = {
    ...data,
    service_group_id: service_group_id !== undefined ? toObjectId(service_group_id) : undefined,
    step_services: step_services !== undefined ? step_services.map((step) => new ObjectId(step)) : undefined,
    // products:
    //   products?.map((product) => ({
    //     ...product,
    //     product_id: toObjectId(product.product_id)
    //   })) || undefined,
    user_id: user_id !== undefined ? toObjectId(user_id) : undefined,
    branch: branch !== undefined ? branch.map((branchId) => toObjectId(branchId)) || undefined : undefined
  }
  return servicesDataWithObjectId
}

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
  async CreateServies(servicesData: CreateServicesRequestBody) {
    const servicesDataWithObjectId = convertServicesDataToObjectId(servicesData)
    await serverRepository.createServices(servicesDataWithObjectId)
  }

  async DeleteServices(id: ObjectId) {
    await this.checkServicesExist(id)
    await serverRepository.deleteServices(id)
  }

  async UpdateServices(data: UpdateServicesRequestBody) {
    await this.checkServicesExist(new ObjectId(data._id as string))
    const servicesDataWithObjectId = convertServicesDataToObjectId(data)
    const { _id, ...body } = servicesDataWithObjectId
    await serverRepository.updateServices({
      _id: new ObjectId(_id as string),
      ...body
    })
  }

  async GetAllServices(query: GetAllServicesRequestData) {
    const { branch, ...pagination } = query
    const branchObjectId = branch?.map((branchId) => toObjectId(branchId)) || []
    const queryData = {
      ...pagination,
      branch: branchObjectId
    }
    return await serverRepository.getAllServices(queryData)
  }

  async CreateServicesStep(stepServices: CreateServicesStepRequestBody) {
    const { services_category_id } = stepServices
    const servicesCategoryId = services_category_id ? new ObjectId(services_category_id) : null
    if (servicesCategoryId) {
      await this.checkServicesCategoryExist(new ObjectId(servicesCategoryId))
    }
    const stepServicesWithObjectId = {
      ...stepServices,
      services_category_id: servicesCategoryId
    }
    await serverRepository.createStepServices(stepServicesWithObjectId)
  }

  async getStepServices(data: GetServicesStepRequestQuery) {
    const { services_category_id, search } = data
    const servicesCategoryId = services_category_id ? new ObjectId(services_category_id) : null
    const query: any = {}
    if (servicesCategoryId) {
      query.services_category_id = servicesCategoryId
    }
    if (search) {
      query.$or = [{ name: { $regex: search, $options: 'i' } }]
    }
    const page = Number(data.page) || 1
    const limit = Number(data.limit) || 10
    const result = await serverRepository.getStepServices({
      page,
      limit,
      query
    })
    return result
  }

  async updateStepService(data: UpdateStepServiceRequestBody) {
    const { id, services_category_id, ...restData } = data
    const serviceId = new ObjectId(id)
    await this.checkStepServiceExist(serviceId)

    const servicesCategoryId = services_category_id ? new ObjectId(services_category_id) : null
    if (servicesCategoryId) {
      await this.checkServicesCategoryExist(servicesCategoryId)
    }

    const updateData: any = { ...restData }
    if (services_category_id !== undefined) {
      updateData.services_category_id = servicesCategoryId
    }

    return await serverRepository.updateStepService(serviceId, updateData)
  }

  async deleteStepService(id: string) {
    const stepServiceId = new ObjectId(id)
    await this.checkStepServiceExist(stepServiceId)
    await serverRepository.deleteStepService(stepServiceId)
  }

  private async checkStepServiceExist(id: ObjectId) {
    const stepService = await databaseServiceSale.step_services.findOne({ _id: id })
    if (!stepService) {
      throw new ErrorWithStatusCode({
        message: servicesMessages.SERVICES_NOT_FOUND,
        statusCode: HttpStatusCode.NotFound
      })
    }
    return stepService
  }
}

const servicesServices = new ServicesServices()

export default servicesServices
