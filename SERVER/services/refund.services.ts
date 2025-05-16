import { ObjectId } from 'mongodb'
import refundRepository from 'repository/services/refund.repository'
import { IRefundRequestData, RefundRequestStatus } from '~/models/schemas/services/refund.schema'
import { ErrorWithStatusCode } from '~/models/Errors'
import { HttpStatusCode, UserRole } from '~/constants/enum'
import { CreateRefundRequest } from '~/interface/services/refund.interface'
import {
  GetAllRefundRequestBody,
  GetAllRefundAdminRequestBody,
  ApproveRefundRequestBody,
  RejectRefundRequestBody
} from '~/models/requestes/refund.requests'
import { removeNullOutOfObject, toObjectId } from '~/utils/utils'
import { servicesMessages } from '~/constants/messages'
import databaseServiceSale from './database.services.sale'

class RefundServices {
  async createRequest(data: CreateRefundRequest) {
    const dataConvert: IRefundRequestData = {
      user_id: new ObjectId(data.userId),
      services_card_sold_of_customer_id: new ObjectId(data.services_card_sold_of_customer_id),
      current_price: data.current_price,
      requested_price: data.requested_price,
      refund_type: data.refund_type,
      branch: data.branch || '',
      reason: data.reason || '',
      status: RefundRequestStatus.PENDING
    }

    const request = await refundRepository.createRequest(dataConvert)
    await refundRepository.createRequestHistory({
      request_id: request._id?.toString() as string,
      action: 'created',
      performed_by: data.userId
    })
    return request
  }

  async getUserRequests(data: GetAllRefundRequestBody) {
    const { page, limit, branch, status, date, user_id } = data

    const query = {
      branch: branch ? toObjectId(branch) : null,
      status: status ? status : null,
      date: date ? new Date(date) : null,
      user_id: toObjectId(user_id)
    }

    const cleanedQuery = removeNullOutOfObject(query)
    return await refundRepository.getUserRequests({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      query: cleanedQuery
    })
  }

  async getRequestHistory(requestId: string, userId: string, userRole: number) {
    const request = await this.checkRequestExist(requestId)
    const requestUserIdStr = request.user_id.toString()

    if (requestUserIdStr !== userId && userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER) {
      throw new ErrorWithStatusCode({
        message: servicesMessages.REQUEST_ALREADY_PROCESSED,
        statusCode: HttpStatusCode.Forbidden
      })
    }

    const history = await refundRepository.getRequestHistory(requestId)
    return history
  }

  async getAllRequests(data: GetAllRefundAdminRequestBody) {
    const { page, limit, branch, status, date } = data

    const query = {
      branch: branch ? toObjectId(branch) : null,
      status: status ? status : null,
      date: date ? new Date(date) : null
    }
    const cleanedQuery = removeNullOutOfObject(query)
    return await refundRepository.getAllRequests({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      query: cleanedQuery
    })
  }

  async approveRequest(data: ApproveRefundRequestBody) {
    const { request_id, note, userId } = data
    const request = await this.checkRequestExist(request_id)

    if (request.status !== RefundRequestStatus.PENDING) {
      throw new ErrorWithStatusCode({
        message: servicesMessages.REQUEST_ALREADY_PROCESSED,
        statusCode: HttpStatusCode.BadRequest
      })
    }

    const serviceCardSoldOfCustomer = await databaseServiceSale.services_card_sold_of_customer.findOne({
      _id: request.services_card_sold_of_customer_id
    })

    if (serviceCardSoldOfCustomer) {
      await databaseServiceSale.services_card_sold_of_customer.updateOne(
        { _id: request.services_card_sold_of_customer_id },
        {
          $set: {
            refund: {
              date: request.created_at,
              price: request.requested_price,
              type: request.refund_type,
              descriptions: request.reason
            }
          }
        }
      )
    }

    const updatedRequest = await refundRepository.updateRequestStatus(request_id, RefundRequestStatus.APPROVED, note)

    await refundRepository.createRequestHistory({
      request_id: request_id,
      action: 'approved',
      performed_by: userId as string,
      note
    })

    return updatedRequest
  }

  async rejectRequest(data: RejectRefundRequestBody) {
    const { request_id, note, userId } = data
    const request = await this.checkRequestExist(request_id)

    if (request.status !== RefundRequestStatus.PENDING) {
      throw new ErrorWithStatusCode({
        message: servicesMessages.REQUEST_ALREADY_PROCESSED,
        statusCode: HttpStatusCode.BadRequest
      })
    }

    const serviceCardSoldOfCustomer = await databaseServiceSale.services_card_sold_of_customer.findOne({
      _id: request.services_card_sold_of_customer_id
    })

    if (serviceCardSoldOfCustomer) {
      await databaseServiceSale.services_card_sold_of_customer.updateOne(
        { _id: request.services_card_sold_of_customer_id },
        {
          $set: {
            refund: null
          }
        }
      )
    }

    const updatedRequest = await refundRepository.updateRequestStatus(request_id, RefundRequestStatus.REJECTED, note)

    await refundRepository.createRequestHistory({
      request_id: request_id,
      action: 'rejected',
      performed_by: userId as string,
      note
    })

    return updatedRequest
  }

  async getRequestStats() {
    const stats = await refundRepository.getRequestStats()
    return stats
  }

  private async checkRequestExist(requestId: string) {
    const request = await refundRepository.getRequestById(requestId)
    if (!request) {
      throw new ErrorWithStatusCode({
        message: servicesMessages.REFUND_REQUEST_NOT_FOUND,
        statusCode: HttpStatusCode.NotFound
      })
    }
    return request
  }
}

const refundServices = new RefundServices()
export default refundServices
