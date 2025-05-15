import { RefundEnum, RequestStatus } from 'src/Constants/enum'
import { BranchType } from '../branch/branch.interface'

export interface userInRefundRequest {
  _id: string
  name: string
  email: string
  created_at: Date
  updated_at: Date
  avatar: string
  coefficient: number
}

export interface RefundRequest {
  _id: string
  user_id: string
  services_card_sold_of_customer_id: string
  current_price: number
  requested_price: number
  refund_type: RefundEnum
  reason: number
  branch: BranchType
  status: RequestStatus
  admin_note: string
  created_at: Date
  updated_at: Date
  user: userInRefundRequest
}

export interface CreateRefundRequestBodyRequest {
  services_card_sold_of_customer_id: string
  current_price: number
  requested_price: number
  refund_type: RefundEnum
  branch?: string
  reason?: string
}

export interface ApproveRefundRequestBody {
  request_id: string
  note: string
  userId?: string
}

export interface RejectRefundRequestBody {
  request_id: string
  note: string
  userId?: string
}
