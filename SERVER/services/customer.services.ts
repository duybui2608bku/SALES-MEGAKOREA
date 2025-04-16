import customerRepository from 'repository/services/customer.services.repository'
import { CreateCustomerData } from '~/interface/customer/customer.interface'

class CustomerServices {
  async createCustomer(data: CreateCustomerData) {
    await customerRepository.createCustomer(data)
  }
}

const customerServices = new CustomerServices()
export default customerServices
