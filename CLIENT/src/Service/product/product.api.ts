import { pathApiProduct } from 'src/Constants/path'
import { CreateProductRequestBody, GetAllProductRequestQuery } from 'src/Interfaces/product/product.interface'
import { CreateProductResponse, DeleteProductResponse, GetProductResponse } from 'src/Types/product/product.type'
import axiosInstanceMain from '../axious.api'

const productApi = {
  craeteProduct(product: CreateProductRequestBody) {
    return axiosInstanceMain.post<CreateProductResponse>(pathApiProduct.createProduct, product)
  },
  getProduct(query: GetAllProductRequestQuery) {
    return axiosInstanceMain.get<GetProductResponse>(pathApiProduct.getAllProduct, { params: query })
  },
  deleleProduct(id: string) {
    return axiosInstanceMain.delete<DeleteProductResponse>(`${pathApiProduct.deleteProduct}/${id}`)
  }
}

export default productApi
