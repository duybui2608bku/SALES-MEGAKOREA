import {
  GetServicesCardSoldOfCustomer,
  ServicesCategoryType,
  ServicesOfCardType,
  ServicesType,
  StepServicesInterface
} from 'src/Interfaces/services/services.interfaces'
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

export type GetServicesResponse = SuccessResponse<{
  services: ServicesType[]
  limit: number
  page: number
  total: number
}>

export type CreateServicesResponse = SuccessResponse<void>
export type DeleteServicesResponse = SuccessResponse<void>
export type UpdateServicesResponse = SuccessResponse<void>

export type CreateServicesCardResponse = SuccessResponse<ServicesOfCardType[]>
export type UpdateServicesCardResponse = SuccessResponse<void>
export type DeleteServicesCardResponse = SuccessResponse<void>

export type GetServicesCardResponse = SuccessResponse<{
  servicesCard: ServicesOfCardType[]
  limit: number
  page: number
  total: number
}>

export type GetServicesCardSoldOfCustomerResponse = SuccessResponse<{
  servicesCardSold: GetServicesCardSoldOfCustomer[]
  limit: number
  page: number
  total: number
}>

export type CreateServicesCardSoldOfCustomerResponse = SuccessResponse<void>
export type UpdateServicesCardSoldOfCustomerRespone = SuccessResponse<void>

export type UpdateUsedOfServicesRespone = SuccessResponse<void>

export type UpdateQuantityOfServicesRespone = SuccessResponse<void>

// Step Service
export type GetAllStepServiceResponse = SuccessResponse<StepServicesInterface[]>
export type CreateStepServiceResponse = SuccessResponse<void>
