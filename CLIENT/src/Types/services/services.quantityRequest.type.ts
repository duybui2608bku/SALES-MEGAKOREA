import { AllRequestAdmin, IQuantityRequest } from 'src/Interfaces/services/quantity-request.interfaces'
import { SuccessResponse } from '../util.type'

export type GetAllUserRequestResponse = SuccessResponse<{
  requests: IQuantityRequest[]
  limit: number
  page: number
  total: number
}>

export type GetAllRequestStatsResponse = SuccessResponse<{
  total: number
  pending: number
  approved: number
  rejected: number
}>

export type GetAllRequestAdminResponse = SuccessResponse<{
  requests: AllRequestAdmin[]
  limit: number
  page: number
  total: number
}>

export type ApproveRequestAdminResponse = SuccessResponse<void>

export type RejectRequestAdminResponse = SuccessResponse<void>

export type CreateQuantityRequestResponse = SuccessResponse<void>
