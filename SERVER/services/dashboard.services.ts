import homeDashboardRepository from 'repository/dashboard/HomeDashboard.repository'
import { GetHomeDashboardRequestParams } from '~/models/requestes/Dashborad.requests'

class DashBoardServices {
  async getHomeDashboardAdmin(data: GetHomeDashboardRequestParams) {
    const { date } = data
    const result = await homeDashboardRepository.getHomeDashboardData(date)
    return result
  }
}

const dashboardDashBoardServices = new DashBoardServices()
export default dashboardDashBoardServices
