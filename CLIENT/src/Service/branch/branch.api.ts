import { pathApiBranch } from 'src/Constants/path'
import axiosInstanceMain from '../axious.api'
import { GellAllBranchResponse } from 'src/Types/branch/branch.type'

const branchApi = {
  getAllBranch: () => {
    return axiosInstanceMain.get<GellAllBranchResponse>(`${pathApiBranch.getAllBranch}`)
  }
}

export default branchApi
