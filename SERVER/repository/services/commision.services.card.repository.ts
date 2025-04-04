import databaseServiceSale from 'services/database.services.sale'
import { CreateCommisionCardServicesRequestType } from '~/models/requestes/Commision.request'
import { CommisionCardServices } from '~/models/schemas/commision/commision.cardservices.schema'

class CommisionServicesOfCardRepository {
  async createCommisionServicesOfCard(data: CreateCommisionCardServicesRequestType) {
    return await databaseServiceSale.commission_services_of_card.insertOne(new CommisionCardServices(data))
  }
}

const commisiomServicesOfCardRepository = new CommisionServicesOfCardRepository()
export default commisiomServicesOfCardRepository
