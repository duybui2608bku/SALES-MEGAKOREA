export interface AddAccountRequestBody {
  name: string
  time_zone: string
  today: string
  service: string
  report_date: Date
  branch_id: string
  user_id: string
}

export interface GetAccountOfMeParams {
  user_id: string
  branch_id: string
  report_date: Date
}

export interface UpdateAccountRequestBody {
  _id: string
  name: string
  time_zone: string
  service: string
  interact: number
  expense: number
  interact_previous: number
  expense_previous: number
}
