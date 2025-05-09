import databaseServiceSale from 'services/database.services.sale'
import {
  CreateCommisionOfSellerData,
  GetCommisionOfSellerData,
  GetCommisionOfSellerReportData
} from '~/interface/commision/commision.interface'
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

  async getAllCommisionOfSellerReport(data: GetCommisionOfSellerReportData) {
    const { query, page, limit } = data
    const skip = (page - 1) * limit

    const pipeline = [
      // Giai đoạn 1: Lọc theo các điều kiện từ query
      {
        $match: query
      },
      // Giai đoạn 2: Liên kết với bảng services_card_sold_of_customer để lấy price_paid làm hoa hồng
      {
        $lookup: {
          from: 'services_card_sold_of_customer',
          localField: 'services_card_sold_of_customer_id',
          foreignField: '_id',
          as: 'services_card_sold'
        }
      },
      // Giai đoạn 3: Chuyển mảng services_card_sold thành đối tượng
      {
        $unwind: {
          path: '$services_card_sold',
          preserveNullAndEmptyArrays: true
        }
      },
      // Giai đoạn 4: Liên kết với bảng users
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      // Giai đoạn 5: Chuyển mảng user thành đối tượng
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      // Giai đoạn 6: Liên kết với bảng branch
      {
        $lookup: {
          from: 'branch',
          localField: 'user.branch',
          foreignField: '_id',
          as: 'branch'
        }
      },
      // Giai đoạn 7: Chuyển mảng branch thành đối tượng
      {
        $unwind: {
          path: '$branch',
          preserveNullAndEmptyArrays: true
        }
      },
      // Giai đoạn 8: Tính toán hoa hồng từ price_paid thay vì trường commision
      {
        $addFields: {
          // Sử dụng price_paid từ services_card_sold làm hoa hồng, nhân với hệ số
          totalCommision: {
            $multiply: [{ $ifNull: ['$services_card_sold.price_paid', 0] }, { $ifNull: ['$user.coefficient', 1] }]
          }
        }
      },
      // Giai đoạn 9: Nhóm theo user_id
      {
        $group: {
          _id: '$user_id',
          userName: { $first: { $ifNull: ['$user.name', 'Không xác định'] } },
          branchId: { $first: { $ifNull: ['$branch._id', null] } },
          branchName: { $first: { $ifNull: ['$branch.name', 'Không xác định'] } },
          totalCommision: { $sum: '$totalCommision' },
          // Thêm đếm số lượng bản ghi
          count: { $sum: 1 }
        }
      },
      // Giai đoạn 10: Định dạng kết quả
      {
        $project: {
          _id: 0,
          userId: '$_id',
          userName: 1,
          branchId: 1,
          branchName: 1,
          totalCommision: 1,
          count: 1
        }
      }
    ]

    try {
      // Tạo bản sao của pipeline để thêm phân trang
      const paginatedPipeline = [...pipeline]

      // Thêm sắp xếp để đảm bảo kết quả nhất quán
      paginatedPipeline.push({
        $sort: { totalCommision: -1 }
      } as any)

      // Thêm phân trang
      if (page && limit) {
        paginatedPipeline.push({ $skip: skip } as any)
        paginatedPipeline.push({ $limit: limit } as any)
      }

      // Thực hiện truy vấn chính
      const result = await databaseServiceSale.commision_seller.aggregate(paginatedPipeline).toArray()

      // Tính tổng số bản ghi (nhóm theo user_id)
      const countPipeline = [
        // Sử dụng các bước đầu tiên của pipeline gốc, nhưng chỉ đến giai đoạn group
        { $match: query },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true
          }
        },
        { $group: { _id: '$user_id' } },
        { $count: 'total' }
      ] as any[]

      const totalCountResult = await databaseServiceSale.commision_seller.aggregate(countPipeline).toArray()
      const total = totalCountResult.length > 0 ? (totalCountResult[0] as any).total : 0

      // Thêm pipeline mới để tính tổng cho tất cả nhân viên
      const summaryPipeline = [
        { $match: query },
        {
          $lookup: {
            from: 'services_card_sold_of_customer',
            localField: 'services_card_sold_of_customer_id',
            foreignField: '_id',
            as: 'services_card_sold'
          }
        },
        {
          $unwind: {
            path: '$services_card_sold',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            // Sử dụng price_paid từ services_card_sold làm hoa hồng, nhân với hệ số
            totalCommision: {
              $multiply: [{ $ifNull: ['$services_card_sold.price_paid', 0] }, { $ifNull: ['$user.coefficient', 1] }]
            }
          }
        },
        {
          $group: {
            _id: null,
            totalUser: { $addToSet: '$user_id' }, // Sử dụng addToSet để đếm số lượng user_id duy nhất
            totalCommision: { $sum: '$totalCommision' }
          }
        },
        {
          $project: {
            _id: 0,
            totalUser: { $size: '$totalUser' }, // Đếm số lượng phần tử trong mảng totalUser
            totalCommision: 1
          }
        }
      ] as any[]

      // Thực hiện truy vấn tính tổng
      const summaryResult = await databaseServiceSale.commision_seller.aggregate(summaryPipeline).toArray()
      const summary =
        summaryResult.length > 0
          ? summaryResult[0]
          : {
              totalUser: 0,
              totalCommision: 0
            }

      return {
        data: result,
        pagination: {
          page,
          limit,
          total
        },
        summary: summary // Thêm thông tin tổng hợp vào kết quả trả về
      }
    } catch (error) {
      console.error('Lỗi trong quá trình tính toán hoa hồng:', error)
      throw error
    }
  }
}

const commisionSellerRepository = new CommisionSellerRepository()
export default commisionSellerRepository
