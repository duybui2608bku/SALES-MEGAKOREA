import commisiomServicesOfCardRepository from 'repository/services/commision.services.card.repository'
import { CreateCommisionCardServicesRequestType } from '~/models/requestes/Commision.request'

class CommisionServicesOfCard {
  async createCommisionServicesOfCard(data: CreateCommisionCardServicesRequestType) {
    return await commisiomServicesOfCardRepository.createCommisionServicesOfCard(data)
  }
}

const commisionServicesOfCard = new CommisionServicesOfCard()
export default commisionServicesOfCard
