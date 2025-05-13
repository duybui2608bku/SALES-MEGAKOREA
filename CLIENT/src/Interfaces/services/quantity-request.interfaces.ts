import { QuantityRequestStatus, TypeCommision } from 'src/Constants/enum'
import { UserGeneralInterface } from '../user/user.interface'
import { ServicesType } from './services.interfaces'

export interface serviceInIQuantityRequest {
  _id: string
  code: string
  is_active: boolean
  name: string
  descriptions: string
  price: number
  created_at: Date
  updated_at: Date
  type_price: TypeCommision
}

export interface serviceCardSoldInIQuantityRequest {
  _id: string
  code: string
  is_active: boolean
  name: string
  descriptions: string
  user_id: string
  created_at: Date
  updated_at: Date
}

export interface IQuantityRequest {
  _id: string
  userId: string
  serviceId: string
  currentQuantity: number
  requestedQuantity: number
  reason?: string
  media?: string[]
  servicesCardSoldId: string
  status: QuantityRequestStatus
  adminNote?: string
  createdAt: Date
  updatedAt: Date
  branch: string
  service: serviceInIQuantityRequest[]
  serviceCardSold: serviceCardSoldInIQuantityRequest[]
}

// export interface IQuantityRequestWithDetails extends IQuantityRequest {
//   user?: UserGeneralInterface
//   service?: ServicesType
// }

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
