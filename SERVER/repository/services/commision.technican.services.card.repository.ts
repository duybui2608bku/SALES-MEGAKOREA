import databaseServiceSale from 'services/database.services.sale'
import { CreateCommisionOfTechnicanData, GetCommisionOfTechnicanData } from '~/interface/commision/commision.interface'
import { CommisionOfTechnican } from '~/models/schemas/commision/commisionOfTechnican.schema'

class CommisionTechnicanRepository {
  async CreateCommisionOfTechnican(data: CreateCommisionOfTechnicanData) {
    return await databaseServiceSale.commission_technican.insertOne(new CommisionOfTechnican(data))
  }

  async getCommisionOfTechnicanByUserId(data: GetCommisionOfTechnicanData) {
    const { user_id, query } = data
    const result = await databaseServiceSale.commission_seller
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

const commisionTechnicanRepository = new CommisionTechnicanRepository()
export default commisionTechnicanRepository
