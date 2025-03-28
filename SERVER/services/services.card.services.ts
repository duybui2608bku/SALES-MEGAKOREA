import { ObjectId } from 'mongodb'
import databaseServiceSale from './database.services.sale'
import { ErrorWithStatusCode } from '../src/models/Errors'
import { HttpStatusCode } from '../src/constants/enum'
import { servicesMessages } from '../src/constants/messages'
import {
  CreateServicesCardRequestBody,
  GetCommisionOfDateRequestBody,
  GetServicesCardRequestBody
} from '~/models/requestes/Services.card.requests'
import { toObjectId } from '~/utils/utils'
import servicesCardRepository from 'repository/services/services.card.repository'
import { CreateServicesCardData } from '~/interface/services/services.interface'

const getServicePriceFromDB = async (services_id: string): Promise<number> => {
  const service = await databaseServiceSale.services.findOne({ _id: new ObjectId(services_id) })
  return service?.price || 0
}

const convertServicesDataToObjectId = async (servicesCardData: CreateServicesCardRequestBody) => {
  const { service_group_id, services_of_card, employee, branch, user_id, ...data } = servicesCardData
  let totalPrice = 0
  if (services_of_card && services_of_card.length > 0) {
    totalPrice = await services_of_card.reduce(async (accPromise, service) => {
      const acc = await accPromise
      const servicePrice = await getServicePriceFromDB(String(service.services_id || ''))
      const quantity = service.quantity || 0
      const discount = service.discount || 0
      return acc + (servicePrice * quantity - discount)
    }, Promise.resolve(0))
  }

  const servicesCardDataWithObjectId = {
    ...data,
    price: totalPrice,
    service_group_id: service_group_id !== undefined ? toObjectId(service_group_id) : '',
    user_id: user_id !== undefined ? toObjectId(user_id) : '',
    branch: branch?.map((branchId) => toObjectId(branchId)) || [],
    employee:
      employee?.map((employee) => ({
        ...employee,
        id_employee: toObjectId(employee.id_employee),
        price: employee.rate === undefined ? employee.price : null
      })) || [],
    services_of_card:
      services_of_card?.map((service) => ({
        ...service,
        services_id: toObjectId(service.services_id || '')
      })) || []
  }

  return servicesCardDataWithObjectId
}

class ServicesCardServices {
  private async checkServicesCardExist(id: ObjectId) {
    const servicesCategory = await databaseServiceSale.services_card.findOne({ _id: id })
    if (!servicesCategory) {
      throw new ErrorWithStatusCode({
        message: servicesMessages.SERVICES_CARD_NOT_FOUND,
        statusCode: HttpStatusCode.NotFound
      })
    }
  }

  //Services Card
  async CreateServicesCard(data: CreateServicesCardRequestBody) {
    const servicesCardData = (await convertServicesDataToObjectId(data)) as CreateServicesCardData
    await servicesCardRepository.createServicesCard(servicesCardData)
  }

  async GetServicesCard(data: GetServicesCardRequestBody) {
    const { page, limit, branch, code, is_active, search, service_group_id, name } = data
    const query = {
      ...(name && { name: { $regex: name, $options: 'i' } }),
      ...(code && { code: { $regex: code, $options: 'i' } }),
      ...(is_active !== undefined && { is_active }),
      ...(search && { name: { $regex: search, $options: 'i' } }),
      ...(branch && branch.length > 0 && { branch: { $in: branch.map((branchId) => new ObjectId(branchId)) } }),
      ...(service_group_id && { service_group_id: new ObjectId(service_group_id) })
    }
    console.log('query', query)

    const servicesCard = await servicesCardRepository.getAllServicesCard({
      query,
      page,
      limit
    })
    return servicesCard
  }

  async GetCommissionOfDate(data: GetCommisionOfDateRequestBody) {
    const { start_date, end_date, branch, user_id } = data
    const branchObjectId = branch?.map((branchId) => new ObjectId(branchId)) || []
    const userIdObjectId = user_id ? new ObjectId(user_id) : null
    const dataUpdate = {
      ...data,
      start_date: new Date(start_date),
      end_date: end_date ? new Date(end_date) : new Date(),
      branch: branchObjectId,
      user_id: userIdObjectId
    }
    return await servicesCardRepository.getCommissionOfDate(dataUpdate)
  }
}

const servicesCardServices = new ServicesCardServices()
export default servicesCardServices
