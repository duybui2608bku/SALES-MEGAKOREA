import databaseServiceSale from 'services/database.services.sale'
import { CreateCommisionOfSellerData, GetCommisionOfSellerData } from '~/interface/commision/commision.interface'
import { CommisionOfSeller } from '~/models/schemas/commision/commisionOfSeller.schema'

class CommisionSellerRepository {
  async createCommisionOfSeller(data: CreateCommisionOfSellerData) {
    return await databaseServiceSale.commision_seller.insertOne(new CommisionOfSeller(data))
  }

  async getCommisionOfSellerByUserId(data: GetCommisionOfSellerData) {
    const { user_id, query } = data
    const result = await databaseServiceSale.commision_seller
      .aggregate([
        {
          $match: {
            user_id: user_id,
            ...query
          }
        },
        {
          $lookup: {
            from: 'services_card_sold_of_customer',
            localField: 'services_card_sold_of_customer_id',
            foreignField: '_id',
            as: 'services_card_sold_of_customer'
          }
        },
        {
          $unwind: '$services_card_sold_of_customer'
        },
        {
          $lookup: {
            from: 'customers',
            localField: 'services_card_sold_of_customer.customer_id',
            foreignField: '_id',
            as: 'customer'
          }
        },
        {
          $unwind: {
            path: '$customer',
            preserveNullAndEmptyArrays: true // Giữ các bản ghi không có customer
          }
        },
        {
          $project: {
            _id: 1,
            commision: 1,
            create_at: 1,
            services_card_sold_of_customer: {
              _id: '$services_card_sold_of_customer._id',
              name: '$services_card_sold_of_customer.code'
            },
            customer: {
              _id: '$customer._id',
              name: '$customer.name',
              phone: '$customer.phone'
            }
          }
        }
      ])
      .toArray()
    return result
  }
}

const commisionSellerRepository = new CommisionSellerRepository()
export default commisionSellerRepository
