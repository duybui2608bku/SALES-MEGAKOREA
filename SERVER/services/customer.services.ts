import customerRepository from 'repository/services/customer.services.repository'
import { CreateCustomerData } from '~/interface/customer/customer.interface'

class CustomerServices {
  async createCustomer(data: CreateCustomerData) {
    const result = await customerRepository.createCustomer(data)
    return result
  }
}

const customerServices = new CustomerServices()
export default customerServices
