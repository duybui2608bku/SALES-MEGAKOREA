import { CommisionTechnicanUserInterface } from 'src/Interfaces/commison/commisionTechnican.interface'
import { SuccessResponse } from '../util.type'

export type CreateCommisionTechnicanResponse = SuccessResponse<string>

export type GetCommisionTechnicanUserResponse = SuccessResponse<{
  data: CommisionTechnicanUserInterface[]
  pagination: {
    page: number
    limit: number
    total: number
  }
  summary: {
    totalPercentCommision: number
    totalFixedCommision: number
    totalCommision: number
    totalUser: number
  }
}>
