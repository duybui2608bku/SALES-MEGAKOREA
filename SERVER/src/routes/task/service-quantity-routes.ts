import { Router } from 'express'
import {
  createRequestController,
  getUserRequestsController,
  getRequestHistoryController,
  getAllRequestsController,
  getRequestStatsController,
  approveRequestController,
  rejectRequestController
} from '~/controllers/quantity-request.controller'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
import { UserRole } from '~/constants/enum'
import { checkRole } from '~/middlewares/role.middleware'

const serviceQuantityRouters = Router()

// Applying authentication middleware per-route instead of globally

// Routes cho người dùng
serviceQuantityRouters.post('/request', accessTokenValidator, wrapRequestHandler(createRequestController))

serviceQuantityRouters.post('/user-requests', accessTokenValidator, wrapRequestHandler(getUserRequestsController))
serviceQuantityRouters.get(
  '/request/:requestId/history',
  accessTokenValidator,
  wrapRequestHandler(getRequestHistoryController)
)

// Routes cho admin - yêu cầu quyền admin hoặc manager
const adminRoles = [UserRole.ADMIN, UserRole.MANAGER]
serviceQuantityRouters.post(
  '/admin/requests',
  accessTokenValidator,
  checkRole(adminRoles),
  wrapRequestHandler(getAllRequestsController)
)
serviceQuantityRouters.get(
  '/admin/stats',
  accessTokenValidator,
  checkRole(adminRoles),
  wrapRequestHandler(getRequestStatsController)
)
serviceQuantityRouters.put(
  '/admin/approve/:requestId',
  accessTokenValidator,
  checkRole(adminRoles),
  wrapRequestHandler(approveRequestController)
)
serviceQuantityRouters.put(
  '/admin/reject/:requestId',
  accessTokenValidator,
  checkRole(adminRoles),
  wrapRequestHandler(rejectRequestController)
)

export default serviceQuantityRouters
