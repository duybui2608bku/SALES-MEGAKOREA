export interface CommisionSaleUserInterface {
  userName: string
  branchId: string
  branchName: string
  totalCommision: number
  count: number
  userId: string
}

export interface GetCommisionSaleUserRequestBody {
  limit?: string
  page?: string
  date?: string
  user_id?: string
  branch_id?: string
  search?: string
}
