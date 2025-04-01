import { ObjectId } from 'mongodb'
import {
  CreateServicesCategoryData,
  CreateServicesData,
  UpdateServicesData
} from '../../src/interface/services/services.interface'
import { Services, ServicesCategory } from '../../src/models/schemas/services/Services.schema'
import {
  GetAllServicesCategoryRequestQuery,
  GetAllServicesRequestData,
  UpdateServicesCategoryRequestBody
} from '~/models/requestes/Services.requests'
import databaseServiceSale from 'services/database.services.sale'

class ServicesRepository {
  //Category Services
  private convertBranchToObjectId(branch?: string[]) {
    return branch?.map((b) => new ObjectId(b)) || []
  }

  async createServicesCategory(servicesCategoryData: CreateServicesCategoryData) {
    const branch_id = this.convertBranchToObjectId(servicesCategoryData.branch)
    await databaseServiceSale.services_category.insertOne(
      new ServicesCategory({
        ...servicesCategoryData,
        branch: branch_id
      })
    )
  }

  async getAllServicesCategory(data: GetAllServicesCategoryRequestQuery) {
    const { page, limit } = data
    const skip = (page - 1) * limit
    const [categoryServices, total] = await Promise.all([
      databaseServiceSale.services_category.find().sort({ _id: -1 }).skip(skip).limit(limit).toArray(),
      databaseServiceSale.services_category.countDocuments()
    ])
    return { categoryServices, limit, page, total }
  }

  async deleteServicesCategory(id: ObjectId) {
    await databaseServiceSale.services_category.deleteOne({
      _id: id
    })
  }
  async updateServicesCategory(data: UpdateServicesCategoryRequestBody) {
    const { _id, branch, ...body } = data
    const branchObjectId = this.convertBranchToObjectId(branch)
    await databaseServiceSale.services_category.updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          ...body,
          branch: branchObjectId
        }
      }
    )
  }
  //End Category Services

  //Services

  async createServices(servicesData: CreateServicesData) {
    await databaseServiceSale.services.insertOne(new Services(servicesData))
  }

  async deleteServices(id: ObjectId) {
    await databaseServiceSale.services.deleteOne({
      _id: id
    })
  }

  async updateServices(data: UpdateServicesData) {
    const { _id, branch, ...body } = data
    await databaseServiceSale.services.updateOne(
      { _id: _id },
      {
        $set: {
          ...body
        }
      }
    )
  }

  async getAllServices(data: GetAllServicesRequestData) {
    const { page, limit, branch } = data
    const skip = (page - 1) * limit

    // Tạo match stage cho query
    const matchStage: any = {}
    if (branch && branch.length > 0) {
      matchStage.branch = {
        $in: branch.map((id) => new ObjectId(id)) // Chuyển đổi branch thành ObjectId[]
      }
    }

    // Pipeline aggregation
    const pipeline = [
      { $match: matchStage },
      // Lookup branch
      {
        $lookup: {
          from: 'branch',
          localField: 'branch',
          foreignField: '_id',
          as: 'branch'
        }
      },
      // Thêm bước lưu trữ giá trị gốc của step_services để kiểm tra sau
      {
        $set: {
          original_step_services: '$step_services' // Lưu mảng step_services gốc
        }
      },
      // Unwind step_services
      {
        $unwind: {
          path: '$step_services',
          preserveNullAndEmptyArrays: true
        }
      },
      // Lookup employee cho step_services
      {
        $lookup: {
          from: 'users',
          localField: 'step_services.id_employee',
          foreignField: '_id',
          as: 'step_services.employee_details'
        }
      },
      {
        $set: {
          'step_services.employee_details': { $arrayElemAt: ['$step_services.employee_details', 0] }
        }
      },
      // Group lại, kiểm tra mảng gốc để trả về [] nếu rỗng
      {
        $group: {
          _id: '$_id',
          branch: { $first: '$branch' },
          code: { $first: '$code' },
          is_active: { $first: '$is_active' },
          name: { $first: '$name' },
          descriptions: { $first: '$descriptions' },
          price: { $first: '$price' },
          service_group_id: { $first: '$service_group_id' },
          step_services: {
            $push: {
              $cond: [
                { $eq: ['$original_step_services', []] }, // Nếu mảng gốc là []
                '$$REMOVE', // Không thêm gì vào mảng
                '$step_services' // Nếu không, thêm step_services đã lookup
              ]
            }
          },
          products: { $first: '$products' },
          created_at: { $first: '$created_at' },
          updated_at: { $first: '$updated_at' },
          original_step_services: { $first: '$original_step_services' } // Giữ lại để dùng sau nếu cần
        }
      },
      // Nếu step_services là [], đảm bảo nó được gán lại thành []
      {
        $set: {
          step_services: {
            $cond: [{ $eq: ['$original_step_services', []] }, [], '$step_services']
          }
        }
      },
      // Xóa trường tạm thời
      {
        $unset: 'original_step_services'
      },
      // Lookup products
      {
        $unwind: {
          path: '$products',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'products.product_id',
          foreignField: '_id',
          as: 'products.product'
        }
      },
      {
        $set: {
          'products.product': { $arrayElemAt: ['$products.product', 0] }
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
      // Group lại products
      {
        $group: {
          _id: '$_id',
          branch: { $first: '$branch' },
          code: { $first: '$code' },
          is_active: { $first: '$is_active' },
          name: { $first: '$name' },
          descriptions: { $first: '$descriptions' },
          price: { $first: '$price' },
          service_group: { $first: '$service_group' },
          step_services: { $first: '$step_services' },
          products: {
            $push: {
              $cond: [{ $eq: ['$products', {}] }, '$$REMOVE', '$products']
            }
          },
          created_at: { $first: '$created_at' },
          updated_at: { $first: '$updated_at' }
        }
      },
      // Sort và phân trang
      { $sort: { _id: -1 } },
      { $skip: skip },
      { $limit: limit },
      // Project để loại bỏ trường không cần thiết
      {
        $project: {
          'step_services.id_employee': 0,
          'step_services.employee_details.password': 0,
          'step_services.employee_details.role': 0,
          'step_services.employee_details.status': 0,
          'step_services.employee_details.forgot_password_token': 0,
          'products.product_id': 0
        }
      }
    ]

    // Thực hiện aggregation và đếm tổng số document
    const [services, totalResult] = await Promise.all([
      databaseServiceSale.services.aggregate(pipeline).toArray(),
      databaseServiceSale.services.aggregate([{ $match: matchStage }, { $count: 'total' }]).toArray()
    ])

    const total = totalResult.length > 0 ? totalResult[0].total : 0

    return { services, limit, page, total }
  }
}

const serverRepository = new ServicesRepository()
export default serverRepository
