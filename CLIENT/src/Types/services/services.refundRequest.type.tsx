import { SuccessResponse } from '../util.type'

export type GetAllUserRefundRequestResponse = SuccessResponse<{
  limit: number
  page: number
  total: number
}>

export type CreateRefundRequestResponse = SuccessResponse<void>
