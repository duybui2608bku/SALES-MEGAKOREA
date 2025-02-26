import Product from '~/models/schemas/product/Product.schema'
import databaseService from '../services/database.services'
import { ObjectId } from 'mongodb'
import { UpdateProductData } from '~/interface/product/product.interface'
import { CreateProductRequestBody } from '~/models/requestes/Product.requests'

class ProductRepository {
  async createProduct(product: CreateProductRequestBody) {
    await databaseService.Product.insertOne(new Product(product))
  }
  async deleteProduct(id: ObjectId) {
    await databaseService.Product.deleteOne({ _id: id })
  }
  async updateProduct(Product: UpdateProductData) {
    await databaseService.Product.updateOne({ _id: new ObjectId(Product.id) }, { $set: Product })
  }
}

const productRepository = new ProductRepository()
export default productRepository
