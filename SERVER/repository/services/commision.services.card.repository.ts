import databaseServiceSale from 'services/database.services.sale'
import { CreateCommisionOfSellerData } from '~/interface/commision/commision.interface'
import { CommisionOfSeller } from '~/models/schemas/commision/commisionOfSeller.schema'

class CommisionSellerRepository {
  async createCommisionOfSeller(data: CreateCommisionOfSellerData) {
    return await databaseServiceSale.commission_seller.insertOne(new CommisionOfSeller(data))
  }
}

const commisionSellerRepository = new CommisionSellerRepository()
export default commisionSellerRepository
