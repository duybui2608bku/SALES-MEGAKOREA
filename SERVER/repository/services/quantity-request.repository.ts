import { Collection, ObjectId } from 'mongodb'
import {
  QuantityRequest,
  QuantityRequestHistory,
  QuantityRequestStatus,
  IQuantityRequestData,
  IQuantityRequestHistoryData
} from '../../src/models/schemas/services/quantity-request.schema'
import {
  CreateQuantityRequestHistoryDto,
  GetAllQuantityAdminData,
  GetAllQuantityData
} from '../../src/interface/services/quantity-request.interface'
import databaseServiceSale from '../../services/database.services.sale'
import { createProjectionField } from '~/utils/utils'

export class QuantityRequestRepository {
  /**
   * Tạo yêu cầu tăng số lần dịch vụ mới
   */
  async createRequest(data: IQuantityRequestData): Promise<QuantityRequest> {
    const request = new QuantityRequest(data)
    await databaseServiceSale.quantityRequests.insertOne(request)
    return request
  }

  /**
   * Tạo lịch sử yêu cầu
   */
  async createRequestHistory(historyData: CreateQuantityRequestHistoryDto): Promise<QuantityRequestHistory> {
    const data: IQuantityRequestHistoryData = {
      requestId: new ObjectId(historyData.requestId),
      action: historyData.action,
      performedBy: new ObjectId(historyData.performedBy),
      note: historyData.note
    }

    const history = new QuantityRequestHistory(data)
    await databaseServiceSale.quantityRequestHistories.insertOne(history)
    return history
  }

  /**
   * Lấy tất cả yêu cầu của một người dùng
   */
  async getUserRequests(data: GetAllQuantityData) {
    const { page, limit, query } = data
    const skip = (page - 1) * limit
    const projectionService = createProjectionField('service', [
      'branch',
      'user_id',
      'service_group_id',
      'step_services',
      'products',
      'employee'
    ])

    const projectoionServiceCardSold = createProjectionField('serviceCardSold', ['branch', 'services_of_card', 'price'])

    const requests = await databaseServiceSale.quantityRequests
      .aggregate([
        {
          $match: query
        },
        {
          $lookup: {
            from: 'services',
            localField: 'serviceId',
            foreignField: '_id',
            as: 'service'
          }
        },
        {
          $lookup: {
            from: 'services_card_sold',
            localField: 'servicesCardSoldId',
            foreignField: '_id',
            as: 'serviceCardSold'
          }
        },
        {
          $project: {
            ...projectoionServiceCardSold,
            ...projectionService
          }
        }
      ])
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray()
    const total = await databaseServiceSale.quantityRequests.countDocuments(query)

    return {
      requests,
      total,
      page,
      limit
    }
  }

  /**
   * Lấy tất cả yêu cầu cho admin
   */
  async getAllRequests(data: GetAllQuantityAdminData) {
    const { page, limit, query } = data
    const skip = (page - 1) * limit
    const requests = await databaseServiceSale.quantityRequests
      .aggregate([
        {
          $match: query
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        }
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return requests
  }

  /**
   * Lấy thông tin chi tiết của một yêu cầu
   */
  async getRequestById(requestId: string): Promise<QuantityRequest | null> {
    const request = await databaseServiceSale.quantityRequests.findOne({ _id: new ObjectId(requestId) })
    return request
  }

  /**
   * Lấy lịch sử của một yêu cầu
   */
  async getRequestHistory(requestId: string): Promise<QuantityRequestHistory[]> {
    const histories = await databaseServiceSale.quantityRequestHistories
      .find({ requestId: new ObjectId(requestId) })
      .sort({ createdAt: 1 })
      .toArray()

    // Thực hiện lookup thủ công
    const enhancedHistories = []
    const userCollection = databaseServiceSale.users

    for (const history of histories) {
      const performer = await userCollection.findOne({ _id: history.performedBy })

      enhancedHistories.push({
        ...history,
        performer: performer
          ? {
              _id: performer._id,
              name: performer.name,
              email: performer.email,
              role: performer.role?.toString() || ''
            }
          : undefined
      })
    }

    return enhancedHistories
  }

  /**
   * Cập nhật trạng thái yêu cầu
   */
  async updateRequestStatus(
    requestId: string,
    status: QuantityRequestStatus,
    adminNote?: string
  ): Promise<QuantityRequest | null> {
    const result = await databaseServiceSale.quantityRequests.findOneAndUpdate(
      { _id: new ObjectId(requestId) },
      {
        $set: {
          status,
          adminNote,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    )

    return result
  }

  /**
   * Lấy thống kê yêu cầu
   */
  async getRequestStats(): Promise<{
    total: number
    pending: number
    approved: number
    rejected: number
  }> {
    const pipeline = [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]

    const stats = await databaseServiceSale.quantityRequests.aggregate(pipeline).toArray()

    const result = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    }

    stats.forEach((stat) => {
      const status = stat._id
      const count = stat.count

      if (status === QuantityRequestStatus.PENDING) {
        result.pending = count
      } else if (status === QuantityRequestStatus.APPROVED) {
        result.approved = count
      } else if (status === QuantityRequestStatus.REJECTED) {
        result.rejected = count
      }

      result.total += count
    })

    return result
  }
}

const quantityRequestRepository = new QuantityRequestRepository()
export default quantityRequestRepository
