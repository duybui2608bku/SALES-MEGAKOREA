import { ObjectId } from 'mongodb'
import { QuantityRequestStatus } from '../../models/schemas/services/quantity-request.schema'
import { CardServicesSoldType } from './services.interface'

export interface QuantityRequestInterface {
  _id?: ObjectId
  userId: ObjectId
  serviceId: ObjectId
  currentQuantity: number
  requestedQuantity: number
  reason: string
  status: QuantityRequestStatus
  adminNote?: string
  createdAt: Date
  updatedAt: Date
}

export interface QuantityRequestWithDetailsInterface extends QuantityRequestInterface {
  user?: {
    _id: ObjectId
    name: string
    email: string
    role: string
  }
  service?: {
    _id: ObjectId
    name: string
    code: string
    price: number
  }
  serviceCardSold?: CardServicesSoldType
}

export interface QuantityRequestHistoryInterface {
  _id?: ObjectId
  requestId: ObjectId
  action: 'created' | 'approved' | 'rejected'
  performedBy: ObjectId
  note?: string
  createdAt: Date
}

export interface QuantityRequestHistoryWithDetailsInterface extends QuantityRequestHistoryInterface {
  performer?: {
    _id: ObjectId
    name: string
    email: string
    role: string
  }
}

export interface CreateQuantityRequest {
  userId: string
  serviceId: string
  currentQuantity: number
  requestedQuantity: number
  branch?: string
  reason?: string
  servicesCardSoldId: string
  media: string[]
}

export interface CreateQuantityRequestHistoryDto {
  requestId: string
  action: 'created' | 'approved' | 'rejected'
  performedBy: string
  note?: string
}

export interface UpdateQuantityRequestStatusDto {
  status: QuantityRequestStatus
  adminNote?: string
}

export interface QuantityRequestQueryParams {
  status?: QuantityRequestStatus
  limit?: number
  skip?: number
}

export interface GetAllQuantityData {
  page: number
  limit: number
  query: {
    [key: string]: any
  }
}

export interface GetAllQuantityAdminData {
  page: number
  limit: number
  query: {
    [key: string]: any
  }
}
