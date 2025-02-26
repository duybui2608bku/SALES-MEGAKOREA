import { pathApi } from 'src/Constants/path'
import axiosInstanceMain from '../axious.api'
import { LoginRequest } from 'src/Interfaces/auth/auth.interface'
import { LoginResponse } from 'src/Types/auth/auth.type'

export const authApi = {
  login(data: LoginRequest) {
    return axiosInstanceMain.post<LoginResponse>(pathApi.login, data)
  }
}
