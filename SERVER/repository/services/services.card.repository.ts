import databaseServiceSale from 'services/database.services.sale'
import { PriceType } from '~/constants/enum'
import {
  CreateServicesCardData,
  GetCommisionOfDateData,
  GetServicesCardData,
  UpdateServicesCardData
} from '~/interface/services/services.interface'
import { CardServices } from '~/models/schemas/services/cardServices.schema'

class ServicesCardRepository {
  async createServicesCard(data: CreateServicesCardData) {
    await databaseServiceSale.services_card.insertOne(new CardServices(data))
  }

  async getAllServicesCard(data: GetServicesCardData) {
    const { page, query, limit } = data
    const skip = (page - 1) * limit

    const pipline = [
      //Match
      {
        $match: {
          ...query
        }
      },
      // Lookup branch
      {
        $lookup: {
          from: 'branch',
          localField: 'branch',
          foreignField: '_id',
          as: 'branch'
        }
      },

      // Lookup service_group
      {
        $lookup: {
          from: 'services_category',
          localField: 'service_group_id',
          foreignField: '_id',
          as: 'service_group'
        }
      },
      {
        $set: {
          service_group: { $arrayElemAt: ['$service_group', 0] }
        }
      },

      // Lưu trữ giá trị gốc của services_of_card
      {
        $set: {
          original_services_of_card: '$services_of_card'
        }
      },

      // Unwind services_of_card
      {
        $unwind: {
          path: '$services_of_card',
          preserveNullAndEmptyArrays: true
        }
      },

      // Lookup services cho services_of_card
      {
        $lookup: {
          from: 'services',
          localField: 'services_of_card.services_id',
          foreignField: '_id',
          as: 'services_of_card.service_details'
        }
      },
      {
        $set: {
          'services_of_card.service_details': { $arrayElemAt: ['$services_of_card.service_details', 0] }
        }
      },

      // Giữ price gốc từ services_of_card và tính total
      {
        $set: {
          'services_of_card.price': { $ifNull: ['$services_of_card.price', 0] }, // Bảo toàn price gốc
          'services_of_card.total': {
            $subtract: [
              { $multiply: ['$services_of_card.price', '$services_of_card.quantity'] }, // Dùng price từ services_of_card
              { $ifNull: ['$services_of_card.discount', 0] } // Đảm bảo discount là 0 nếu null
            ]
          }
        }
      },

      // Unwind step_services trong service_details
      {
        $unwind: {
          path: '$services_of_card.service_details.step_services',
          preserveNullAndEmptyArrays: true
        }
      },

      // Lookup users cho id_employee trong step_services
      {
        $lookup: {
          from: 'users',
          localField: 'services_of_card.service_details.step_services.id_employee',
          foreignField: '_id',
          as: 'services_of_card.service_details.step_services.employee_details'
        }
      },
      {
        $set: {
          'services_of_card.service_details.step_services.employee_details': {
            $arrayElemAt: ['$services_of_card.service_details.step_services.employee_details', 0]
          }
        }
      },

      // Group lại step_services thành mảng trong service_details
      {
        $group: {
          _id: {
            _id: '$_id',
            services_of_card_id: '$services_of_card.services_id',
            quantity: '$services_of_card.quantity',
            discount: '$services_of_card.discount',
            price: '$services_of_card.price', // Thêm price vào _id để bảo toàn
            total: '$services_of_card.total'
          },
          branch: { $first: '$branch' },
          code: { $first: '$code' },
          is_active: { $first: '$is_active' },
          name: { $first: '$name' },
          descriptions: { $first: '$descriptions' },
          session_time: { $first: '$session_time' },
          price_paid: { $first: '$price_paid' },
          history_price: { $first: '$history_price' },
          user_id: { $first: '$user_id' },
          service_group: { $first: '$service_group' },
          created_at: { $first: '$created_at' },
          updated_at: { $first: '$updated_at' },
          original_services_of_card: { $first: '$original_services_of_card' },
          employee: { $first: '$employee' },
          service_details: { $first: '$services_of_card.service_details' },
          step_services: { $push: '$services_of_card.service_details.step_services' }
        }
      },

      // Gộp lại services_of_card với price
      {
        $set: {
          services_of_card: {
            services_id: '$_id.services_of_card_id',
            quantity: '$_id.quantity',
            discount: '$_id.discount',
            price: '$_id.price', // Đưa price vào services_of_card
            total: '$_id.total',
            service_details: {
              $mergeObjects: ['$service_details', { step_services: '$step_services' }]
            }
          }
        }
      },

      // Group lại services_of_card và tính tổng giá
      {
        $group: {
          _id: '$_id._id',
          branch: { $first: '$branch' },
          code: { $first: '$code' },
          is_active: { $first: '$is_active' },
          name: { $first: '$name' },
          descriptions: { $first: '$descriptions' },
          session_time: { $first: '$session_time' },
          price_paid: { $first: '$price_paid' },
          history_price: { $first: '$history_price' },
          user_id: { $first: '$user_id' },
          service_group: { $first: '$service_group' },
          created_at: { $first: '$created_at' },
          updated_at: { $first: '$updated_at' },
          services_of_card: {
            $push: {
              $cond: [{ $eq: ['$original_services_of_card', []] }, '$$REMOVE', '$services_of_card']
            }
          },
          price: { $sum: '$services_of_card.total' },
          employee: { $first: '$employee' },
          original_services_of_card: { $first: '$original_services_of_card' }
        }
      },

      // Đảm bảo services_of_card là [] nếu rỗng
      {
        $set: {
          services_of_card: {
            $cond: [{ $eq: ['$original_services_of_card', []] }, [], '$services_of_card']
          }
        }
      },

      // Lưu trữ giá trị gốc của employee và lọc phần tử rỗng
      {
        $set: {
          original_employee: '$employee',
          employee: {
            $cond: [
              { $eq: ['$employee', [{}]] },
              [],
              {
                $filter: {
                  input: '$employee',
                  cond: { $ne: ['$$this', {}] }
                }
              }
            ]
          }
        }
      },

      // Unwind employee
      {
        $unwind: {
          path: '$employee',
          preserveNullAndEmptyArrays: true
        }
      },

      // Lookup employee từ users
      {
        $lookup: {
          from: 'users',
          localField: 'employee.id_employee',
          foreignField: '_id',
          as: 'employee.employee_details'
        }
      },
      {
        $set: {
          'employee.employee_details': { $arrayElemAt: ['$employee.employee_details', 0] }
        }
      },

      // Group lại employee
      {
        $group: {
          _id: '$_id',
          branch: { $first: '$branch' },
          code: { $first: '$code' },
          is_active: { $first: '$is_active' },
          name: { $first: '$name' },
          descriptions: { $first: '$descriptions' },
          session_time: { $first: '$session_time' },
          price: { $first: '$price' },
          price_paid: { $first: '$price_paid' },
          history_price: { $first: '$history_price' },
          user_id: { $first: '$user_id' },
          service_group: { $first: '$service_group' },
          created_at: { $first: '$created_at' },
          updated_at: { $first: '$updated_at' },
          services_of_card: { $first: '$services_of_card' },
          employee: {
            $push: {
              $cond: [
                { $or: [{ $eq: ['$original_employee', []] }, { $eq: ['$original_employee', [{}]] }] },
                '$$REMOVE',
                '$employee'
              ]
            }
          },
          original_employee: { $first: '$original_employee' }
        }
      },

      // Đảm bảo employee là [] nếu rỗng
      {
        $set: {
          employee: {
            $cond: [
              { $or: [{ $eq: ['$original_employee', []] }, { $eq: ['$original_employee', [{}]] }] },
              [],
              '$employee'
            ]
          }
        }
      },

      // Xóa các trường tạm thời
      {
        $unset: ['original_services_of_card', 'original_employee']
      },

      // Giới hạn và bỏ qua
      { $skip: skip },
      { $limit: limit },

      // Sort
      { $sort: { _id: -1 } },

      // Project để loại bỏ trường không cần thiết
      {
        $project: {
          'services_of_card.services_id': 0,
          'employee.id_employee': 0,
          'employee.employee_details.password': 0,
          'employee.employee_details.status': 0,
          'employee.employee_details.forgot_password_token': 0,
          'services_of_card.service_details.step_services.employee_details.password': 0,
          'services_of_card.service_details.step_services.employee_details.status': 0,
          'services_of_card.service_details.step_services.employee_details.forgot_password_token': 0
        }
      }
    ]
    const [servicesCard, total] = await Promise.all([
      databaseServiceSale.services_card.aggregate(pipline).toArray(),
      databaseServiceSale.services_card.countDocuments(query)
    ])
    return { servicesCard, total, limit, page }
  }

  async getCommissionOfDate(data: GetCommisionOfDateData) {
    const { start_date, end_date, branch, user_id } = data
    const pipeline = [
      // Lọc thẻ dịch vụ theo khoảng thời gian created_at hoặc date_different_paid
      {
        $match: {
          $or: [
            {
              created_at: {
                $gte: start_date, // Ví dụ: 2025-03-01
                $lte: end_date // Ví dụ: 2025-03-29
              }
            },
            {
              date_different_paid: {
                $elemMatch: {
                  $gte: start_date,
                  $lte: end_date
                }
              }
            }
          ],
          customer_id: { $eq: null },
          ...(branch.length > 0 && {
            branch: { $in: branch }
          }),
          ...(user_id?.toHexString() && {
            $or: [
              { 'employee.id_employee': user_id },
              { services_of_card: { $elemMatch: { services_id: { $exists: true } } } }
            ]
          })
        }
      },

      // Lưu trữ thông tin gốc và tính tổng tiền đã trả
      {
        $set: {
          original_services_of_card: '$services_of_card',
          original_employee: '$employee',
          total_price: '$price', // Giá trị tổng của thẻ
          total_price_paid: {
            $sum: [
              { $ifNull: ['$price_paid', 0] } // Thanh toán trong tháng tạo
            ]
          },
          payment_month: '$created_at', // Mặc định lấy tháng tạo
          date_different_paid: { $ifNull: ['$date_different_paid', []] } // Đảm bảo mảng không bị null
        }
      },

      // Tách dữ liệu thành hai luồng bằng $facet
      {
        $facet: {
          // Luồng 1: Xử lý employee (nhân viên sale)
          employeeData: [
            { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
            ...(user_id?.toHexString() ? [{ $match: { 'employee.id_employee': user_id } }] : []),
            {
              $lookup: {
                from: 'users',
                localField: 'employee.id_employee',
                foreignField: '_id',
                as: 'employee.employee_details'
              }
            },
            {
              $set: {
                'employee.employee_details': { $arrayElemAt: ['$employee.employee_details', 0] }
              }
            },
            { $match: { 'employee.id_employee': { $exists: true } } },
            // Tính hoa hồng cơ bản và hoa hồng từ commission_other_month
            {
              $set: {
                commissionBeforeCoefficient: {
                  $cond: [
                    { $eq: ['$employee.type_price', PriceType.FIXED] }, // Fixed
                    { $min: ['$employee.commission', '$total_price_paid'] }, // Giới hạn bởi total_price_paid
                    {
                      $multiply: [{ $divide: ['$total_price_paid', '$total_price'] }, '$employee.commission']
                    } // Percent: Tỷ lệ dựa trên total_price_paid
                  ]
                },
                commissionOtherMonth: {
                  $filter: {
                    input: { $ifNull: ['$employee.commission_other_month', []] },
                    cond: {
                      $and: [{ $gte: ['$$this.date', start_date] }, { $lte: ['$$this.date', end_date] }]
                    }
                  }
                }
              }
            },
            // Cộng thêm hoa hồng từ commission_other_month
            {
              $set: {
                commissionBeforeCoefficient: {
                  $sum: ['$commissionBeforeCoefficient', { $sum: '$commissionOtherMonth.commission' }]
                }
              }
            },
            {
              $set: {
                commissionAfterCoefficient: {
                  $cond: [
                    { $eq: ['$employee.type_price', PriceType.FIXED] }, // Fixed
                    '$commissionBeforeCoefficient',
                    {
                      $multiply: ['$commissionBeforeCoefficient', '$employee.employee_details.coefficient']
                    } // Percent
                  ]
                }
              }
            },
            {
              $project: {
                id_employee: '$employee.id_employee',
                name: '$employee.employee_details.name',
                coefficient: '$employee.employee_details.coefficient',
                commissionBeforeCoefficient: 1,
                commissionAfterCoefficient: 1,
                serviceCard: {
                  _id: '$_id',
                  code: '$code',
                  name: '$name',
                  created_at: '$created_at',
                  branch: '$branch',
                  total_price: '$total_price',
                  total_price_paid: '$total_price_paid',
                  date_different_paid: '$date_different_paid',
                  commission_other_month: '$employee.commission_other_month'
                }
              }
            }
          ],

          // Luồng 2: Xử lý step_services (nhân viên thực hiện bước dịch vụ)
          stepServicesData: [
            { $unwind: { path: '$services_of_card', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'services',
                localField: 'services_of_card.services_id',
                foreignField: '_id',
                as: 'services_of_card.service_details'
              }
            },
            { $unwind: { path: '$services_of_card.service_details', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$services_of_card.service_details.step_services', preserveNullAndEmptyArrays: true } },
            ...(user_id?.toHexString()
              ? [{ $match: { 'services_of_card.service_details.step_services.id_employee': user_id } }]
              : []),
            {
              $lookup: {
                from: 'users',
                localField: 'services_of_card.service_details.step_services.id_employee',
                foreignField: '_id',
                as: 'services_of_card.service_details.step_services.employee_details'
              }
            },
            {
              $set: {
                'services_of_card.service_details.step_services.employee_details': {
                  $arrayElemAt: ['$services_of_card.service_details.step_services.employee_details', 0]
                }
              }
            },
            { $match: { 'services_of_card.service_details.step_services.id_employee': { $exists: true } } },
            // Tính hoa hồng cơ bản và hoa hồng từ commission_other_month
            {
              $set: {
                commissionBeforeCoefficient: {
                  $cond: [
                    { $eq: ['$services_of_card.service_details.step_services.type_step_price', PriceType.FIXED] }, // Fixed
                    {
                      $min: [
                        {
                          $multiply: [
                            '$services_of_card.service_details.step_services.commission',
                            { $ifNull: ['$services_of_card.quantity', 1] }
                          ]
                        },
                        '$total_price_paid'
                      ]
                    },
                    {
                      $multiply: [
                        { $divide: ['$total_price_paid', '$total_price'] },
                        '$services_of_card.service_details.step_services.commission',
                        { $ifNull: ['$services_of_card.quantity', 1] }
                      ]
                    } // Percent
                  ]
                },
                commissionOtherMonth: {
                  $filter: {
                    input: { $ifNull: ['$services_of_card.service_details.step_services.commission_other_month', []] },
                    cond: {
                      $and: [{ $gte: ['$$this.date', start_date] }, { $lte: ['$$this.date', end_date] }]
                    }
                  }
                }
              }
            },
            // Cộng thêm hoa hồng từ commission_other_month
            {
              $set: {
                commissionBeforeCoefficient: {
                  $sum: ['$commissionBeforeCoefficient', { $sum: '$commissionOtherMonth.commission' }]
                }
              }
            },
            {
              $set: {
                commissionAfterCoefficient: {
                  $cond: [
                    { $eq: ['$services_of_card.service_details.step_services.type_step_price', PriceType.FIXED] }, // Fixed
                    '$commissionBeforeCoefficient',
                    {
                      $multiply: [
                        '$commissionBeforeCoefficient',
                        '$services_of_card.service_details.step_services.employee_details.coefficient'
                      ]
                    } // Percent
                  ]
                }
              }
            },
            {
              $project: {
                id_employee: '$services_of_card.service_details.step_services.id_employee',
                name: '$services_of_card.service_details.step_services.employee_details.name',
                coefficient: '$services_of_card.service_details.step_services.employee_details.coefficient',
                commissionBeforeCoefficient: 1,
                commissionAfterCoefficient: 1,
                serviceCard: {
                  _id: '$_id',
                  code: '$code',
                  name: '$name',
                  created_at: '$created_at',
                  branch: '$branch',
                  total_price: '$total_price',
                  total_price_paid: '$total_price_paid',
                  date_different_paid: '$date_different_paid',
                  commission_other_month: '$services_of_card.service_details.step_services.commission_other_month'
                }
              }
            }
          ]
        }
      },

      // Gộp hai luồng dữ liệu
      {
        $project: {
          allEmployees: { $concatArrays: ['$employeeData', '$stepServicesData'] }
        }
      },
      { $unwind: { path: '$allEmployees', preserveNullAndEmptyArrays: true } },
      { $match: { 'allEmployees.id_employee': { $exists: true } } },

      // Lookup chi tiết branch
      {
        $lookup: {
          from: 'branch',
          localField: 'allEmployees.serviceCard.branch',
          foreignField: '_id',
          as: 'allEmployees.serviceCard.branch_details'
        }
      },
      {
        $set: {
          'allEmployees.serviceCard.branch': '$allEmployees.serviceCard.branch_details'
        }
      },
      { $unset: 'allEmployees.serviceCard.branch_details' },

      // Nhóm theo nhân viên và tính tổng hoa hồng
      {
        $group: {
          _id: '$allEmployees.id_employee',
          name: { $first: '$allEmployees.name' },
          totalCommissionBeforeCoefficient: { $sum: '$allEmployees.commissionBeforeCoefficient' },
          totalCommissionAfterCoefficient: { $sum: '$allEmployees.commissionAfterCoefficient' },
          serviceCards: { $addToSet: '$allEmployees.serviceCard' }
        }
      },

      // Định dạng đầu ra
      {
        $project: {
          _id: 0,
          id_employee: '$_id',
          name: 1,
          commissionBeforeCoefficient: '$totalCommissionBeforeCoefficient',
          commissionAfterCoefficient: '$totalCommissionAfterCoefficient',
          serviceCards: 1
        }
      }
    ]
    const commission = await databaseServiceSale.services_card.aggregate(pipeline).toArray()
    return commission
  }

  async updateServicesCard(data: UpdateServicesCardData) {
    const { _id, ...updateData } = data
    await databaseServiceSale.services_card.updateOne({ _id }, { $set: { ...updateData } })
  }
}

const servicesCardRepository = new ServicesCardRepository()
export default servicesCardRepository
