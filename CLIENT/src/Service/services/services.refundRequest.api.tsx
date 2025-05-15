import { pathServices } from 'src/Constants/path'
import axiosInstanceMain from '../axious.api'
import {
  ApproveRefundRequestAdminResponse,
  CreateRefundRequestResponse,
  GetAllAdminRefundRequestResponse,
  GetAllRefundRequestStatsResponse,
  GetAllUserRefundRequestResponse,
  RejectRefundRequestAdminResponse
} from 'src/Types/services/services.refundRequest.type'
import {
  ApproveRefundRequestBody,
  CreateRefundRequestBodyRequest,
  RejectRefundRequestBody
} from 'src/Interfaces/services/refund-request.interfaces'

const refundRequestApi = {
  // User endpoints
  async getAllUserRequest(body?: any) {
    return axiosInstanceMain.post<GetAllUserRefundRequestResponse>(pathServices.getUserRefundRequests, body)
  },
  async createRequest(body: CreateRefundRequestBodyRequest) {
    return axiosInstanceMain.post<CreateRefundRequestResponse>(pathServices.createRefundRequest, body)
  },

  // Admin endpoints
  async getRequestStatsAdmin() {
    return axiosInstanceMain.get<GetAllRefundRequestStatsResponse>(pathServices.getRequestRefundStats)
  },
  async getAllRequestAdmin(body?: any) {
    return axiosInstanceMain.post<GetAllAdminRefundRequestResponse>(pathServices.getAdminRefundRequests, body)
  },
  async approveRequestAdmin(body: ApproveRefundRequestBody) {
    return axiosInstanceMain.put<ApproveRefundRequestAdminResponse>(pathServices.approveRefundRequest, body)
  },
  async rejectRequestAdmin(body: RejectRefundRequestBody) {
    return axiosInstanceMain.put<RejectRefundRequestAdminResponse>(pathServices.rejectRefundRequest, body)
  }
}

export default refundRequestApi
