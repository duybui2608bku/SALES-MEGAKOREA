import { ObjectId } from 'mongodb'
import {
  CreateServicesCategoryData,
  CreateServicesData,
  CreateServicesStepData,
  GetAllServicesStepData,
  UpdateServicesData
} from '../../src/interface/services/services.interface'
import { Services, ServicesCategory } from '../../src/models/schemas/services/Services.schema'
import {
  GetAllServicesCategoryRequestData,
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

  async getAllServicesCategory(data: GetAllServicesCategoryRequestData) {
    const { page, limit, query } = data
    const skip = (page - 1) * limit

    // Aggregation pipeline
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'branch',
          localField: 'branch',
          foreignField: '_id',
          as: 'branch_details'
        }
      },
      { $sort: { _id: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]
    const [categoryServices, totalArr] = await Promise.all([
      databaseServiceSale.services_category.aggregate(pipeline).toArray(),
      databaseServiceSale.services_category.aggregate([{ $match: query }, { $count: 'total' }]).toArray()
    ])
    const total = totalArr.length > 0 ? totalArr[0].total : 0
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
    const { _id, branch, step_services, ...body } = data

    // Transform step_services to ObjectIds if provided
    let stepServicesObjectIds
    if (step_services) {
      stepServicesObjectIds = step_services.map((id) => {
        return typeof id === 'string' ? new ObjectId(id) : id
      })
    }

    await databaseServiceSale.services.updateOne(
      { _id: _id },
      {
        $set: {
          ...body,
          step_services: stepServicesObjectIds
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
      // Lookup step_services collection
      {
        $lookup: {
          from: 'services_step',
          localField: 'step_services',
          foreignField: '_id',
          as: 'step_services_details'
        }
      },
      // Thêm bước lưu trữ giá trị gốc của step_services để kiểm tra sau
      {
        $set: {
          original_step_services: '$step_services_details' // Lưu mảng step_services_details gốc
        }
      },
      // Unwind step_services_details
      {
        $unwind: {
          path: '$step_services_details',
          preserveNullAndEmptyArrays: true
        }
      },
      // Lookup employee cho step_services
      {
        $lookup: {
          from: 'users',
          localField: 'step_services_details.id_employee',
          foreignField: '_id',
          as: 'step_services_details.employee_details'
        }
      },
      {
        $set: {
          'step_services_details.employee_details': { $arrayElemAt: ['$step_services_details.employee_details', 0] }
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
          step_services: { $first: '$step_services' }, // Keep original IDs
          step_services_details: {
            $push: {
              $cond: [
                { $eq: ['$original_step_services', []] }, // Nếu mảng gốc là []
                '$$REMOVE', // Không thêm gì vào mảng
                '$step_services_details' // Nếu không, thêm step_services_details đã lookup
              ]
            }
          },
          products: { $first: '$products' },
          created_at: { $first: '$created_at' },
          updated_at: { $first: '$updated_at' },
          original_step_services: { $first: '$original_step_services' } // Giữ lại để dùng sau nếu cần
        }
      },
      // Nếu step_services_details là [], đảm bảo nó được gán lại thành []
      {
        $set: {
          step_services_details: {
            $cond: [{ $eq: ['$original_step_services', []] }, [], '$step_services_details']
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
          step_services: { $first: '$step_services' }, // Keep original IDs
          step_services_details: { $first: '$step_services_details' }, // Include detailed step services
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
          'step_services_details.employee_details.password': 0,
          'step_services_details.employee_details.role': 0,
          'step_services_details.employee_details.status': 0,
          'step_services_details.employee_details.forgot_password_token': 0,
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

    // Transform services to ensure step_services_details has the correct structure
    const transformedServices = services.map((service) => {
      if (service.step_services_details && Array.isArray(service.step_services_details)) {
        service.step_services_details = service.step_services_details.map((step) => ({
          ...step,
          _id: step._id.toString(),
          services_category_id: step.services_category_id ? step.services_category_id.toString() : null
        }))
      }
      return service
    })

    return { services: transformedServices, limit, page, total }
  }

  async createStepServices(data: CreateServicesStepData) {
    await databaseServiceSale.step_services.insertOne(data)
  }

  async getStepServices(data: GetAllServicesStepData) {
    const { page, limit, query } = data
    const skip = (page - 1) * limit

    const pipeline = [
      {
        $match: query
      },
      {
        $lookup: {
          from: 'services_category',
          localField: 'services_category_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $addFields: {
          category: { $arrayElemAt: ['$category', 0] }
        }
      },
      {
        $lookup: {
          from: 'branch',
          localField: 'branch',
          foreignField: '_id',
          as: 'branch_details'
        }
      }
    ]

    const [result, totalResult] = await Promise.all([
      databaseServiceSale.step_services
        .aggregate([...pipeline])
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      databaseServiceSale.step_services.aggregate([{ $match: query }, { $count: 'total' }]).toArray()
    ])

    const total = totalResult.length > 0 ? totalResult[0].total : 0

    return { result, total, page, limit }
  }

  async updateStepService(id: ObjectId, data: any) {
    const result = await databaseServiceSale.step_services.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          ...data,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )
    return result
  }

  async deleteStepService(id: ObjectId) {
    await databaseServiceSale.step_services.deleteOne({
      _id: id
    })
  }
}

const serverRepository = new ServicesRepository()
export default serverRepository
