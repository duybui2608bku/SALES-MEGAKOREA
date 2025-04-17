import { ObjectId } from 'mongodb'
import customerRepository from 'repository/services/customer.services.repository'
import { CreateCustomerRequestBody } from '~/models/requestes/Customer.request'

class CustomerServices {
  async createCustomer(data: CreateCustomerRequestBody) {
    const { branch, ...customerData } = data
    const customerDataWithObjectId = {
      ...customerData,
      branch: new ObjectId(branch)
    }
    const result = await customerRepository.createCustomer(customerDataWithObjectId)
    return result
  }
}

const customerServices = new CustomerServices()
export default customerServices
