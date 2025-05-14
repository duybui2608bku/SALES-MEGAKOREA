import { RefundRequestStatus } from '~/models/schemas/services/refund.schema'

import { RefundEnum } from '~/constants/enum'

export interface CreateRefundRequestBody {
  services_card_sold_of_customer_id: string
  current_price: number
  requested_price: number
  refund_type: RefundEnum
  branch?: string
  reason?: string
}

export interface GetAllRefundRequestBody {
  user_id: string
  page: number
  limit: number
  branch?: string
  status?: RefundRequestStatus
  date?: string
}

export interface GetAllRefundAdminRequestBody {
  page: number
  limit: number
  branch?: string
  status?: RefundRequestStatus
  date?: string
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
