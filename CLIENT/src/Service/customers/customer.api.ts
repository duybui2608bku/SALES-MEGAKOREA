import axios from 'axios'
import config from 'src/Constants/config'
import { pathApiCustomer } from 'src/Constants/path'
import { Customer } from 'src/Interfaces/customers/customers.interfaces'
import { SuccessResponse } from 'src/Types/util.type'

export const customerApi = {
  searchCustomer(phone: string) {
    const access_token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjc2YTY1MWI1NTk5ZjViZjQxNzZiZDExIiwidG9rZW5fdHlwZSI6MCwicm9sZSI6IkFETUlOX0ZCLUFEUyIsImlhdCI6MTc0MTkzMDE2MSwiZXhwIjoxODcxNTMwMTYxfQ.J4jk8kyLSuiFyQ851IF9PC1uzGpPmnnErN5ZxZQ4zXs'
    return axios.post<SuccessResponse<Customer[]>>(
      `${config.apiCustomer}${pathApiCustomer.searchCustomer}`,
      { phone },
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    )
  }
}
