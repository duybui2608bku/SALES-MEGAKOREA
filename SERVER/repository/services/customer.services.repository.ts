import databaseServiceSale from 'services/database.services.sale'
import { CreateCustomerData } from '~/interface/customer/customer.interface'
import Customer from '~/models/schemas/customer/Customer.shema'

class CustomerRepository {
  async createCustomer(data: CreateCustomerData) {
    const result = await databaseServiceSale.customers.insertOne(new Customer(data))
    return result.insertedId
  }
}

const customerRepository = new CustomerRepository()
export default customerRepository
