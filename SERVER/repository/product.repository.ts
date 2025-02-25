import Consumables from '~/models/schemas/product/Consumables.schema'
import databaseService from '../services/database.services'
import { CreateConsumablesData, UpdateConsumablesData } from '../src/interface//product/consumables.interface'
import { ObjectId } from 'mongodb'

class ProductRepository {
  async createConsumables(product: CreateConsumablesData) {
    await databaseService.consumables.insertOne(new Consumables(product))
  }
  async deleteConsumables(id: ObjectId) {
    await databaseService.consumables.deleteOne({ _id: id })
  }
  async updateConsumables(consumables: UpdateConsumablesData) {
    await databaseService.consumables.updateOne({ _id: new ObjectId(consumables.id) }, { $set: consumables })
  }
}

const productRepository = new ProductRepository()
export default productRepository
