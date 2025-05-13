import axiosInstanceMain from '../axious.api'
import { pathCommision } from 'src/Constants/path'
import {
  CreateCommisionTechnicanRequestBody,
  GetCommisionTechnicanUserRequestBody
} from 'src/Interfaces/commision/commisionTechnican.interface'
import {
  CreateCommisionTechnicanResponse,
  GetCommisionTechnicanUserResponse
} from 'src/Types/commision/commision.technican.type'

const commisionTechnicanApi = {
  async createCommisionTechnican(data: CreateCommisionTechnicanRequestBody) {
    return axiosInstanceMain.post<CreateCommisionTechnicanResponse>(pathCommision.createCommisionTechnician, data)
  },

  async getAllCommisionTechnican(body: GetCommisionTechnicanUserRequestBody) {
    return axiosInstanceMain.post<GetCommisionTechnicanUserResponse>(pathCommision.getCommisionTechnican, body)
  }
}

export default commisionTechnicanApi
