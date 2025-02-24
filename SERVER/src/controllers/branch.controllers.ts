import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { AddAccountRequestBody } from '~/models/requestes/Account.requests'
import branchServices from '../../services/branch.services'
import { HttpStatusCode } from '~/constants/enum'

export const addBranchController = async (
  req: Request<ParamsDictionary, any, AddAccountRequestBody>,
  res: Response
) => {
  const { name } = req.body
  const result = await branchServices.addBranch({ name })
  return res.status(HttpStatusCode.Ok).json({
    success: true,
    message: result.message
  })
}

export const getAllBranchController = async (req: Request, res: Response) => {
  const result = await branchServices.getAllBranch()
  return res.status(HttpStatusCode.Ok).json({
    success: true,
    result
  })
}
