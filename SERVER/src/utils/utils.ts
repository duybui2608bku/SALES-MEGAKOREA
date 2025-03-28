import _ from 'lodash'
import { ObjectId } from 'mongodb'
import { HttpStatusCode } from '~/constants/enum'
import { ErrorWithStatusCode } from '~/models/Errors'

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

export const generateProductCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const codeArray = _.times(6, () => _.sample(characters))
  return codeArray.join('')
}
