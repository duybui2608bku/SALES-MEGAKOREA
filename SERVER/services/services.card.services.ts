import { ObjectId } from 'mongodb'
import databaseServiceSale from './database.services.sale'
import { ErrorWithStatusCode } from '../src/models/Errors'
import { GetServicesCardSoldOfCustomerSearchType, HttpStatusCode } from '../src/constants/enum'
import { servicesMessages } from '../src/constants/messages'
import {
  CreateServicesCardRequestBody,
  CreateServicesCardSoldOfCustomerRequestBody,
  CreateServicesCardSoldRequestBody,
  GetCommisionOfDateRequestBody,
  GetServicesCardRequestBody,
  GetServicesCardSoldOfCustomerRequestBody,
  UpdateCardRequestBody,
  UpdateHistoryPaidOfServicesCardRequestBody,
  UpdateServicesCardSoldOfCustomerRequestBody
} from '~/models/requestes/Services.card.requests'
import { getObjectOrNul, toObjectId } from '~/utils/utils'
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

  private async checkServicesCardSoldOfCustomerExist(id: ObjectId) {
    const servicesCardSoldOfCustomer = await databaseServiceSale.services_card_sold_of_customer.findOne({ _id: id })
    if (!servicesCardSoldOfCustomer) {
      throw new ErrorWithStatusCode({
        message: servicesMessages.SERVICES_CARD_SOLD_OF_CUSTOMER_NOT_FOUND,
        statusCode: HttpStatusCode.NotFound
      })
    }
  }

  private async checkHistoryPaidExist(id: ObjectId) {
    const historyPaid = await databaseServiceSale.history_paid_services_card_of_customer.findOne({ _id: id })
    if (!historyPaid) {
      throw new ErrorWithStatusCode({
        message: servicesMessages.HISTORY_PAID_NOT_FOUND,
        statusCode: HttpStatusCode.NotFound
      })
    }
  }

  //Services Card
  async CreateServicesCard(data: CreateServicesCardRequestBody) {
    const servicesCardData = (await convertServicesDataToObjectId(data)) as CreateServicesCardData
    const result = await servicesCardRepository.createServicesCard(servicesCardData)
    return result
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
    const _id = new ObjectId(data.services_card_sold_of_customer_id)
    const userId = new ObjectId(data.user_id)
    await this.checkServicesCardSoldOfCustomerExist(new ObjectId(_id))
    const historyPaid = {
      ...data,
      user_id: userId,
      services_card_sold_of_customer_id: _id
    }
    const result = await servicesCardRepository.updateHistoryPaidServicesCardOfCustomer(historyPaid)
    if (!result) {
      throw new ErrorWithStatusCode({
        message: servicesMessages.UPDATE_HISTORY_PAID_FAILED,
        statusCode: HttpStatusCode.InternalServerError
      })
    }
    return result
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
    const result = await servicesCardRepository.createServicesCardSold(servicesCardData as CreateServicesCardData[])
    return result
  }

  async CreateServicesCardSoldOfCustomer(data: CreateServicesCardSoldOfCustomerRequestBody) {
    const { customer_id, card_services_sold_id, user_id, branch, ...rest } = data
    const customerId = new ObjectId(customer_id)
    const cardServicesSoldId = card_services_sold_id.map((id) => new ObjectId(id))
    const branchId = branch?.map((branchId) => new ObjectId(branchId))
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

  async GetServicesCardSoldOfCustomer(data: GetServicesCardSoldOfCustomerRequestBody): Promise<{
    servicesCardSold: any[]
    total: number
    limit: number
    page: number
  }> {
    const { page = 1, limit = 10, branch, search, search_type, date } = data

    let customerId: ObjectId | undefined

    // Handle customer search based on search_type
    if (search && search_type) {
      const searchQuery = { $regex: search, $options: 'i' }
      const customer = await databaseServiceSale.customers.findOne(
        search_type === GetServicesCardSoldOfCustomerSearchType.NAME_CUSTOMER
          ? { name: searchQuery }
          : { phone: searchQuery }
      )
      customerId = customer?._id
    }

    // Build query object
    const query: Record<string, any> = {
      ...(customerId ? { customer_id: customerId } : {}),
      ...(date && { date: { $eq: new Date(date) } }),
      ...(branch?.length && {
        branch: { $in: branch.map((branchId: string) => new ObjectId(branchId)) }
      })
    }

    // Fetch services card sold data
    const { servicesCardSold, total } = await servicesCardRepository.getAllServicesCardSoldOfCustomer({
      page,
      limit,
      query
    })

    return {
      servicesCardSold,
      total,
      limit,
      page
    }
  }

  async UpdateServicesCardSoldOfCustomer(data: UpdateServicesCardSoldOfCustomerRequestBody) {
    const { _id, card_services_sold_id, history_paid_id, history_used, employee_commision_id } = data
    const id = new ObjectId(_id)
    await this.checkServicesCardSoldOfCustomerExist(new ObjectId(id))
    const cardServicesSoldIds =
      card_services_sold_id !== undefined ? card_services_sold_id?.map((id) => new ObjectId(id)) : []
    const historyPaidId = history_paid_id !== undefined ? new ObjectId(history_paid_id) : null
    const history_used_data = getObjectOrNul(history_used)
    const employeeCommisionId =
      employee_commision_id !== undefined ? employee_commision_id?.map((id) => new ObjectId(id)) : []

    const cardServicesSoldData = {
      card_services_sold_id: cardServicesSoldIds,
      history_paid: historyPaidId,
      history_used: history_used_data,
      employee_commision: employeeCommisionId,
      _id: id
    }

    const result = await servicesCardRepository.updateServicesCardSoldOfCustomer(cardServicesSoldData)
    return result
  }

  async DeleteHistoryPaidOfServicesCardSoldOfCustomer(id: string) {
    const historyPaidId = new ObjectId(id)
    await this.checkHistoryPaidExist(historyPaidId)
    await servicesCardRepository.deleteHistoryPaidOfServicesCardSoldOfCustomer(historyPaidId)
  }
}

const servicesCardServices = new ServicesCardServices()
export default servicesCardServices
