import { ObjectId } from 'mongodb'
import databaseServiceSale from './database.services.sale'
import { ErrorWithStatusCode } from '~/models/Errors'
import { commisionMessages, servicesMessages, userMessages } from '~/constants/messages'
import { HttpStatusCode } from '~/constants/enum'
import { CreateCommisionOfTechnicanRequestType } from '~/models/requestes/Commision.request'
import commisionSellerRepository from 'repository/services/commision.services.card.repository'
import { GetCommisionOfSellerRequests } from '~/interface/commision/commision.interface'

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
    return await commisionSellerRepository.createCommisionOfSeller(commision)
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
    const commisions = await commisionSellerRepository.getCommisionOfSellerByUserId({
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
}

const commisionServicesOfTechnican = new CommisionServicesOfTechnican()
export default commisionServicesOfTechnican
