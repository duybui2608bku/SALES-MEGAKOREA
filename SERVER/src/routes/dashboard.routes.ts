import { Router } from 'express'
import { getHomeDashboardAdmin } from '~/controllers/dashboard.controllers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const DashboardRouter = Router()

DashboardRouter.get('/admin', accessTokenValidator, wrapRequestHandler(getHomeDashboardAdmin))

export default DashboardRouter
