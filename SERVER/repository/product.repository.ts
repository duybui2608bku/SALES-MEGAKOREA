import Product from '~/models/schemas/product/Product.schema'
import databaseService from '../services/database.services'
import { ObjectId } from 'mongodb'
import { UpdateProductData } from '~/interface/product/product.interface'
import { CreateProductRequestBody } from '~/models/requestes/Product.requests'

class ProductRepository {
  async createProduct(product: CreateProductRequestBody) {
    await databaseService.product.insertOne(new Product(product))
  }
  async deleteProduct(id: ObjectId) {
    await databaseService.product.deleteOne({ _id: id })
  }
  async updateProduct(product: UpdateProductData) {
    const { _id, ...productWithoutId } = product
    await databaseService.product.updateOne({ _id: new ObjectId(_id) }, { $set: productWithoutId })
  }

  async getAllProduct({ page, limit, branch }: { page: number; limit: number; branch?: string[] }) {
    const skip = (page - 1) * limit
    const query = branch && branch.length > 0 ? { branch: { $in: branch } } : {}
    const products = await databaseService.product.find(query).skip(skip).limit(limit).toArray()
    const total = await databaseService.product.countDocuments(query)
    return { products, total, limit, page }
  }

  async searchProduct({ q, branch }: { q: string; branch?: string[] }) {
    const query = branch && branch.length > 0 ? { branch: { $in: branch } } : {}
    const products = await databaseService.product
      .find({
        ...query,
        $or: [{ name: { $regex: q, $options: 'i' } }, { code: { $regex: q, $options: 'i' } }]
      })
      .toArray()
    return products
  }
}

const productRepository = new ProductRepository()
export default productRepository
