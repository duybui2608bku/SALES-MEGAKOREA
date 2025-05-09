import { CommisionSaleUserInterface } from 'src/Interfaces/commision/commisionSale.interface'
import { SuccessResponse } from '../util.type'

export type GetCommisionSaleUserResponse = SuccessResponse<{
  data: CommisionSaleUserInterface[]
  pagination: {
    page: number
    limit: number
    total: number
  }
  summary: {
    totalCommision: number
    totalUser: number
  }
}>
