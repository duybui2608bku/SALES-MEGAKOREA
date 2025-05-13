import { UserGeneralInterface } from '../user/user.interface'
import { ServicesType } from './services.interfaces'

export enum QuantityRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface IQuantityRequest {
  _id: string
  userId: string
  serviceId: string
  currentQuantity: number
  requestedQuantity: number
  reason?: string
  status: QuantityRequestStatus
  adminNote?: string
  createdAt: Date
  updatedAt: Date
}

export interface IQuantityRequestWithDetails extends IQuantityRequest {
  user?: UserGeneralInterface
  service?: ServicesType
}

export interface IQuantityRequestHistory {
  _id: string
  requestId: string
  action: 'created' | 'approved' | 'rejected'
  performedBy: string
  note?: string
  createdAt: Date
}

export interface ICreateQuantityRequestPayload {
  serviceId: string
  requestedQuantity: number
  reason: string
}

export interface IUpdateQuantityRequestStatusPayload {
  note?: string
}

export interface IQuantityRequestsQueryParams {
  status?: QuantityRequestStatus
  limit?: number
  skip?: number
}
