import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import branchServices from '../../services/branch.services'
import { AddBranchRequestBody } from '~/models/requestes/Branch.requests'
import { branchMessages } from '~/constants/messages'
import { ResponseSuccess } from '~/utils/handlers'

export const addBranchController = async (req: Request<ParamsDictionary, any, AddBranchRequestBody>, res: Response) => {
  const branch = req.body
  await branchServices.addBranch(branch)
  return ResponseSuccess({
    res,
    message: branchMessages.CREATE_BRANCH_SUCCESS
  })
}

export const getAllBranchController = async (req: Request, res: Response) => {
  const result = await branchServices.getAllBranch()
  return ResponseSuccess({
    res,
    message: branchMessages.GET_ALL_BRANCH_SUCCESS,
    result
  })
}
