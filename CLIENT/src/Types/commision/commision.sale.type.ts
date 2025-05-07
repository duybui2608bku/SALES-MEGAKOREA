import { CommisionSaleUserInterface } from 'src/Interfaces/commison/commisionSale.interface'
import { SuccessResponse } from '../util.type'

export type GetCommisionSaleUserResponse = SuccessResponse<{
  data: CommisionSaleUserInterface[]
  pagination: {
    page: number
    limit: number
    total: number
  }
  summary: {
    totalCommission: number
    totalUser: number
  }
}>
