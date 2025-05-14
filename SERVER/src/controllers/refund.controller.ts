import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import refundServices from 'services/refund.services'
import { servicesMessages } from '~/constants/messages'
import {
  CreateRefundRequestBody,
  GetAllRefundRequestBody,
  GetAllRefundAdminRequestBody,
  ApproveRefundRequestBody,
  RejectRefundRequestBody
} from '~/models/requestes/refund.requests'
import { TokenPayload } from '~/models/requestes/User.requests'
import { ResponseSuccess } from '~/utils/handlers'
import { RefundEnum } from '~/constants/enum'

export const createRefundRequestController = async (
  req: Request<ParamsDictionary, any, CreateRefundRequestBody>,
  res: Response
) => {
  const data = req.body
  const { user_id } = req.decode_authorization as TokenPayload

  const request = await refundServices.createRequest({
    ...data,
    userId: user_id
  })

  return ResponseSuccess({
    res,
    message: servicesMessages.CREATE_REFUND_REQUEST_SUCCESS,
    result: request
  })
}

export const getUserRefundRequestsController = async (
  req: Request<ParamsDictionary, any, GetAllRefundRequestBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const data = req.body
  const requests = await refundServices.getUserRequests({
    ...data,
    user_id
  })

  return ResponseSuccess({
    res,
    message: servicesMessages.GET_USER_REFUND_REQUESTS_SUCCESS,
    result: requests
  })
}

export const getRefundRequestHistoryController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { requestId } = req.params

  if (!req.user || !req.user._id) {
    return res.status(401).json({
      message: 'Người dùng chưa đăng nhập'
    })
  }

  const userId = req.user._id.toString()
  const userRole = req.user.role as number

  const history = await refundServices.getRequestHistory(requestId, userId, userRole)

  return ResponseSuccess({
    res,
    message: servicesMessages.GET_REFUND_REQUEST_HISTORY_SUCCESS,
    result: history
  })
}

export const getAllRefundRequestsController = async (
  req: Request<ParamsDictionary, any, GetAllRefundAdminRequestBody>,
  res: Response
) => {
  const data = req.body

  const requests = await refundServices.getAllRequests(data)

  return ResponseSuccess({
    res,
    message: servicesMessages.GET_ALL_REFUND_REQUESTS_ADMIN_SUCCESS,
    result: requests
  })
}

export const getRefundRequestStatsController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const stats = await refundServices.getRequestStats()

  return ResponseSuccess({
    res,
    message: servicesMessages.GET_REFUND_REQUEST_STATS_SUCCESS,
    result: stats
  })
}

export const approveRefundRequestController = async (
  req: Request<ParamsDictionary, any, ApproveRefundRequestBody>,
  res: Response
) => {
  const { request_id, note } = req.body
  const { user_id } = req.decode_authorization as TokenPayload

  const updatedRequest = await refundServices.approveRequest({
    request_id,
    note,
    userId: user_id
  })

  return ResponseSuccess({
    res,
    message: servicesMessages.APPROVE_REFUND_REQUEST_SUCCESS,
    result: updatedRequest
  })
}

export const rejectRefundRequestController = async (
  req: Request<ParamsDictionary, any, RejectRefundRequestBody>,
  res: Response
) => {
  const { request_id, note } = req.body
  const { user_id } = req.decode_authorization as TokenPayload

  const updatedRequest = await refundServices.rejectRequest({
    request_id,
    note,
    userId: user_id
  })

  return ResponseSuccess({
    res,
    message: servicesMessages.REJECT_REFUND_REQUEST_SUCCESS,
    result: updatedRequest
  })
}
