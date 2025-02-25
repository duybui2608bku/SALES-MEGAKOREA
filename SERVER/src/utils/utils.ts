import _ from 'lodash'
import { ObjectId } from 'mongodb'

export const toObjectId = (id?: string | ObjectId | null): ObjectId | null => {
  if (_.isNil(id) || (_.isString(id) && _.isEmpty(id))) {
    return null
  }
  if (_.isString(id) && ObjectId.isValid(id)) {
    return new ObjectId(id)
  }
  if (id instanceof ObjectId) {
    return id
  }
  return null
}
