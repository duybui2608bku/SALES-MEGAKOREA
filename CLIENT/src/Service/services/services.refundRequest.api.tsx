import { pathServices } from 'src/Constants/path'
import axiosInstanceMain from '../axious.api'
import {
  CreateRefundRequestResponse,
  GetAllUserRefundRequestResponse
} from 'src/Types/services/services.refundRequest.type'
import { CreateRefundRequestBodyRequest } from 'src/Interfaces/services/refund-request.interfaces'

const refundRequestApi = {
  // User endpoints
  async getAllUserRequest(body?: any) {
    return axiosInstanceMain.get<GetAllUserRefundRequestResponse>(pathServices.getUserRefundRequests, body)
  },
  async createRequest(body: CreateRefundRequestBodyRequest) {
    return axiosInstanceMain.post<CreateRefundRequestResponse>(pathServices.createRefundRequest, body)
  }
}

export default refundRequestApi
