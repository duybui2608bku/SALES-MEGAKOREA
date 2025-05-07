import { GetCommisionSaleUserRequestBody } from 'src/Interfaces/commison/commisionSale.interface'
import axiosInstanceMain from '../axious.api'
import { GetCommisionSaleUserResponse } from 'src/Types/commision/commision.sale.type'
import { pathCommision } from 'src/Constants/path'

const commisionSaleApi = {
  async getAllCommisionSale(body: GetCommisionSaleUserRequestBody) {
    return axiosInstanceMain.post<GetCommisionSaleUserResponse>(pathCommision.getCommisionSale, body)
  }
}

export default commisionSaleApi
