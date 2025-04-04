import { TypeCommision } from '~/constants/enum'

export interface CreateCommisionCardServicesRequestType {
  card_services_id: string
  commision: number
  type_commision: TypeCommision
  employee_id: string
  descriptions?: string
}
