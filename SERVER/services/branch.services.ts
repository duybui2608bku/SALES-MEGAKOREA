import Bracnh from '~/models/schemas/Branch.schema'
import { AddBranchRequestBody } from '../src/models/requestes/Branch.requests'
import databaseService from './database.services'

class BranchServices {
  async addBranch({ name }: AddBranchRequestBody) {
    await databaseService.branch.insertOne(new Bracnh({ name }))
    return { message: 'Branch added successfully' }
  }
  async getAllBranch() {
    return await databaseService.branch.find({}).toArray()
  }
}

const branchServices = new BranchServices()

export default branchServices
