import { ProductGeneralInterface } from 'src/Interfaces/product/product.interface'
import { SuccessResponse } from '../util.type'

export type CreateProductResponse = SuccessResponse<void>

export type GetProductResponse = SuccessResponse<{
  products: ProductGeneralInterface[]
  limit: number
  page: number
  total: number
}>

export type SearchProductResponse = SuccessResponse<ProductGeneralInterface[]>

export type DeleteProductResponse = SuccessResponse<void>
