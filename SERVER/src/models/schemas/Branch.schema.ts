import { ObjectId } from 'mongodb'

interface BranchType {
  _id?: ObjectId
  name: string
  user_id?: ObjectId[]
  created_at?: Date
  updated_at?: Date
}

export default class Bracnh {
  _id?: ObjectId
  name: string
  user_id?: ObjectId[]
  created_at: Date
  updated_at: Date
  constructor(branch: BranchType) {
    this._id = branch._id || new ObjectId()
    this.name = branch.name || ''
    this.user_id = branch.user_id || []
    this.created_at = branch.created_at || new Date()
    this.updated_at = branch.updated_at || new Date()
  }
}
