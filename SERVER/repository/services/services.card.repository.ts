import { ObjectId } from 'mongodb'
import databaseServiceSale from 'services/database.services.sale'
import { HttpStatusCode, TypeCommision } from '~/constants/enum'
import { servicesMessages } from '~/constants/messages'
import {
  CreateServicesCardData,
  CreateServicesCardSoldData,
  CreateServicesCardSoldOfCustomerData,
  GetCommisionOfDateData,
  GetServicesCardData,
  GetServicesCardSoldOfCustomerData,
  UpdateHistoryPaidServicesCardOfCustomerData,
  UpdateServicesCardData,
  UpdateUsedServicesCardSoldOfCustomerData
} from '~/interface/services/services.interface'
import { ErrorWithStatusCode } from '~/models/Errors'
import { UpdateServicesCardSoldOfCustomerData } from '~/models/requestes/Services.card.requests'
import { CardServices } from '~/models/schemas/services/cardServices.schema'
import { CardServicesSold } from '~/models/schemas/services/cardServicesSold.schema'
import { CardServicesSoldOfCustomer } from '~/models/schemas/services/cardServicesSoldOfCustomer.schema'
import HistoryPaidServicesCardSoldOfCustomer from '~/models/schemas/services/HistoryPaidServicesCardSoldOfCustomer.schema'
import { createProjectionField } from '~/utils/utils'

class ServicesCardRepository {
  async createServicesCard(data: CreateServicesCardData) {
    const result = await databaseServiceSale.services_card.insertOne(new CardServices(data))
    // const serviceCardNew = await databaseServiceSale.services_card.findOne({
    //   _id: result.insertedId
    // })
    const projectionEmployeeDetailsFull = createProjectionField('employee.employee_details', [
      'password',
      'status',
      'forgot_password_token',
      'role',
      'coefficient'
    ])

    const projectionServiceDetailsFull = createProjectionField('services_of_card.service_details.step_services', [
      'employee_details.password',
      'employee_details.status',
      'employee_details.forgot_password_token',
      'employee_details.role',
      'employee_details.coefficient'
    ])
    const projectionHistoryPaidFull = createProjectionField('history_paid.user_details', [
      'password',
      'status',
      'forgot_password_token',
      'role',
      'coefficient'
    ])

    const finalProjection = {
      ...projectionEmployeeDetailsFull,
      ...projectionServiceDetailsFull,
      ...projectionHistoryPaidFull
    } as any

    const pipeline = [
      // Bước 1: Lọc dữ liệu theo query
      {
        $match: {
          _id: new ObjectId(result.insertedId)
        }
      },

      // Bước 2: Lookup thông tin branch
      {
        $lookup: {
          from: 'branch',
          localField: 'branch',
          foreignField: '_id',
          as: 'branch'
        }
      },

      // Bước 3: Lookup thông tin service_group và lấy phần tử đầu tiên
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

      // Bước 4: Lưu trữ giá trị gốc của services_of_card
      {
        $set: {
          original_services_of_card: '$services_of_card'
        }
      },

      // Bước 5: Unwind services_of_card để xử lý từng phần tử
      {
        $unwind: {
          path: '$services_of_card',
          preserveNullAndEmptyArrays: true
        }
      },

      // Bước 6: Lookup thông tin chi tiết của services trong services_of_card
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

      // Bước 7: Lấy price từ service_details và tính total cho services_of_card
      {
        $set: {
          'services_of_card.price': { $ifNull: ['$services_of_card.service_details.price', 0] },
          'services_of_card.total': {
            $subtract: [
              {
                $multiply: [{ $ifNull: ['$services_of_card.service_details.price', 0] }, '$services_of_card.quantity']
              },
              { $ifNull: ['$services_of_card.discount', 0] }
            ]
          }
        }
      },

      // Bước 8: Unwind step_services trong service_details
      {
        $unwind: {
          path: '$services_of_card.service_details.step_services',
          preserveNullAndEmptyArrays: true
        }
      },

      // Bước 9: Lookup thông tin employee trong step_services
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

      // Bước 10: Group lại step_services thành mảng trong service_details
      {
        $group: {
          _id: {
            _id: '$_id',
            services_of_card_id: '$services_of_card.services_id',
            quantity: '$services_of_card.quantity',
            discount: '$services_of_card.discount',
            price: '$services_of_card.price',
            total: '$services_of_card.total'
          },
          branch: { $first: '$branch' },
          code: { $first: '$code' },
          is_active: { $first: '$is_active' },
          name: { $first: '$name' },
          descriptions: { $first: '$descriptions' },
          session_time: { $first: '$session_time' },
          price_paid: { $first: '$price_paid' },
          history_paid: { $first: '$history_paid' },
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

      // Bước 11: Gộp lại services_of_card với thông tin đã xử lý
      {
        $set: {
          services_of_card: {
            services_id: '$_id.services_of_card_id',
            quantity: '$_id.quantity',
            discount: '$_id.discount',
            price: '$_id.price',
            total: '$_id.total',
            service_details: {
              $mergeObjects: ['$service_details', { step_services: '$step_services' }]
            }
          }
        }
      },

      // Bước 12: Group lại services_of_card và tính tổng giá
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
          history_paid: { $first: '$history_paid' },
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

      // Bước 13: Đảm bảo services_of_card là mảng rỗng nếu không có dữ liệu
      {
        $set: {
          services_of_card: {
            $cond: [{ $eq: ['$original_services_of_card', []] }, [], '$services_of_card']
          }
        }
      },

      // Bước 14: Xử lý employee trước khi xử lý history_paid để tránh trùng lặp
      {
        $set: {
          original_employee: '$employee'
        }
      },
      {
        $unwind: {
          path: '$employee',
          preserveNullAndEmptyArrays: true
        }
      },
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
      // Group lại employee thành mảng hoàn chỉnh trước khi xử lý history_paid
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
          history_paid: { $first: '$history_paid' },
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

      // Bước 15: Xử lý history_paid sau khi employee đã hoàn tất
      {
        $unwind: {
          path: '$history_paid',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'history_paid.user_id',
          foreignField: '_id',
          as: 'history_paid.user_details'
        }
      },
      {
        $set: {
          'history_paid.user_details': { $arrayElemAt: ['$history_paid.user_details', 0] }
        }
      },
      // Group lại history_paid mà không ảnh hưởng đến employee
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
          history_paid: { $push: '$history_paid' },
          user_id: { $first: '$user_id' },
          service_group: { $first: '$service_group' },
          created_at: { $first: '$created_at' },
          updated_at: { $first: '$updated_at' },
          services_of_card: { $first: '$services_of_card' },
          employee: { $first: '$employee' }
        }
      },

      // Bước 16: Xóa các trường tạm thời
      {
        $unset: ['original_services_of_card', 'original_employee']
      },

      // Bước 17: Phân trang

      // Bước 18: Sắp xếp theo _id giảm dần
      { $sort: { _id: -1 } },

      // Bước 19: Project để loại bỏ các trường không cần thiết
      {
        $project: {
          'services_of_card.services_id': 0,
          ...finalProjection
        }
      }
    ]

    const resultCardDataNew = await databaseServiceSale.services_card.aggregate(pipeline).toArray()
    if (!resultCardDataNew) {
      throw new ErrorWithStatusCode({
        message: servicesMessages.CREATE_FAIL_OR_NOT_FOUND_SERVICE_CARD,
        statusCode: HttpStatusCode.BadRequest
      })
    }
    return resultCardDataNew
  }

  async createServicesCardSold(data: CreateServicesCardSoldData[]) {
    const result = await databaseServiceSale.services_card_sold.insertMany(
      data.map((item) => new CardServicesSold(item))
    )
    console.log(Object.values(result.insertedIds))
    return Object.values(result.insertedIds) as ObjectId[]
  }

  async getAllServicesCard(data: GetServicesCardData) {
    const { page, query, limit } = data
    const skip = (page - 1) * limit

    const projectionEmployeeDetailsFull = createProjectionField('employee.employee_details', [
      'password',
      'status',
      'forgot_password_token',
      'role',
      'coefficient'
    ])

    const projectionServiceDetailsFull = createProjectionField('services_of_card.service_details.step_services', [
      'employee_details.password',
      'employee_details.status',
      'employee_details.forgot_password_token',
      'employee_details.role',
      'employee_details.coefficient'
    ])
    const projectionHistoryPaidFull = createProjectionField('history_paid.user_details', [
      'password',
      'status',
      'forgot_password_token',
      'role',
      'coefficient'
    ])

    const finalProjection = {
      ...projectionEmployeeDetailsFull,
      ...projectionServiceDetailsFull,
      ...projectionHistoryPaidFull
    } as any

    const pipeline = [
      // Bước 1: Lọc dữ liệu theo query
      {
        $match: {
          ...query,
          is_active: true
        }
      },

      // Bước 2: Lookup thông tin branch
      {
        $lookup: {
          from: 'branch',
          localField: 'branch',
          foreignField: '_id',
          as: 'branch'
        }
      },

      // Bước 3: Lookup thông tin service_group và lấy phần tử đầu tiên
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

      // Bước 4: Lưu trữ giá trị gốc của services_of_card
      {
        $set: {
          original_services_of_card: '$services_of_card'
        }
      },

      // Bước 5: Unwind services_of_card để xử lý từng phần tử
      {
        $unwind: {
          path: '$services_of_card',
          preserveNullAndEmptyArrays: true
        }
      },

      // Bước 6: Lookup thông tin chi tiết của services trong services_of_card
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

      // Bước 7: Lấy price từ service_details và tính total cho services_of_card
      {
        $set: {
          'services_of_card.price': { $ifNull: ['$services_of_card.service_details.price', 0] },
          'services_of_card.total': {
            $subtract: [
              {
                $multiply: [{ $ifNull: ['$services_of_card.service_details.price', 0] }, '$services_of_card.quantity']
              },
              { $ifNull: ['$services_of_card.discount', 0] }
            ]
          }
        }
      },

      // Bước 8: Unwind step_services trong service_details
      {
        $unwind: {
          path: '$services_of_card.service_details.step_services',
          preserveNullAndEmptyArrays: true
        }
      },

      // Bước 9: Lookup thông tin employee trong step_services
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

      // Bước 10: Group lại step_services thành mảng trong service_details
      {
        $group: {
          _id: {
            _id: '$_id',
            services_of_card_id: '$services_of_card.services_id',
            quantity: '$services_of_card.quantity',
            discount: '$services_of_card.discount',
            price: '$services_of_card.price',
            total: '$services_of_card.total'
          },
          branch: { $first: '$branch' },
          code: { $first: '$code' },
          is_active: { $first: '$is_active' },
          name: { $first: '$name' },
          descriptions: { $first: '$descriptions' },
          session_time: { $first: '$session_time' },
          price_paid: { $first: '$price_paid' },
          history_paid: { $first: '$history_paid' },
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

      // Bước 11: Gộp lại services_of_card với thông tin đã xử lý
      {
        $set: {
          services_of_card: {
            services_id: '$_id.services_of_card_id',
            quantity: '$_id.quantity',
            discount: '$_id.discount',
            price: '$_id.price',
            total: '$_id.total',
            service_details: {
              $mergeObjects: ['$service_details', { step_services: '$step_services' }]
            }
          }
        }
      },

      // Bước 12: Group lại services_of_card và tính tổng giá
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
          history_paid: { $first: '$history_paid' },
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

      // Bước 13: Đảm bảo services_of_card là mảng rỗng nếu không có dữ liệu
      {
        $set: {
          services_of_card: {
            $cond: [{ $eq: ['$original_services_of_card', []] }, [], '$services_of_card']
          }
        }
      },

      // Bước 14: Xử lý employee trước khi xử lý history_paid để tránh trùng lặp
      {
        $set: {
          original_employee: '$employee'
        }
      },
      {
        $unwind: {
          path: '$employee',
          preserveNullAndEmptyArrays: true
        }
      },
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
      // Group lại employee thành mảng hoàn chỉnh trước khi xử lý history_paid
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
          history_paid: { $first: '$history_paid' },
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

      // Bước 15: Xử lý history_paid sau khi employee đã hoàn tất
      {
        $unwind: {
          path: '$history_paid',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'history_paid.user_id',
          foreignField: '_id',
          as: 'history_paid.user_details'
        }
      },
      {
        $set: {
          'history_paid.user_details': { $arrayElemAt: ['$history_paid.user_details', 0] }
        }
      },
      // Group lại history_paid mà không ảnh hưởng đến employee
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
          history_paid: { $push: '$history_paid' },
          user_id: { $first: '$user_id' },
          service_group: { $first: '$service_group' },
          created_at: { $first: '$created_at' },
          updated_at: { $first: '$updated_at' },
          services_of_card: { $first: '$services_of_card' },
          employee: { $first: '$employee' }
        }
      },

      // Bước 16: Xóa các trường tạm thời
      {
        $unset: ['original_services_of_card', 'original_employee']
      },

      // Bước 17: Phân trang
      { $skip: skip },
      { $limit: limit },

      // Bước 18: Sắp xếp theo _id giảm dần
      { $sort: { _id: -1 } },

      // Bước 19: Project để loại bỏ các trường không cần thiết
      {
        $project: {
          'services_of_card.services_id': 0,
          ...finalProjection
        }
      }
    ]
    const [servicesCard, total] = await Promise.all([
      databaseServiceSale.services_card.aggregate(pipeline).toArray(),
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
                    { $eq: ['$employee.type_price', TypeCommision.FIXED] }, // Fixed
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
                    { $eq: ['$employee.type_price', TypeCommision.FIXED] }, // Fixed
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
                    { $eq: ['$services_of_card.service_details.step_services.type_step_price', TypeCommision.FIXED] }, // Fixed
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
                    { $eq: ['$services_of_card.service_details.step_services.type_step_price', TypeCommision.FIXED] }, // Fixed
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

  async updateHistoryPaidServicesCardOfCustomer(data: UpdateHistoryPaidServicesCardOfCustomerData) {
    const result = await databaseServiceSale.history_paid_services_card_of_customer.insertOne(
      new HistoryPaidServicesCardSoldOfCustomer(data)
    )
    return result.insertedId
  }

  async createServicesCardSoldOfCustomer(data: CreateServicesCardSoldOfCustomerData) {
    await databaseServiceSale.services_card_sold_of_customer.insertOne(new CardServicesSoldOfCustomer(data))
  }

  async getAllServicesCardSoldOfCustomer(data: GetServicesCardSoldOfCustomerData) {
    const { page, query, limit } = data
    const skip = (page - 1) * limit

    const projectionUserDetail = createProjectionField('userInfo', [
      'password',
      'status',
      'forgot_password_token',
      'role',
      'coefficient'
    ])

    const projectCardServicesDetails = createProjectionField('cards', [
      'branch',
      'products',
      'is_active',
      'code',
      'descriptions',
      'user_id',
      'employee'
    ])

    const projectionServices = createProjectionField('cards.services_of_card', [
      'services_id',
      'discount',
      'branch',
      'descriptions',
      'user_id',
      'is_active',
      'code',
      'products',
      'employee',
      'step_services'
    ])

    const servicesCardSold = await databaseServiceSale.services_card_sold_of_customer
      .aggregate([
        {
          $match: {
            ...query
          }
        },
        {
          $lookup: {
            from: 'customers',
            localField: 'customer_id',
            foreignField: '_id',
            as: 'customers'
          }
        },
        // 1. Lookup thông tin chi nhánh
        {
          $lookup: {
            from: 'branch',
            localField: 'branch',
            foreignField: '_id',
            as: 'branch'
          }
        },
        // 2. Lookup thông tin user
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        // 3. Lookup các thẻ dịch vụ đã bán
        {
          $lookup: {
            from: 'services_card_sold',
            localField: 'card_services_sold_id',
            foreignField: '_id',
            as: 'cards'
          }
        },
        // 4. Unwind từng thẻ để xử lý riêng
        {
          $unwind: {
            path: '$cards',
            preserveNullAndEmptyArrays: true
          }
        },
        // 5. Lookup chi tiết tất cả services trong mỗi card
        {
          $lookup: {
            from: 'services',
            localField: 'cards.services_of_card.services_id',
            foreignField: '_id',
            as: 'serviceDetails'
          }
        },
        // 6. Nhúng serviceDetails + tính lineTotal vào mỗi phần tử services_of_card
        {
          $addFields: {
            'cards.services_of_card': {
              $map: {
                input: '$cards.services_of_card',
                as: 'so',
                in: {
                  $let: {
                    vars: {
                      detail: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$serviceDetails',
                              as: 'sd',
                              cond: { $eq: ['$$sd._id', '$$so.services_id'] }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: {
                      $mergeObjects: [
                        '$$so',
                        '$$detail',
                        {
                          lineTotal: {
                            $subtract: [
                              { $multiply: ['$$detail.price', '$$so.quantity'] },
                              { $ifNull: ['$$so.discount', 0] }
                            ]
                          }
                        }
                      ]
                    }
                  }
                }
              }
            }
          }
        },
        // 7. Lookup services_category cho mỗi dịch vụ sau khi đã có chi tiết
        {
          $lookup: {
            from: 'services_category',
            let: {
              serviceIds: {
                $reduce: {
                  input: '$cards.services_of_card',
                  initialValue: [],
                  in: {
                    $concatArrays: ['$$value', ['$$this.service_group_id']]
                  }
                }
              }
            },
            pipeline: [{ $match: { $expr: { $in: ['$_id', '$$serviceIds'] } } }],
            as: 'serviceCategories'
          }
        },
        // 8. Thêm thông tin category vào mỗi dịch vụ
        {
          $addFields: {
            'cards.services_of_card': {
              $map: {
                input: '$cards.services_of_card',
                as: 'so',
                in: {
                  $mergeObjects: [
                    '$$so',
                    {
                      category: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$serviceCategories',
                              as: 'sc',
                              cond: { $eq: ['$$sc._id', '$$so.service_group_id'] }
                            }
                          },
                          0
                        ]
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        // 9. Group lại, giữ nguyên toàn bộ document gốc và gom mảng cards
        {
          $group: {
            _id: '$_id',
            root: { $first: '$$ROOT' },
            cards: { $push: '$cards' }
          }
        },
        // 10. Merge root với cards array, thay document mới
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: ['$root', { cards: '$cards' }]
            }
          }
        },
        {
          $addFields: {
            userInfo: { $arrayElemAt: ['$userInfo', 0] }
          }
        },
        {
          $addFields: {
            customers: { $arrayElemAt: ['$customers', 0] }
          }
        },
        // 11. Tính totalPrice là tổng tất cả lineTotal của mọi services trong mọi card
        {
          $addFields: {
            price: {
              $sum: {
                $map: {
                  input: '$cards',
                  as: 'c',
                  in: {
                    $sum: {
                      $map: {
                        input: '$$c.services_of_card',
                        as: 's',
                        in: '$$s.lineTotal'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        // 12. Project trường đầu ra
        {
          $project: {
            user_id: 0,
            serviceDetails: 0,
            serviceCategories: 0,
            customer_id: 0,
            ...projectionUserDetail,
            ...projectCardServicesDetails,
            ...projectionServices
          }
        }
      ])
      .skip(skip)
      .limit(limit)
      .toArray()
    const total = await databaseServiceSale.services_card_sold_of_customer.countDocuments(query)
    return { servicesCardSold, total, limit, page }
  }

  async updateServicesCardSoldOfCustomer(data: UpdateServicesCardSoldOfCustomerData) {
    const { _id, card_services_sold_id, employee_commision_id, history_paid_id, history_used } = data

    // Tạo payload update một cách có điều kiện
    const pushData: Record<string, any> = {}

    if (card_services_sold_id != null && Array.isArray(card_services_sold_id) && card_services_sold_id.length > 0) {
      pushData.card_services_sold_id = { $each: card_services_sold_id }
    }

    if (history_paid_id != null) {
      pushData.history_paid = history_paid_id
    }

    if (history_used != null) {
      pushData.history_used = history_used
    }

    if (employee_commision_id != null && Array.isArray(employee_commision_id) && employee_commision_id.length > 0) {
      pushData.employee_commision = { $each: employee_commision_id }
    }

    // Chỉ gọi update nếu có gì đó để push
    if (Object.keys(pushData).length > 0) {
      const result = await databaseServiceSale.services_card_sold_of_customer.updateOne(
        { _id },
        {
          $push: pushData
        }
      )
      return result
    }
  }

  async deleteHistoryPaidOfServicesCardSoldOfCustomer(id: ObjectId) {
    await databaseServiceSale.history_paid_services_card_of_customer.updateOne(
      {
        _id: id
      },
      {
        $set: {
          is_deleted: true
        }
      }
    )
  }

  async deleteServicesCard(id: ObjectId) {
    await databaseServiceSale.services_card.deleteOne({
      _id: id
    })
  }

  async updateUsedServicesCardSold(data: UpdateUsedServicesCardSoldOfCustomerData) {
    const { commision_of_technician_id, history_used, services_card_sold_id, services_id } = data
    // Kiểm tra quantity trước khi update
    const cardSold = await databaseServiceSale.services_card_sold.findOne(
      {
        _id: services_card_sold_id,
        'services_of_card.services_id': services_id
      },
      {
        projection: {
          'services_of_card.$': 1
        }
      }
    )

    // Kiểm tra xem có tìm thấy card và service không
    if (!cardSold || !cardSold.services_of_card || cardSold.services_of_card.length === 0) {
      throw new Error('Không tìm thấy dịch vụ trong thẻ dịch vụ')
    }

    // Lấy thông tin service cần update
    const service = cardSold.services_of_card[0]

    // Kiểm tra quantity
    if (service.quantity <= 0) {
      throw new ErrorWithStatusCode({
        message: servicesMessages.SERVICE_CARD_QUANTITY_NOT_ENOUGH,
        statusCode: HttpStatusCode.BadRequest
      })
    }

    // Nếu quantity > 0 thì mới thực hiện update
    await Promise.all([
      databaseServiceSale.services_card_sold.updateOne(
        {
          _id: services_card_sold_id
        },
        {
          $inc: {
            'services_of_card.$[elem].quantity': -1,
            'services_of_card.$[elem].used': 1
          },
          $set: {
            updated_at: new Date()
          }
        },
        {
          arrayFilters: [{ 'elem.services_id': services_id }]
        }
      ),
      databaseServiceSale.services_card_sold_of_customer.updateOne(
        {
          _id: services_card_sold_id
        },
        {
          $push: {
            history_used: history_used,
            employee_commision: commision_of_technician_id
          }
        }
      )
    ])
  }
}

const servicesCardRepository = new ServicesCardRepository()
export default servicesCardRepository
