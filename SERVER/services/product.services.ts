import databaseService from './database.services'
import productRepository from '../repository/product.repository'
import { CreateConsumablesRequestBody, UpdateConsumablesRequestBody } from '~/models/requestes/Product.requests'
import { ErrorWithStatusCode } from '~/models/Errors'
import { productMessages } from '~/constants/messages'
import { HttpStatusCode } from '~/constants/enum'
import { ObjectId } from 'mongodb'

class ProdudctServices {
  //Private
  private async checkConsumablesExist(id: ObjectId) {
    const consumables = await databaseService.consumables.findOne({ _id: id })
    if (!consumables) {
      throw new ErrorWithStatusCode({
        message: productMessages.CONSUMABLES_NOT_FOUND,
        statusCode: HttpStatusCode.NotFound
      })
    }
  }

  //Product
  async CreateConsumables(consumables: CreateConsumablesRequestBody) {
    await productRepository.createConsumables(consumables)
  }

  async DeleteConsumables(id: string) {
    const _id = new ObjectId(id)
    await this.checkConsumablesExist(_id)
    await productRepository.deleteConsumables(_id)
  }

  async UpdateConsumables(consumables: UpdateConsumablesRequestBody) {
    await this.checkConsumablesExist(new ObjectId(consumables.id as string))
    await productRepository.updateConsumables(consumables)
  }
}

const productServices = new ProdudctServices()
export default productServices
