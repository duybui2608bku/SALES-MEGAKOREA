import {
  CreateServicesCategoryRequestBody,
  GetAllServicesCategoryRequestQuery,
  UpdateServicesCategoryRequestBody
} from 'src/Interfaces/services/services.interfaces'
import axiosInstanceMain from '../axious.api'
import { pathServices } from 'src/Constants/path'
import {
  CreateCategoryServicesResponse,
  DeleteCategoryServicesResponse,
  GetCategoryServicesResponse,
  UpdateCategoryServicesResponse
} from 'src/Types/services/services.type'

export const servicesApi = {
  getAllServicesCategory(query: GetAllServicesCategoryRequestQuery) {
    return axiosInstanceMain.get<GetCategoryServicesResponse>(pathServices.getAllCategoryService, { params: query })
  },
  createServicesCategory(body: CreateServicesCategoryRequestBody) {
    return axiosInstanceMain.post<CreateCategoryServicesResponse>(pathServices.createCategoryService, body)
  },
  updateServicesCategory(body: UpdateServicesCategoryRequestBody) {
    return axiosInstanceMain.patch<UpdateCategoryServicesResponse>(pathServices.updateCategoryService, body)
  },
  deleteServicesCategory(id: string) {
    return axiosInstanceMain.delete<DeleteCategoryServicesResponse>(`${pathServices.deleteCategoryService}/${id}`)
  }
}
