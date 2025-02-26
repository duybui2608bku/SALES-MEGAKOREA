import { pathApiProduct } from 'src/Constants/path'
import { CreateProductRequestBody } from 'src/Interfaces/product/product.interface'
import { CreateProductResponse } from 'src/Types/product/product.type'
import axiosInstanceMain from '../axious.api'

const productApi = {
  craeteProduct(product: CreateProductRequestBody) {
    return axiosInstanceMain.post<CreateProductResponse>(pathApiProduct.createProduct, product)
  }
}

export default productApi
