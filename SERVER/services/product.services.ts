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

  async GetAllProduct({
    page,
    limit,
    branch,
    is_consumable,
    isAdmin
  }: {
    page: number
    limit: number
    branch: string[]
    is_consumable: boolean
    isAdmin: boolean
  }) {
    const Products = await productRepository.getAllProduct({
      page,
      limit,
      branch,
      is_consumable,
      isAdmin
    })
    return Products
  }

  async searchProduct({
    q,
    branch,
    is_consumable,
    isAdmin
  }: {
    q: string
    branch: string[]
    is_consumable: boolean
    isAdmin: boolean
  }) {
    const Products = await productRepository.searchProduct({
      branch,
      q,
      is_consumable,
      isAdmin
    })
    return Products
  }

  async ImportProducts(Products: CreateProductRequestBody[]) {
    await productRepository.importProducts(Products)
  }
}

const productServices = new ProdudctServices()
export default productServices
