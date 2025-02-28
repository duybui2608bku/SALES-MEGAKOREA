import databaseService from './database.services'
import productRepository from '../repository/product.repository'
import { CreateProductRequestBody, UpdateProductRequestBody } from '~/models/requestes/Product.requests'
import { ErrorWithStatusCode } from '~/models/Errors'
import { productMessages } from '~/constants/messages'
import { HttpStatusCode } from '~/constants/enum'
import { ObjectId } from 'mongodb'

class ProdudctServices {
  //Private
  private async checkProductExist(id: ObjectId) {
    const Product = await databaseService.product.findOne({ _id: id })
    if (!Product) {
      throw new ErrorWithStatusCode({
        message: productMessages.PRODUCT_NOT_FOUND,
        statusCode: HttpStatusCode.NotFound
      })
    }
  }

  //Product
  async CreateProduct(Product: CreateProductRequestBody) {
    await productRepository.createProduct(Product)
  }

  async DeleteProduct(id: string) {
    const _id = new ObjectId(id)
    await this.checkProductExist(_id)
    await productRepository.deleteProduct(_id)
  }

  async UpdateProduct(Product: UpdateProductRequestBody) {
    await this.checkProductExist(new ObjectId(Product._id as string))
    await productRepository.updateProduct(Product)
  }

  async GetAllProduct({ page, limit, branch }: { page: number; limit: number; branch?: string[] }) {
    const Products = await productRepository.getAllProduct({
      page,
      limit,
      branch
    })
    return Products
  }

  async searchProduct({ q, branch }: { q: string; branch?: string[] }) {
    const Products = await productRepository.searchProduct({
      branch,
      q
    })
    return Products
  }
}

const productServices = new ProdudctServices()
export default productServices
