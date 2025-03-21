import { pathApiProduct } from 'src/Constants/path'
import {
  CreateProductRequestBody,
  GetAllProductRequestQuery,
  SearchProductRequestQuery,
  UpdateProductBody,
  UpdateProductStockRequestBody
} from 'src/Interfaces/product/product.interface'
import {
  CreateProductResponse,
  DeleteProductResponse,
  GetProductResponse,
  SearchProductResponse
} from 'src/Types/product/product.type'
import axiosInstanceMain from '../axious.api'

const productApi = {
  createProduct(product: CreateProductRequestBody) {
    return axiosInstanceMain.post<CreateProductResponse>(pathApiProduct.createProduct, product)
  },
  getProduct(query: GetAllProductRequestQuery) {
    return axiosInstanceMain.get<GetProductResponse>(pathApiProduct.getAllProduct, { params: query })
  },
  deleteProduct(id: string) {
    return axiosInstanceMain.delete<DeleteProductResponse>(`${pathApiProduct.deleteProduct}/${id}`)
  },
  updateProduct(product: UpdateProductBody) {
    return axiosInstanceMain.patch<CreateProductResponse>(`${pathApiProduct.updateProduct}`, product)
  },
  searchProduct(query: SearchProductRequestQuery) {
    return axiosInstanceMain.get<SearchProductResponse>(pathApiProduct.searchProduct, { params: query })
  },
  importProducts(product: CreateProductRequestBody[]) {
    return axiosInstanceMain.post<CreateProductResponse>(pathApiProduct.importProduct, product)
  },
  updateProductStock(product: UpdateProductStockRequestBody) {
    return axiosInstanceMain.patch<CreateProductResponse>(pathApiProduct.updateProductStock, product)
  }
}

export default productApi
