import {
  CreateServicesCardRequestBody,
  CreateServicesCategoryRequestBody,
  CreateServicesRequestBody,
  GetAllServicesCategoryRequestQuery,
  GetAllServicesRequestQuery,
  GetServicesCardRequestBody,
  GetServicesCardSoldOfCustomerRequestBody,
  UpdatePaidOfServicesCardRequestBody,
  UpdateServicesCategoryRequestBody,
  UpdateServicesRequestBody
} from 'src/Interfaces/services/services.interfaces'
import axiosInstanceMain from '../axious.api'
import { pathServices } from 'src/Constants/path'
import {
  CreateCategoryServicesResponse,
  CreateServicesCardResponse,
  CreateServicesResponse,
  DeleteCategoryServicesResponse,
  DeleteServicesResponse,
  GetCategoryServicesResponse,
  GetServicesCardResponse,
  GetServicesCardSoldOfCustomerResponse,
  GetServicesResponse,
  UpdateCategoryServicesResponse,
  UpdateServicesCardResponse,
  UpdateServicesResponse
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
  },
  getAllServices(query: GetAllServicesRequestQuery) {
    return axiosInstanceMain.get<GetServicesResponse>(pathServices.getAllServices, { params: query })
  },
  createServices(body: CreateServicesRequestBody) {
    return axiosInstanceMain.post<CreateServicesResponse>(pathServices.createServices, body)
  },
  deleteServices(id: string) {
    return axiosInstanceMain.delete<DeleteServicesResponse>(`${pathServices.deleteServices}/${id}`)
  },
  updateServices(body: UpdateServicesRequestBody) {
    return axiosInstanceMain.patch<UpdateServicesResponse>(pathServices.updateServices, body)
  },
  //Services card
  async createServicesCard(body: CreateServicesCardRequestBody) {
    return await axiosInstanceMain.post<CreateServicesCardResponse>(pathServices.createServicesCard, body)
  },

  async updateServicesCard(body: UpdatePaidOfServicesCardRequestBody) {
    return await axiosInstanceMain.patch<UpdateServicesCardResponse>(pathServices.updateServicesCard, body)
  },
  async getServicesCard(body: GetServicesCardRequestBody) {
    return axiosInstanceMain.post<GetServicesCardResponse>(pathServices.getAllServicesCard, body)
  },
  async updateHistoryPaid(body: UpdatePaidOfServicesCardRequestBody) {
    return axiosInstanceMain.patch<UpdateServicesCardResponse>(pathServices.updateHistoryPaid, body)
  },
  async GetServicesCardSoldOfCustomer(body: GetServicesCardSoldOfCustomerRequestBody) {
    return axiosInstanceMain.post<GetServicesCardSoldOfCustomerResponse>(
      pathServices.getAllSoldServicesCardOfCustomer,
      body
    )
  }
}
