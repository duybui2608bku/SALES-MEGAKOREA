import { GetUsersWithRoleResponse } from 'src/Types/user/user.type'
import axiosInstanceMain from '../axious.api'
import { pathApiUsers } from 'src/Constants/path'

const userApi = {
  getUsersWithRole: async (role: number) => {
    return axiosInstanceMain.get<GetUsersWithRoleResponse>(`${pathApiUsers.getAllUsersWithRole}?role=${role}`)
  }
}

export default userApi
