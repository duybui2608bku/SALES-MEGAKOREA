import Product from '~/models/schemas/product/Product.schema'
import databaseService from '../services/database.services'
import { ObjectId } from 'mongodb'
import { UpdateProductData } from '~/interface/product/product.interface'
import { CreateProductRequestBody, GetAllProductRequestQuery } from '~/models/requestes/Product.requests'

interface ProductQueryParams {
  page?: number
  limit?: number
  branch?: string[]
  is_consumable?: boolean
  isAdmin?: boolean
  q?: string
}

const buildProductQuery = ({ branch, is_consumable, isAdmin, q }: ProductQueryParams): Record<string, any> => {
  const query: Record<string, any> = {}
  if (branch?.length) {
    query.branch = { $in: branch }
  }
  if (typeof is_consumable === 'boolean') {
    query.is_consumable = is_consumable
  }
  if (isAdmin === false) {
    query.is_active = true
  }
  if (q) {
    query.$or = [{ name: { $regex: q, $options: 'i' } }, { code: { $regex: q, $options: 'i' } }]
  }

  return query
}

class ProductRepository {
  async createProduct(product: CreateProductRequestBody) {
    await databaseService.product.insertOne(new Product(product))
  }
  async deleteProduct(id: ObjectId) {
    await databaseService.product.deleteOne({ _id: id })
  }
  async updateProduct(product: UpdateProductData) {
    const { _id, ...productWithoutId } = product
    const branch = product.branch?.map((b) => new ObjectId(b))
    await databaseService.product.updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          ...productWithoutId,
          branch
        }
      }
    )
  }

  async getAllProduct({
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
    const skip = (page - 1) * limit
    const query = buildProductQuery({ branch, is_consumable, isAdmin })
    const [products, total] = await Promise.all([
      databaseService.product.find(query).skip(skip).limit(limit).sort({ _id: 1 }).toArray(),
      databaseService.product.countDocuments(query)
    ])

    return { products, total, limit, page }
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
    const query = buildProductQuery({ branch, is_consumable, isAdmin, q })
    const products = await databaseService.product.find(query).toArray()
    return products
  }

  async importProducts(products: CreateProductRequestBody[]) {
    const formattedProducts = products.map((product) => new Product(product))
    await databaseService.product.insertMany(formattedProducts, { ordered: false })
  }
}

const productRepository = new ProductRepository()
export default productRepository
