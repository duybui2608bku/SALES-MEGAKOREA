import { Router } from 'express'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
import { checkRole } from '~/middlewares/role.middleware'
import { UserRole } from '~/constants/enum'
import {
  createRefundRequestController,
  getUserRefundRequestsController,
  getRefundRequestHistoryController,
  getAllRefundRequestsController,
  getRefundRequestStatsController,
  approveRefundRequestController,
  rejectRefundRequestController
} from '~/controllers/refund.controller'

const refundRouters = Router()

refundRouters.use(accessTokenValidator)

// Public refund request routes
refundRouters.post('/request', wrapRequestHandler(createRefundRequestController))
refundRouters.post('/user-requests', wrapRequestHandler(getUserRefundRequestsController))
refundRouters.get('/request/:requestId/history', wrapRequestHandler(getRefundRequestHistoryController))

// Admin refund request routes
const adminRoles = [UserRole.ADMIN, UserRole.MANAGER]

refundRouters.post('/admin/requests', checkRole(adminRoles), wrapRequestHandler(getAllRefundRequestsController))
refundRouters.get('/admin/stats', checkRole(adminRoles), wrapRequestHandler(getRefundRequestStatsController))
refundRouters.put('/admin/approve', checkRole(adminRoles), wrapRequestHandler(approveRefundRequestController))
refundRouters.put('/admin/reject', checkRole(adminRoles), wrapRequestHandler(rejectRefundRequestController))

export default refundRouters
