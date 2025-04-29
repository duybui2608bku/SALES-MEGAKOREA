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

export const createDateRangeQuery = (dateString: string | null | undefined, fieldName = 'created_at') => {
  if (!dateString) return {}
  // Phân tích ngày đầu vào bằng dayjs
  const date = dayjs(dateString).utc()
  // Tạo ngày bắt đầu (00:00:00) và kết thúc (23:59:59) ở UTC
  const startOfDay = date.startOf('day').toDate()
  const endOfDay = date.endOf('day').toDate()
  // Trả về điều kiện truy vấn MongoDB
  return {
    [fieldName]: {
      $gte: startOfDay,
      $lt: endOfDay
    }
  }
}
