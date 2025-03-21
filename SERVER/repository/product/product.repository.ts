import Product from '~/models/schemas/product/Product.schema'
import { ObjectId } from 'mongodb'
import { UpdateProductData } from '~/interface/product/product.interface'
import { CreateProductRequestBody } from '~/models/requestes/Product.requests'
import databaseServiceSale from '../../services/database.services.sale'

interface ProductQueryParams {
  page?: number
  limit?: number
  branch?: string[]
  is_consumable?: boolean
  isAdmin?: boolean
  q?: string
}

const buildProductQuery = ({ branch, is_consumable, isAdmin, q }: ProductQueryParams) => {
  const query: Record<string, any> = {}
  if (branch?.length) {
    const ids = branch.map((b) => new ObjectId(b))
    query.branch = { $in: ids }
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
    await databaseServiceSale.product.insertOne(new Product(product))
  }
  async deleteProduct(id: ObjectId) {
    await databaseServiceSale.product.deleteOne({ _id: id })
  }
  async updateProduct(product: UpdateProductData) {
    const { _id, ...productWithoutId } = product
    const branch = product.branch?.map((b) => new ObjectId(b))
    await databaseServiceSale.product.updateOne(
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
      databaseServiceSale.product
        .aggregate([
          {
            $match: query
          },
          {
            $lookup: {
              from: 'branch',
              localField: 'branch',
              foreignField: '_id',
              as: 'branch'
            }
          },
          {
            $sort: { _id: -1 }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      databaseServiceSale.product.countDocuments(query)
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
    const products = await databaseServiceSale.product.find(query).toArray()
    return products
  }

  async importProducts(products: CreateProductRequestBody[]) {
    const formattedProducts = products.map((product) => new Product(product))
    await databaseServiceSale.product.insertMany(formattedProducts, { ordered: false })
  }

  async updateStockProduct({ _id, newStock }: { _id: string; newStock: number }) {
    await databaseServiceSale.product.updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          inStock: newStock
        }
      }
    )
  }
}

const productRepository = new ProductRepository()
export default productRepository
