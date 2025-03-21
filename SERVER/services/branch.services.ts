import { AddBranchRequestBody } from '../src/models/requestes/Branch.requests'
import branchRepository from '../repository/branch/branch.repository'

class BranchServices {
  async addBranch(branch: AddBranchRequestBody) {
    await branchRepository.addBranch(branch)
  }
  async getAllBranch() {
    return await branchRepository.getAllBranch()
  }
}

const branchServices = new BranchServices()

export default branchServices
