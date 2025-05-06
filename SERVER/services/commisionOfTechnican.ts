import { ObjectId } from 'mongodb'
import databaseServiceSale from './database.services.sale'
import { ErrorWithStatusCode } from '~/models/Errors'
import { commisionMessages, servicesMessages, userMessages } from '~/constants/messages'
import { HttpStatusCode } from '~/constants/enum'
import {
  CreateCommisionOfTechnicanRequestType,
  GetCommisionOfTechnicanReportRequestType
} from '~/models/requestes/Commision.request'
import { GetCommisionOfSellerRequests } from '~/interface/commision/commision.interface'
import commisionTechnicanRepository from 'repository/services/commision.technican.services.card.repository'
import { createDateRangeQuery, toObjectId } from '~/utils/utils'

class CommisionServicesOfTechnican {
  private async checkUserExist(id: ObjectId) {
    const User = await databaseServiceSale.users.findOne({ _id: id })
    if (!User) {
      throw new ErrorWithStatusCode({
        message: userMessages.USER_EXISTS,
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

  async createCommisionOfTechnican(data: CreateCommisionOfTechnicanRequestType) {
    const { user_id, services_card_sold_of_customer_id } = data
    const userId = new ObjectId(user_id)
    const servicesCardSoldOfCustomerId = new ObjectId(services_card_sold_of_customer_id)
    await Promise.all([
      this.checkUserExist(userId),
      this.checkServicesCardSoldOfCustomerExist(servicesCardSoldOfCustomerId)
    ])
    const commision = {
      ...data,
      user_id: userId,
      services_card_sold_of_customer_id: servicesCardSoldOfCustomerId
    }
    return await commisionTechnicanRepository.CreateCommisionOfTechnican(commision)
  }

  async getCommisionOfSellerByUserId(data: GetCommisionOfSellerRequests) {
    const { user_id, end_date, start_date } = data
    const query: any = {}
    if (start_date) {
      query.created_at = { $gte: new Date(start_date) || new Date() }
    }
    if (end_date) {
      query.created_at = { ...query.date, $lte: new Date(end_date) }
    }
    const userId = new ObjectId(user_id)
    await this.checkUserExist(userId)
    const commisions = await commisionTechnicanRepository.getCommisionOfTechnicanByUserId({
      user_id: userId,
      query: query
    })

    if (!commisions) {
      throw new ErrorWithStatusCode({
        message: commisionMessages.COMMISION_OF_SELLER_NOT_FOUND,
        statusCode: HttpStatusCode.NotFound
      })
    }
    return commisions
  }

  async getAllCommisionOfTechnicanReport(data: GetCommisionOfTechnicanReportRequestType) {
    const { user_id, branch_id, date, search, page = 1, limit = 10 } = data

    const dataQuery = {
      ...(user_id ? { user_id: new ObjectId(user_id) } : null),
      ...(branch_id ? { branch_id: new ObjectId(branch_id) } : null),
      ...createDateRangeQuery(date)
    }

    const commisions = await commisionTechnicanRepository.getAllCommisionOfTechnicanReport({
      query: dataQuery,
      page: Number(page),
      limit: Number(limit)
    })
    if (!commisions) {
      throw new ErrorWithStatusCode({
        message: commisionMessages.COMMISION_OF_SELLER_REPORT_NOT_FOUND,
        statusCode: HttpStatusCode.NotFound
      })
    }
    return commisions
  }

  async getAllCommisionOfSellerReport(data: GetCommisionOfTechnicanReportRequestType) {
    const { user_id, branch_id, date, page = 1, limit = 10 } = data

    const dataQuery = {
      ...(user_id ? { user_id: new ObjectId(user_id as string) } : null),
      ...(branch_id ? { branch_id: new ObjectId(branch_id as string) } : null),
      ...createDateRangeQuery(date)
    }

    const commisions = await commisionTechnicanRepository.getAllCommisionOfSellerReport({
      query: dataQuery,
      page: Number(page),
      limit: Number(limit)
    })

    if (!commisions) {
      throw new ErrorWithStatusCode({
        message: commisionMessages.COMMISION_OF_SELLER_REPORT_NOT_FOUND,
        statusCode: HttpStatusCode.NotFound
      })
    }
    return commisions
  }
}

const commisionServicesOfTechnican = new CommisionServicesOfTechnican()
export default commisionServicesOfTechnican
