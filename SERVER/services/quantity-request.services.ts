import quantityRequestRepository from 'repository/services/quantity-request.repository'
import { IQuantityRequestData, QuantityRequestStatus } from '~/models/schemas/services/quantity-request.schema'
import databaseServiceSale from 'services/database.services.sale'
import { ErrorWithStatusCode } from '~/models/Errors'
import { HttpStatusCode } from '~/constants/enum'
import { CreateQuantityRequest } from '~/interface/services/quantity-request.interface'
import { ObjectId } from 'mongodb'
import {
  ApproveQuantityRequestBody,
  GetAllQuantityAdminRequestBody,
  GetAllQuantityRequestBody,
  RejectQuantityRequestBody
} from '~/models/requestes/Services.requests'
import { removeNullOutOfObject, toObjectId } from '~/utils/utils'
import { servicesMessages } from '~/constants/messages'

class QuantityRequestServices {
  /**
   * Tạo yêu cầu tăng số lần dịch vụ mới
   */
  async createRequest(data: CreateQuantityRequest) {
    // Lấy thông tin dịch vụ để biết số lần hiện tại
    // const service = await this.checkServiceExist(data.serviceId)

    // Tạo yêu cầu mới

    const dataConvert: IQuantityRequestData = {
      userId: new ObjectId(data.userId),
      serviceId: new ObjectId(data.serviceId),
      currentQuantity: data.currentQuantity,
      branch: data.branch,
      servicesCardSoldId: new ObjectId(data.servicesCardSoldId),
      requestedQuantity: data.requestedQuantity,
      reason: data.reason,
      status: QuantityRequestStatus.PENDING,
      media: data.media
    }
    const request = await quantityRequestRepository.createRequest(dataConvert)

    // Tạo lịch sử yêu cầu
    await quantityRequestRepository.createRequestHistory({
      requestId: request._id?.toString() || '',
      action: 'created',
      performedBy: data.userId
    })
    return request
  }

  /**
   * Lấy tất cả yêu cầu của người dùng
   */
  async getUserRequests(data: GetAllQuantityRequestBody) {
    const { page, limit, branch, status, date, user_id } = data

    const query = {
      branch: branch ? toObjectId(branch) : null,
      status: status ? status : null,
      date: date ? new Date(date) : null,
      userId: toObjectId(user_id)
    }

    const cleanedQuery = removeNullOutOfObject(query)
    const requests = await quantityRequestRepository.getUserRequests({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      query: cleanedQuery
    })
    return requests
  }

  /**
   * Lấy lịch sử của một yêu cầu
   */
  async getRequestHistory(requestId: string, userId: string, userRole: number) {
    // Kiểm tra quyền truy cập
    const request = await this.checkRequestExist(requestId)

    // Chỉ cho phép người dùng xem lịch sử yêu cầu của chính họ hoặc admin/manager
    const requestUserIdStr = request.userId.toString()

    if (
      requestUserIdStr !== userId &&
      userRole !== 1 && // ADMIN
      userRole !== 3 // MANAGER
    ) {
      throw new Error('Không có quyền truy cập')
    }

    const history = await quantityRequestRepository.getRequestHistory(requestId)
    return history
  }

  /**
   * Lấy tất cả yêu cầu cho admin
   */
  async getAllRequests(data: GetAllQuantityAdminRequestBody) {
    const { page, limit, branch, status, date } = data

    const query = {
      branch: branch ? toObjectId(branch) : null,
      status: status ? status : null,
      date: date ? new Date(date) : null
    }

    const cleanedQuery = removeNullOutOfObject(query)
    const requests = await quantityRequestRepository.getAllRequests({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      query: cleanedQuery as any
    })
    return requests
  }

  /**
   * Phê duyệt yêu cầu
   */
  async approveRequest(data: ApproveQuantityRequestBody) {
    const { requestId, note, userId } = data
    // Lấy thông tin yêu cầu
    const request = await this.checkRequestExist(requestId)

    // Kiểm tra trạng thái
    if (request.status !== QuantityRequestStatus.PENDING) {
      throw new ErrorWithStatusCode({
        message: servicesMessages.REQUEST_ALREADY_PROCESSED,
        statusCode: HttpStatusCode.BadRequest
      })
    }

    //Update số lần dịch vụ
    await quantityRequestRepository.updateQuantityServicesCardSold({
      services_card_sold_id: toObjectId(request.servicesCardSoldId),
      services_id: toObjectId(request.serviceId),
      increaseAmount: request.requestedQuantity
    })

    // Cập nhật số lần dịch vụ
    // await databaseServiceSale.updateServiceQuantity(request.serviceId.toString(), request.requestedQuantity)

    // Cập nhật trạng thái yêu cầu
    const updatedRequest = await quantityRequestRepository.updateRequestStatus(
      requestId,
      QuantityRequestStatus.APPROVED,
      note
    )

    // Tạo lịch sử
    await quantityRequestRepository.createRequestHistory({
      requestId,
      action: 'approved',
      performedBy: userId as string,
      note
    })

    return updatedRequest
  }

  /**
   * Từ chối yêu cầu
   */
  async rejectRequest(data: RejectQuantityRequestBody) {
    const { requestId, note, userId } = data
    // Lấy thông tin yêu cầu
    const request = await this.checkRequestExist(requestId)

    // Kiểm tra trạng thái
    if (request.status !== QuantityRequestStatus.PENDING) {
      throw new ErrorWithStatusCode({
        message: servicesMessages.REQUEST_ALREADY_PROCESSED,
        statusCode: HttpStatusCode.BadRequest
      })
    }

    // Cập nhật trạng thái yêu cầu
    const updatedRequest = await quantityRequestRepository.updateRequestStatus(
      requestId,
      QuantityRequestStatus.REJECTED,
      note
    )

    // Tạo lịch sử
    await quantityRequestRepository.createRequestHistory({
      requestId,
      action: 'rejected',
      performedBy: userId as string,
      note
    })

    return updatedRequest
  }

  /**
   * Lấy thống kê yêu cầu
   */
  async getRequestStats() {
    const stats = await quantityRequestRepository.getRequestStats()
    return stats
  }

  // Check that the target service exists

  // Check that the quantity request exists
  private async checkRequestExist(requestId: string) {
    const request = await quantityRequestRepository.getRequestById(requestId)
    if (!request) {
      throw new ErrorWithStatusCode({
        message: servicesMessages.QUANTITY_REQUEST_NOT_FOUND,
        statusCode: HttpStatusCode.NotFound
      })
    }
    return request
  }
}

const quantityRequestServices = new QuantityRequestServices()
export default quantityRequestServices
