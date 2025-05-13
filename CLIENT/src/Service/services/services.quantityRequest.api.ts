import { pathServices } from 'src/Constants/path'
import axiosInstanceMain from '../axious.api'
import {
  ApproveRequestAdminResponse,
  GetAllRequestAdminResponse,
  GetAllRequestStatsResponse,
  GetAllUserRequestResponse,
  RejectRequestAdminResponse
} from 'src/Types/services/services.quantityRequest.type'
import { IUpdateQuantityRequestStatusPayload } from 'src/Interfaces/services/quantity-request.interfaces'

const quantityRequestApi = {
  // User endpoints
  async getAllUserRequest(body?: any) {
    return axiosInstanceMain.post<GetAllUserRequestResponse>(pathServices.getUserQuantityRequests, body)
  },

  // Admin endpoints
  async getRequestStatsAdmin() {
    return axiosInstanceMain.get<GetAllRequestStatsResponse>(pathServices.getRequestStats)
  },
  async getAllRequestAdmin(query?: any) {
    return axiosInstanceMain.post<GetAllRequestAdminResponse>(pathServices.getAdminRequests, query)
  },
  async approveRequestAdmin(payload: IUpdateQuantityRequestStatusPayload) {
    return axiosInstanceMain.put<ApproveRequestAdminResponse>(pathServices.approveRequest, payload)
  },
  async rejectRequestAdmin(requestId: string, payload: IUpdateQuantityRequestStatusPayload) {
    return axiosInstanceMain.put<RejectRequestAdminResponse>(`${pathServices.rejectRequest}/${requestId}`, payload)
  }
}

export default quantityRequestApi
