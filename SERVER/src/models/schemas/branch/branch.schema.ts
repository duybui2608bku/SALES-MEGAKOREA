import { ObjectId } from 'mongodb'
import { BranchType } from '~/interface/branch/branch.interface'

export default class Branch {
  _id?: ObjectId
  name: string
  acronym: string
  constructor(branch: BranchType) {
    this._id = new ObjectId(branch._id) || new ObjectId()
    this.name = branch.name
    this.acronym = branch.acronym
  }
}
