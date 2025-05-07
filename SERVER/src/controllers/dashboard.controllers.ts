import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import dashboardDashBoardServices from 'services/dashboard.services'
import { dashboardMessages } from '~/constants/messages'
import { GetHomeDashboardRequestParams } from '~/models/requestes/Dashborad.requests'

import { ResponseSuccess } from '~/utils/handlers'

export const getHomeDashboardAdmin = async (
  req: Request<ParamsDictionary, GetHomeDashboardRequestParams, any, any>,
  res: Response
) => {
  const data = req.params
  const result = await dashboardDashBoardServices.getHomeDashboardAdmin(data)
  return ResponseSuccess({
    res,
    message: dashboardMessages.GET_DASHBOARD_SUCCESS,
    result
  })
}
