import { GetCommisionSaleUserRequestBody } from 'src/Interfaces/commison/commisionSale.interface'
import axiosInstanceMain from '../axious.api'
import { GetCommisionSaleUserResponse } from 'src/Types/commision/commision.sale.type'
import { pathCommision } from 'src/Constants/path'

const commisionSaleApi = {
  async getAllCommisionSale(body: GetCommisionSaleUserRequestBody) {
    return axiosInstanceMain.post<GetCommisionSaleUserResponse>(pathCommision.getCommisionSale, body)
  },

  async createCommisionSeller(data: {
    user_id: string
    commision: number
    date: Date
    services_card_sold_of_customer_id: string
  }) {
    return axiosInstanceMain.post(pathCommision.createCommisionSeller, data)
  }
}

export default commisionSaleApi
