import { Collection, Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import Product from '~/models/schemas/product/Product.schema'
import { Services, ServicesCategory } from '~/models/schemas/services/Services.schema'
import Bracnh from '~/models/schemas/branch/branch.schema'
import User from '~/models/schemas/User.schema'
import Customer from '~/models/schemas/customer/Customer.shema'
dotenv.config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@megakorae-call.rrq1b.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=MEGAKORAE-CALL&tls=true`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    // eslint-disable-next-line no-useless-catch
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      throw error
    }
  }

  async indexCustomer() {
    const exsit = await this.customers.indexExists('phone_text')
    if (!exsit) {
      await this.customers.createIndex({ phone_text: 'text' }, { default_language: 'none' })
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.USERS_COLLECTION as string)
  }
  get customers(): Collection<Customer> {
    return this.db.collection(process.env.CUSTOMERS_COLLECTION as string)
  }

  get branch(): Collection<Bracnh> {
    return this.db.collection(process.env.BRANCH_COLLECTION as string)
  }

  get services_category(): Collection<ServicesCategory> {
    return this.db.collection(process.env.SERVICES_CATEGORY_COLLECTION as string)
  }

  get services(): Collection<Services> {
    return this.db.collection(process.env.SERVICES_COLLECTION as string)
  }

  get product(): Collection<Product> {
    return this.db.collection(process.env.PRODUCT_COLLECTION as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
