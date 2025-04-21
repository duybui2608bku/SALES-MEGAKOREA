import { ObjectId } from 'mongodb'
import databaseServiceSale from './database.services.sale'
import { ErrorWithStatusCode } from '~/models/Errors'
import { servicesMessages, userMessages } from '~/constants/messages'
import { HttpStatusCode } from '~/constants/enum'
import { CreateCommisionOfSellerRequestType } from '~/models/requestes/Commision.request'
import commisionSellerRepository from 'repository/services/commision.services.card.repository'

class CommisionServicesOfSeller {
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

  async createCommisionOfSeller(data: CreateCommisionOfSellerRequestType) {
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
}

const commisionServicesOfSeller = new CommisionServicesOfSeller()
export default commisionServicesOfSeller
