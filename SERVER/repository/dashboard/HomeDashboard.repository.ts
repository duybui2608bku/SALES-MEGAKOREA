import databaseServiceSale from 'services/database.services.sale'
import { createDateRangeQuery } from '~/utils/utils'

class HomeDashboardRepository {
  async getHomeDashboardData(date?: string) {
    const queryDate = createDateRangeQuery(date)
    const [customer, servicesCardSold, profit] = await Promise.all([
      databaseServiceSale.customers.countDocuments(queryDate),
      databaseServiceSale.services_card_sold_of_customer.countDocuments(queryDate),
      databaseServiceSale.services_card_sold_of_customer.aggregate([
        {
          $match: queryDate
        },
        {
          $group: {
            _id: null,
            totalProfit: { $sum: '$total_price' }
          }
        }
      ])
    ])
  }
}

const homeDashboardRepository = new HomeDashboardRepository()
export default homeDashboardRepository
