import { pathServices } from 'src/Constants/path'
import axiosInstanceMain from '../axious.api'
import { GetAllRequestStats, GetAllUserRequestResponse } from 'src/Types/services/services.quantityRequest.type'

const quantityRequestApi = {
  // User endpoints
  async getAllUserRequest(body?: any) {
    return axiosInstanceMain.post<GetAllUserRequestResponse>(pathServices.getUserQuantityRequests, body)
  },

  // Admin endpoints
  async getRequestStats() {
    return axiosInstanceMain.get<GetAllRequestStats>(pathServices.getRequestStats)
  },
  async getAllRequest() {
    return axiosInstanceMain.post(pathServices.getAdminRequests)
  }
}

export default quantityRequestApi
