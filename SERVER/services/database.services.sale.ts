import { Collection, Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import User from '../src/models/schemas/User.schema'
import Bracnh from '../src/models/schemas/branch/branch.schema'
import { Services, ServicesCategory } from '../src/models/schemas/services/Services.schema'
import Product from '../src/models/schemas/product/Product.schema'
import { CardServicesSoldType, CardServicesType, ServicesOfCard } from '~/interface/services/services.interface'
import { CommisionCardServices } from '~/models/schemas/commision/commision.cardservices.schema'
dotenv.config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@megakorae-call.rrq1b.mongodb.net/${process.env.DB_NAME_SALE_MEGA}?retryWrites=true&w=majority&appName=MEGAKORAE-CALL&tls=true`

class DatabaseServiceSale {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME_SALE_MEGA)
  }
  async connect() {
    // eslint-disable-next-line no-useless-catch
    try {
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

  get services_card_sold(): Collection<CardServicesSoldType> {
    return this.db.collection(process.env.SERVICES_CARD_SOLD_COLLECTION as string)
  }

  get commission_services_of_card(): Collection<CommisionCardServices> {
    return this.db.collection(process.env.COMMISSION_OF_SERVICES_CARD_COLLECTION as string)
  }
}

const databaseServiceSale = new DatabaseServiceSale()
export default databaseServiceSale
