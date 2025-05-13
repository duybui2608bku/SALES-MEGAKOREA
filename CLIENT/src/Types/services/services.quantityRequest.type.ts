import { IQuantityRequest } from 'src/Interfaces/services/quantity-request.interfaces'
import { SuccessResponse } from '../util.type'

export type GetAllUserRequestResponse = SuccessResponse<{
  requests: IQuantityRequest[]
  limit: number
  page: number
  total: number
}>

export type GetAllRequestStats = SuccessResponse<{
  total: number
  pending: number
  approved: number
  rejected: number
}>
