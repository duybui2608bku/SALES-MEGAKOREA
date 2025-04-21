import { Collection, Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import User from '../src/models/schemas/User.schema'
import Bracnh from '../src/models/schemas/branch/branch.schema'
import { Services, ServicesCategory } from '../src/models/schemas/services/Services.schema'
import Product from '../src/models/schemas/product/Product.schema'
import { CardServicesSoldOfCustomerType, CardServicesType } from '~/interface/services/services.interface'
import Customer from '~/models/schemas/customer/Customer.shema'
import HistoryPaidServicesCardSoldOfCustomer from '~/models/schemas/services/HistoryPaidServicesCardSoldOfCustomer.schema'
import { CommisionOfSeller } from '~/models/schemas/commision/commisionOfSeller.schema'
dotenv.config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@megakorae-call.rrq1b.mongodb.net/${process.env.DB_NAME_SALE_MEGA}?retryWrites=true&w=majority&appName=MEGAKORAE-CALL&tls=true`

class DatabaseServiceSale {
  private client: MongoClient
  // private db: Db
  private db!: Db
  constructor() {
    this.client = new MongoClient(uri)
    // this.db = this.client.db(process.env.DB_NAME_SALE_MEGA)
  }
  async connect() {
    // eslint-disable-next-line no-useless-catch
    try {
      await this.client.connect()
      this.db = this.client.db(process.env.DB_NAME_SALE_MEGA)

      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB - Sale!')
    } catch (error) {
      throw error
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.USERS_COLLECTION as string)
  }

  get branch(): Collection<Bracnh> {
    return this.db.collection(process.env.BRANCH_SALE_COLLECTION as string)
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

  get services_card(): Collection<CardServicesType> {
    return this.db.collection(process.env.SERVICES_CARD_COLLECTION as string)
  }

  get services_card_sold(): Collection<CardServicesType> {
    return this.db.collection(process.env.SERVICES_CARD_SOLD_COLLECTION as string)
  }

  get services_card_sold_of_customer(): Collection<CardServicesSoldOfCustomerType> {
    return this.db.collection(process.env.SERVICES_CARD_SOLD_OF_CUSTOMER_COLLECTION as string)
  }

  get commission_seller(): Collection<CommisionOfSeller> {
    return this.db.collection(process.env.COMMISSION_OF_Seller_COLLECTION as string)
  }

  get customers(): Collection<Customer> {
    return this.db.collection(process.env.CUSTOMERS_COLLECTION as string)
  }

  get history_paid_services_card_of_customer(): Collection<HistoryPaidServicesCardSoldOfCustomer> {
    return this.db.collection(process.env.HISTORY_PAID_SERVICES_CARD_OF_CUSTOMER_COLLECTION as string)
  }
}

const databaseServiceSale = new DatabaseServiceSale()
export default databaseServiceSale
