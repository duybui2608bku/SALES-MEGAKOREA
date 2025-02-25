import Consumables from '~/models/schemas/product/Consumables.schema'
import databaseService from '../services/database.services'
import { CreateConsumablesData } from '../src/interface//product/consumables.interface'
class ProductRepository {
  async createConsumables(product: CreateConsumablesData) {
    await databaseService.consumables.insertOne(new Consumables(product))
  }
}

const productRepository = new ProductRepository()
export default productRepository
