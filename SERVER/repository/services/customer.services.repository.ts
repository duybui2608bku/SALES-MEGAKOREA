import databaseServiceSale from 'services/database.services.sale'
import { CreateCustomerData } from '~/interface/customer/customer.interface'
import Customer from '~/models/schemas/customer/Customer.shema'

class CustomerRepository {
  async createCustomer(data: CreateCustomerData) {
    await databaseServiceSale.customers.insertOne(new Customer(data))
  }
}

const customerRepository = new CustomerRepository()
export default customerRepository
