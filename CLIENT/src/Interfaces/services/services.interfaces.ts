export interface GetAllServicesCategoryRequestQuery {
  page: number
  limit: number
}

export interface ServicesCategoryType {
  _id: string
  name: string
  descriptions: string
}

export interface CreateServicesCategoryRequestBody {
  name: string
  descriptions?: string
}

export interface UpdateServicesCategoryRequestBody {
  _id: string
  name?: string
  descriptions?: string
  [key: string]: unknown
}
