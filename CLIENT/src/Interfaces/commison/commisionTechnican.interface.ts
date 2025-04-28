import { TypeCommision } from 'src/Constants/enum'

export interface CreateCommisionTechnicanRequestBody {
  user_id: string
  commision: number
  type: TypeCommision
  services_card_sold_of_customer_id: string
}
