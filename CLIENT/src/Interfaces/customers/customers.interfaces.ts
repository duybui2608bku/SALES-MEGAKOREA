export interface Customer {
  _id: string
  key?: string
  parent_id: string | null
  branch: string
  date: string
  note: string
  zalo: string
  status_expried: string
  history: string[]
  date_of_birth: string
  source: string
  name: string
  phone: string
  record: string[]
  address: string
  media: string[]
  bill_media: string[]
  social_media: string
  sex: string
  service: string[]
  service_detail: string
  pancake: string
  schedule: string
  telesales: {
    _id: string
    name: string
  }
  telesales_second: {
    _id: string
    name: string
  }
  rate: number
  status: string
  register_schedule: string
  sales: string
  sales_assistant: string
  total_amount: number
  amount_paid: number
  outstanding_amount: number
  reason_failure: string
  reason_failure_auto: string
  reason_failure_branch_auto: string
  final_status: string
  final_status_branch: string
  final_status_date: string
  is_old_phone: boolean
  status_data: string
  created_at: Date
  updated_at: Date
}

export type CustomerFilterRequestType = {
  branch?: string[]
  service?: string[]
  status?: string
  date?: string
  telesale_id?: string
  date_schedule?: string
}
