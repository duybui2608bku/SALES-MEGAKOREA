import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import quantityRequestServices from 'services/quantity-request.services'
import { servicesMessages } from '~/constants/messages'
import {
  ApproveQuantityRequestBody,
  CreateQuantityRequestBody,
  GetAllQuantityAdminRequestBody,
  GetAllQuantityRequestBody,
  RejectQuantityRequestBody
} from '~/models/requestes/Services.requests'
import { TokenPayload } from '~/models/requestes/User.requests'
import { ResponseSuccess } from '~/utils/handlers'

/**
 * Tạo yêu cầu tăng số lần dịch vụ mới
 */

export const createRequestController = async (
  req: Request<ParamsDictionary, any, CreateQuantityRequestBody>,
  res: Response
) => {
  const data = req.body
  const { user_id } = req.decode_authorization as TokenPayload

  const request = await quantityRequestServices.createRequest({
    ...data,
    userId: user_id
  })

  return ResponseSuccess({
    res,
    message: servicesMessages.CREATE_REQUEST_SUCCESS,
    result: request
  })
}

/**
 * Lấy tất cả yêu cầu của người dùng hiện tại
 */
export const getUserRequestsController = async (
  req: Request<ParamsDictionary, any, GetAllQuantityRequestBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const data = req.body
  const requests = await quantityRequestServices.getUserRequests({
    ...data,
    user_id
  })

  return ResponseSuccess({
    res,
    message: servicesMessages.GET_USER_REQUESTS_SUCCESS,
    result: requests
  })
}

/**
 * Lấy lịch sử của một yêu cầu
 */
export const getRequestHistoryController = async (req: Request, res: Response) => {
  const { requestId } = req.params

  if (!req.user || !req.user._id) {
    return res.status(401).json({
      message: 'Người dùng chưa đăng nhập'
    })
  }

  const userId = req.user._id.toString()
  const userRole = req.user.role as number

  const history = await quantityRequestServices.getRequestHistory(requestId, userId, userRole)

  return ResponseSuccess({
    res,
    message: 'Lấy lịch sử yêu cầu thành công',
    result: history
  })
}

/**
 * Lấy tất cả yêu cầu cho admin
 */
export const getAllRequestsController = async (
  req: Request<ParamsDictionary, any, GetAllQuantityAdminRequestBody>,
  res: Response
) => {
  const data = req.body
  const requests = await quantityRequestServices.getAllRequests(data)

  return ResponseSuccess({
    res,
    message: servicesMessages.GET_ALL_REQUESTS_ADMIN_SUCCESS,
    result: requests
  })
}

/**
 * Phê duyệt yêu cầu
 */
export const approveRequestController = async (
  req: Request<ParamsDictionary, any, ApproveQuantityRequestBody>,
  res: Response
) => {
  const { requestId, note } = req.body
  const { user_id } = req.decode_authorization as TokenPayload

  const updatedRequest = await quantityRequestServices.approveRequest({
    requestId,
    note,
    userId: user_id
  })

  return ResponseSuccess({
    res,
    message: servicesMessages.APPROVE_REQUEST_SUCCESS,
    result: updatedRequest
  })
}

/**
 * Từ chối yêu cầu
 */
export const rejectRequestController = async (
  req: Request<ParamsDictionary, any, RejectQuantityRequestBody>,
  res: Response
) => {
  const { requestId, note } = req.body
  const { user_id } = req.decode_authorization as TokenPayload

  const updatedRequest = await quantityRequestServices.rejectRequest({
    requestId,
    note,
    userId: user_id
  })

  return ResponseSuccess({
    res,
    message: servicesMessages.REJECT_REQUEST_SUCCESS,
    result: updatedRequest
  })
}

/**
 * Lấy thống kê yêu cầu
 */
export const getRequestStatsController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const stats = await quantityRequestServices.getRequestStats()
  return ResponseSuccess({
    res,
    message: servicesMessages.GET_REQUEST_STATS_SUCCESS,
    result: stats
  })
}
