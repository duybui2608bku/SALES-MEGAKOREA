export interface CreateServicesCategoryRequestBody {
  name: string
  descriptions: string
  branch?: string[]
}

export interface DeleteServicesCategoryRequestParams {
  id: string
}

export interface UpdatewServicesCategoryRequestBody {
  id: string
  name?: string
  descriptions?: string
  branch?: string[]
}
