export interface CreateServicesCategoryRequestBody {
  name: string
  descriptions: string
  branch?: string[]
}

export interface DeleteServicesCategoryRequestParams {
  id: string
}

export interface UpdateServicesCategoryRequestBody {
  id: string
  name?: string
  descriptions?: string
  branch?: string[]
}

export interface CreateServicesRequestBody {
  is_active: boolean
  name: string
  branch: string[]
  descriptions: string
  service_group_id: string
  price: number
  id_employee: string
  tour_price: number
  type_tour_price: number
  id_Product: string
}

export interface UpdateServicesRequestBody {
  id: string
  is_active?: boolean
  name?: string
  branch?: string[]
  descriptions?: string
  service_group_id?: string
  price?: number
  id_employee?: string
  tour_price?: number
  type_tour_price?: number
  id_Product?: string
}
