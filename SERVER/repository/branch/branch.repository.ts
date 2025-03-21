import { AddBranchRequestBody } from '../../src/models/requestes/Branch.requests'
import Bracnh from '../../src/models/schemas/branch/branch.schema'
import databaseServiceSale from '../../services/database.services.sale'

class BranchRepository {
  async addBranch(branch: AddBranchRequestBody) {
    await databaseServiceSale.branch.insertOne(new Bracnh(branch))
  }
  async getAllBranch() {
    return await databaseServiceSale.branch.find().toArray()
  }
}

const branchRepository = new BranchRepository()

export default branchRepository
