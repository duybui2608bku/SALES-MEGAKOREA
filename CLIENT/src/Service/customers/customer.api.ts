import axios from 'axios'
import config from 'src/Constants/config'
import { pathApiCustomer } from 'src/Constants/path'
import { Customer, CustomerFilterRequestType } from 'src/Interfaces/customers/customers.interfaces'
import {
  CreateCustomerResponse,
  GetAllCustomersResponseBody,
  SearchCustomersByPhoneResponse
} from 'src/Types/customer/customer.type'
import { SuccessResponse } from 'src/Types/util.type'
import axiosInstanceMain from '../axious.api'

const access_token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjc2YTY1MWI1NTk5ZjViZjQxNzZiZDExIiwidG9rZW5fdHlwZSI6MCwicm9sZSI6IkFETUlOX0ZCLUFEUyIsImlhdCI6MTc0MTkzMDE2MSwiZXhwIjoxODcxNTMwMTYxfQ.J4jk8kyLSuiFyQ851IF9PC1uzGpPmnnErN5ZxZQ4zXs'

export const customerApi = {
  searchCustomer(phone: string) {
    return axios.post<SuccessResponse<Customer[]>>(
      `${config.apiCustomer}${pathApiCustomer.searchCustomer}`,
      { phone },
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    )
  },
  getAllCustomersSchedule({
    page,
    limit,
    filter
  }: {
    page: number
    limit: number
    filter?: CustomerFilterRequestType
  }) {
    return axios.post<GetAllCustomersResponseBody>(
      `${config.apiCustomer}${pathApiCustomer.getCustomersSchedule}`,
      filter,
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        },
        params: {
          page,
          limit
        }
      }
    )
  },

  searchCustomersByPhoneSuccessSchedule: (phone: string) => {
    return axios.post<SearchCustomersByPhoneResponse>(
      `${config.apiCustomer}${pathApiCustomer.searchCustomerschedule}`,
      { phone },
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    )
  },

  createCustomer: (customer: Partial<Customer>) => {
    return axiosInstanceMain.post<CreateCustomerResponse>(`${pathApiCustomer.createCustomer}`, customer)
  }
}
