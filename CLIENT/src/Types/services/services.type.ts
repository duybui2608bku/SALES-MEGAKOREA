import { ServicesCategoryType } from 'src/Interfaces/services/services.interfaces'
import { SuccessResponse } from '../util.type'

export type GetCategoryServicesResponse = SuccessResponse<{
  categoryServices: ServicesCategoryType[]
  limit: number
  page: number
  total: number
}>

export type CreateCategoryServicesResponse = SuccessResponse<void>

export type UpdateCategoryServicesResponse = SuccessResponse<void>

export type DeleteCategoryServicesResponse = SuccessResponse<void>
