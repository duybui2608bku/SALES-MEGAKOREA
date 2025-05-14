import { ObjectId } from 'mongodb'
import databaseServiceSale from '../../services/database.services.sale'
import {
  RefundRequest,
  RefundRequestHistory,
  RefundRequestStatus,
  IRefundRequestData,
  IRefundRequestHistoryData
} from '../../src/models/schemas/services/refund.schema'
import {
  CreateRefundRequestHistoryDto,
  GetAllRefundData,
  GetAllRefundAdminData
} from '../../src/interface/services/refund.interface'

export class RefundRepository {
  async createRequest(data: IRefundRequestData): Promise<RefundRequest> {
    const request = new RefundRequest(data)
    await databaseServiceSale.refundRequests.insertOne(request)
    return request
  }

  async createRequestHistory(historyData: CreateRefundRequestHistoryDto): Promise<RefundRequestHistory> {
    const data: IRefundRequestHistoryData = {
      request_id: new ObjectId(historyData.request_id),
      action: historyData.action,
      performed_by: new ObjectId(historyData.performed_by),
      note: historyData.note
    }
    const history = new RefundRequestHistory(data)
    await databaseServiceSale.refundRequestHistories.insertOne(history)
    return history
  }

  async getUserRequests(data: GetAllRefundData, userId: string) {
    const { page, limit, query } = data
    const skip = (page - 1) * limit
    const filter = { ...query, user_id: new ObjectId(userId) }
    const requests = await databaseServiceSale.refundRequests
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 })
      .toArray()
    const total = await databaseServiceSale.refundRequests.countDocuments(filter)
    return { requests, total, page, limit }
  }

  async getAllRequests(data: GetAllRefundAdminData) {
    const { page, limit, query } = data
    const skip = (page - 1) * limit
    const requests = await databaseServiceSale.refundRequests
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 })
      .toArray()
    const total = await databaseServiceSale.refundRequests.countDocuments(query)
    return { requests, total, page, limit }
  }

  async getRequestById(requestId: string): Promise<RefundRequest | null> {
    return await databaseServiceSale.refundRequests.findOne({ _id: new ObjectId(requestId) })
  }

  async getRequestHistory(requestId: string): Promise<RefundRequestHistory[]> {
    const histories = await databaseServiceSale.refundRequestHistories
      .find({ request_id: new ObjectId(requestId) })
      .sort({ created_at: 1 })
      .toArray()
    return histories
  }

  async updateRequestStatus(
    requestId: string,
    status: RefundRequestStatus,
    adminNote?: string
  ): Promise<RefundRequest | null> {
    const result = await databaseServiceSale.refundRequests.findOneAndUpdate(
      { _id: new ObjectId(requestId) },
      {
        $set: {
          status,
          admin_note: adminNote,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )
    return result
  }

  async getRequestStats() {
    const pipeline = [
      {
        $facet: {
          byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          total: [{ $count: 'count' }]
        }
      },
      {
        $project: {
          stats: {
            $arrayToObject: {
              $map: {
                input: '$byStatus',
                as: 'status',
                in: [{ $toString: '$$status._id' }, '$$status.count']
              }
            }
          },
          total: { $arrayElemAt: ['$total.count', 0] }
        }
      },
      {
        $project: {
          total: '$total',
          pending: {
            $ifNull: [{ $toInt: { $getField: { field: RefundRequestStatus.PENDING.toString(), input: '$stats' } } }, 0]
          },
          approved: {
            $ifNull: [{ $toInt: { $getField: { field: RefundRequestStatus.APPROVED.toString(), input: '$stats' } } }, 0]
          },
          rejected: {
            $ifNull: [{ $toInt: { $getField: { field: RefundRequestStatus.REJECTED.toString(), input: '$stats' } } }, 0]
          }
        }
      }
    ]
    const result = await databaseServiceSale.refundRequests.aggregate(pipeline).toArray()
    return result[0] || { total: 0, pending: 0, approved: 0, rejected: 0 }
  }
}

const refundRepository = new RefundRepository()
export default refundRepository
