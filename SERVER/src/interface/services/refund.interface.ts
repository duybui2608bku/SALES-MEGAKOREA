import { ObjectId } from 'mongodb'
import { RefundRequestStatus } from '~/models/schemas/services/refund.schema'
import { CardServicesSoldOfCustomerType, RefundType } from './services.interface'
import { RefundEnum } from '~/constants/enum'

export interface RefundRequestInterface {
  _id?: ObjectId
  user_id: ObjectId
  services_card_sold_of_customer_id: ObjectId
  current_price: number
  requested_price: number
  refund_type: RefundType
  branch?: string
  reason?: string
  status: RefundRequestStatus
  admin_note?: string
  created_at: Date
  updated_at: Date
}

export interface RefundRequestWithDetailsInterface extends RefundRequestInterface {
  user?: {
    _id: ObjectId
    name: string
    email: string
    role: string
  }
  serviceCardSoldOfCustomer?: CardServicesSoldOfCustomerType
}

export interface RefundRequestHistoryInterface {
  _id?: ObjectId
  request_id: ObjectId
  action: 'created' | 'approved' | 'rejected'
  performed_by: ObjectId
  note?: string
  created_at: Date
}

export interface RefundRequestHistoryWithDetailsInterface extends RefundRequestHistoryInterface {
  performer?: {
    _id: ObjectId
    name: string
    email: string
    role: string
  }
}

export interface CreateRefundRequest {
  userId: string
  services_card_sold_of_customer_id: string
  current_price: number
  requested_price: number
  refund_type: RefundEnum
  branch?: string
  reason?: string
}

export interface CreateRefundRequestHistoryDto {
  request_id: string
  action: 'created' | 'approved' | 'rejected'
  performed_by: string
  note?: string
}

export interface UpdateRefundRequestStatusDto {
  request_id: string
  status: RefundRequestStatus
  admin_note?: string
}

export interface GetAllRefundData {
  page: number
  limit: number
  query: { [key: string]: any }
}

export interface GetAllRefundAdminData {
  page: number
  limit: number
  query: { [key: string]: any }
}
