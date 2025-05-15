import { RefundEnum } from 'src/Constants/enum'

export interface CreateRefundRequestBodyRequest {
  services_card_sold_of_customer_id: string
  current_price: number
  requested_price: number
  refund_type: RefundEnum
  branch?: string
  reason?: string
}
