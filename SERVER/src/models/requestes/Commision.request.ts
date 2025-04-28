import { TypeCommision } from '~/constants/enum'

export interface CreateCommisionOfSellerRequestType {
  user_id: string
  commision: number
  date: Date
  services_card_sold_of_customer_id: string
}

export interface GetCommisionOfSellerByUserIdParams {
  user_id: string
}

export interface GetCommisionOfSellerByUserIdQueryType {
  start_date?: Date
  end_date?: Date
}

export interface CreateCommisionOfTechnicanRequestType {
  user_id: string
  commision: number
  date: Date
  type: TypeCommision
  services_card_sold_of_customer_id: string
}

export interface GetCommisionOfTechnicanByUserIdParams {
  user_id: string
}

export interface GetCommisionOfTechnicanByUserIdQueryType {
  start_date?: Date
  end_date?: Date
}
