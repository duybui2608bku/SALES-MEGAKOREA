import dayjs from 'dayjs'
import _ from 'lodash'
import { ObjectId } from 'mongodb'
import { HttpStatusCode } from '~/constants/enum'
import { ErrorWithStatusCode } from '~/models/Errors'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)

export const toObjectId = (id: string | ObjectId): ObjectId => {
  if (_.isString(id) && ObjectId.isValid(id)) {
    return new ObjectId(id)
  }
  if (id instanceof ObjectId) {
    return id
  }
  throw new ErrorWithStatusCode({
    message: 'Invalid ObjectId',
    statusCode: HttpStatusCode.BadRequest
  })
}

export const generateCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const codeArray = _.times(6, () => _.sample(characters))
  return codeArray.join('')
}

export const createProjectionField = (fieldPath: string, fieldsToOmit: string[]): Record<string, number> => {
  const projection: Record<string, number> = {}
  fieldsToOmit.forEach((field) => {
    projection[`${fieldPath}.${field}`] = 0
  })
  return projection
}

export const getObjectOrNul = (value: object | undefined) => {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : null
}

export const removeNullOutOfObject = (obj: Record<string, any>) => {
  return _.omitBy(obj, _.isNull)
}

export const createDateRangeQuery = (dateInput: string | null | undefined, fieldName = 'created_at') => {
  // Nếu không có dữ liệu đầu vào, trả về đối tượng rỗng
  if (!dateInput) return {}

  // Kiểm tra xem đầu vào có chứa dấu '-' không (định dạng khoảng thời gian)
  if (dateInput.includes('&')) {
    // Tách chuỗi thành startDate và endDate bằng dấu '-'
    const [startDateStr, endDateStr] = dateInput.split('&').map((str) => str.trim())

    // Phân tích các chuỗi ngày thành đối tượng dayjs
    const startDate = dayjs(startDateStr).utc()
    const endDate = dayjs(endDateStr).utc()

    // Kiểm tra tính hợp lệ của ngày
    if (startDate.isValid() && endDate.isValid()) {
      return {
        [fieldName]: {
          $gte: startDate.toDate(),
          $lt: endDate.toDate()
        }
      }
    }
  }

  // Trường hợp chỉ có một ngày đơn lẻ hoặc định dạng khoảng thời gian không hợp lệ
  const date = dayjs(dateInput).utc()

  // Nếu ngày hợp lệ, tạo khoảng thời gian cho một ngày
  if (date.isValid()) {
    const startOfDay = date.startOf('day').toDate()
    const endOfDay = date.endOf('day').toDate()

    return {
      [fieldName]: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    }
  }

  // Trả về đối tượng rỗng nếu không thể phân tích ngày
  return {}
}
