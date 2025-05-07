import { TypeCommision } from 'src/Constants/enum'

export interface CreateCommisionTechnicanRequestBody {
  user_id: string
  commision: number
  type: TypeCommision
  services_card_sold_of_customer_id: string
}

export interface CommisionTechnicanUserInterface {
  userName: string
  branchId: string
  branchName: string
  totalPercentCommission: number
  totalFixedCommission: number
  totalCommission: number
  count: number
  userId: string
}

export interface GetCommisionTechnicanUserRequestBody {
  limit?: string
  page?: string
  date?: string
  user_id?: string
  branch_id?: string
  search?: string
}
