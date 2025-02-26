import axios, { AxiosResponse } from 'axios'
import config from 'src/Constants/config'
import { getAccessTokenFormLS, getProfileFromLS, saveAccessTokenToLS, setProfileFromLS } from 'src/Utils/localStorage'
import axiosRetry from 'axios-retry'

import { User } from 'src/Interfaces/user.interface'
import { pathApi } from 'src/Constants/path'

interface LoginResponse {
  result: {
    user: User
    access_token: string
  }
}

let accesstoken = getAccessTokenFormLS()
let profileUser = getProfileFromLS()

const axiosInstanceMain = axios.create({
  baseURL: config.baseUrl,
  timeout: 500000,
  headers: {
    'Content-Type': 'application/json'
  }
})

axiosRetry(axiosInstanceMain, {
  retries: 20,
  retryDelay: (retryCount) => retryCount * 500,
  retryCondition: (error) => {
    return error.code === 'ECONNABORTED' || error.response?.status == 500
  }
})

axiosInstanceMain.interceptors.request.use(
  (config) => {
    if (accesstoken && config.headers) {
      config.headers.Authorization = `Bearer ${accesstoken}`
      return config
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstanceMain.interceptors.response.use(
  function (response: AxiosResponse<LoginResponse>) {
    const { url } = response.config
    if (url === pathApi.login) {
      accesstoken = response.data.result.access_token
      profileUser = response.data.result.user
      saveAccessTokenToLS(accesstoken)
      setProfileFromLS(profileUser)
    }
    return response
  }
  // function (error: AxiosError) {
  //   if (error.response?.status !== HttpStatusCode.UnprocessableEntity) {
  //     const data: unknown | undefined = error.response?.data
  //     const message = (data as { message?: string }).message || error.message
  //   }
  //   if (error.response?.status === HttpStatusCode.Unauthorized) {
  //     clearLS()
  //     window.location.reload
  //   }
  //   return Promise.reject(error)
  // }
)

export default axiosInstanceMain
