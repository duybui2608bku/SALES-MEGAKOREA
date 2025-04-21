import { Customer } from 'src/Interfaces/customers/customers.interfaces'
import { SuccessResponse } from '../util.type'

export type GetAllCustomersResponseBody = SuccessResponse<{
  customers: Customer[]
  total: number
  limit: number
  page: number
}>

export type SearchCustomersByPhoneResponse = SuccessResponse<Customer[]>

export type CreateCustomerResponse = SuccessResponse
