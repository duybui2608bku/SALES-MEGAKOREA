import databaseService from './database.services'
import productRepository from '../repository/product.repository'
import { CreateConsumablesRequestBody } from '~/models/requestes/Product.requests'

class ProdudctServices {
  //Private

  //Product
  async CreateConsumables(consumables: CreateConsumablesRequestBody) {
    await productRepository.createConsumables(consumables)
  }
}

const productServices = new ProdudctServices()
export default productServices
