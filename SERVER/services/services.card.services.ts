import { ObjectId } from 'mongodb'
import databaseServiceSale from './database.services.sale'
import { ErrorWithStatusCode } from '../src/models/Errors'
import { HttpStatusCode } from '../src/constants/enum'
import { servicesMessages } from '../src/constants/messages'
import {
  CreateServicesCardRequestBody,
  CreateServicesCardSoldOfCustomerRequestBody,
  CreateServicesCardSoldRequestBody,
  GetCommisionOfDateRequestBody,
  GetServicesCardRequestBody,
  UpdateCardRequestBody,
  UpdateHistoryPaidOfServicesCardRequestBody
} from '~/models/requestes/Services.card.requests'
import { toObjectId } from '~/utils/utils'
import servicesCardRepository from 'repository/services/services.card.repository'
import { CreateServicesCardData, UpdateServicesCardData } from '~/interface/services/services.interface'

const getServicePriceFromDB = async (services_id: string): Promise<number> => {
  const service = await databaseServiceSale.services.findOne({ _id: new ObjectId(services_id) })
  return service?.price || 0
}

const convertServicesDataToObjectId = async (servicesCardData: CreateServicesCardRequestBody) => {
  const { service_group_id, services_of_card, employee, branch, user_id, ...data } = servicesCardData

  const servicesCardDataWithObjectId = {
    ...data,
    service_group_id: service_group_id !== undefined ? toObjectId(service_group_id) : '',
    user_id: user_id !== undefined ? toObjectId(user_id) : '',
    branch: branch?.map((branchId) => toObjectId(branchId)) || [],
    employee:
      employee?.map((employee) => ({
        ...employee,
        commision: employee.commision || 0,
        id_employee: toObjectId(employee.id_employee)
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
    const { page = 1, limit = 10, branch, code, is_active, search, service_group_id, name } = data
    const query = {
      ...(name && { name: { $regex: name, $options: 'i' } }),
      ...(code && { code: { $regex: code, $options: 'i' } }),
      ...(is_active !== undefined && { is_active }),
      ...(search && { name: { $regex: search, $options: 'i' } }),
      ...(branch && branch.length > 0 && { branch: { $in: branch.map((branchId) => new ObjectId(branchId)) } }),
      ...(service_group_id && { service_group_id: new ObjectId(service_group_id) })
    }
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

  async UpdateServicesCard(data: UpdateCardRequestBody) {
    await this.checkServicesCardExist(new ObjectId(data._id || ''))
    const servicesCardData = (await convertServicesDataToObjectId(data)) as UpdateServicesCardData
    const _id = new ObjectId(servicesCardData._id)
    await servicesCardRepository.updateServicesCard({
      ...servicesCardData,
      _id
    })
  }

  async UpdateHistoryPaid(data: UpdateHistoryPaidOfServicesCardRequestBody) {
    await this.checkServicesCardExist(new ObjectId(data.card_services_id || ''))
    const { card_services_id, paid_initial, ...rest } = data
    const cardServicesId = new ObjectId(card_services_id)
    await servicesCardRepository.updateHistoryOfCard({
      history_paid: {
        ...rest,
        date: new Date(rest.date),
        user_id: new ObjectId(rest.user_id)
      },
      card_services_id: cardServicesId,
      paid_initial
    })
  }

  async CreateServicesCardSold(data: CreateServicesCardSoldRequestBody) {
    const ids = data.services_card_id.map((id) => new ObjectId(id))
    const servicesCardData = await Promise.all(
      ids.map(async (id) => {
        const servicesCard = await databaseServiceSale.services_card.findOne({ _id: id })
        if (!servicesCard) {
          throw new ErrorWithStatusCode({
            message: servicesMessages.SERVICES_CARD_NOT_FOUND,
            statusCode: HttpStatusCode.NotFound
          })
        }
        return servicesCard
      })
    )
    await servicesCardRepository.createServicesCardSold(servicesCardData as CreateServicesCardData[])
  }

  async CreateServicesCardSoldOfCustomer(data: CreateServicesCardSoldOfCustomerRequestBody) {
    const { customer_id, card_services_sold_id, user_id, branch, ...rest } = data
    const customerId = new ObjectId(customer_id)
    const branchId = branch.map((branchId) => new ObjectId(branchId))
    const cardServicesSoldId = card_services_sold_id.map((id) => new ObjectId(id))
    const userId = new ObjectId(user_id)
    const cardServicesSoldData = {
      ...rest,
      customer_id: customerId,
      card_services_sold_id: cardServicesSoldId,
      user_id: userId,
      branch: branchId
    }
    await servicesCardRepository.createServicesCardSoldOfCustomer(cardServicesSoldData)
  }
}

const servicesCardServices = new ServicesCardServices()
export default servicesCardServices
