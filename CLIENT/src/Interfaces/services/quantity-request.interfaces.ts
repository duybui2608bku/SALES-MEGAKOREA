import { QuantityRequestStatus, RoleUser, TypeCommision, UserStatus } from 'src/Constants/enum'
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

export interface userInAllRequestAdmin {
  _id: string
  name: string
  email: string
  password: string
  created_at: Date
  updated_at: Date
  forgot_password_token: string
  avatar: string
  role: RoleUser
  status: UserStatus
  branch: string
  coefficient: number
}

export interface AllRequestAdmin {
  _id: string
  userId: string
  serviceId: string
  currentQuantity: number
  requestedQuantity: number
  reason: string
  media: string[]
  servicesCardSoldId: string
  status: QuantityRequestStatus
  adminNote: string
  createdAt: Date
  updatedAt: Date
  branch: string
  user: userInAllRequestAdmin[]
}

export interface IQuantityRequestWithDetails extends IQuantityRequest {
  user?: UserGeneralInterface
  detailedService?: ServicesType
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
  branch: string
  requestedQuantity: number
  reason?: string
  currentQuantity: number
  servicesCardSoldId: string
  media: string[]
}

export interface IUpdateQuantityRequestStatusPayload {
  note?: string
  requestId: string
}

export interface IQuantityRequestsQueryParams {
  status?: QuantityRequestStatus
  limit?: number
  skip?: number
}
