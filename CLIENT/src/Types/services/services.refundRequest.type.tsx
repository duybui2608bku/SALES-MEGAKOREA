import { RefundRequest } from 'src/Interfaces/services/refund-request.interfaces'
import { SuccessResponse } from '../util.type'

export type GetAllUserRefundRequestResponse = SuccessResponse<{
  requests: RefundRequest[]
  limit: number
  page: number
  total: number
}>

export type CreateRefundRequestResponse = SuccessResponse<void>

export type GetAllRefundRequestStatsResponse = SuccessResponse<{
  total: number
  pending: number
  approved: number
  rejected: number
}>

export type GetAllAdminRefundRequestResponse = SuccessResponse<{
  requests: RefundRequest[]
  limit: number
  page: number
  total: number
}>

export type ApproveRefundRequestAdminResponse = SuccessResponse<void>

export type RejectRefundRequestAdminResponse = SuccessResponse<void>
