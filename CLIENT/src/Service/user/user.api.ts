import { GetUserResponse, GetUsersWithRoleResponse } from 'src/Types/user/user.type'
import axiosInstanceMain, { axiosJson } from '../axious.api'
import { pathApiUsers } from 'src/Constants/path'
import { GetAllUserRequestQuery } from 'src/Interfaces/user.interface'

const userApi = {
  getUsersWithRole: async (role: number) => {
    return axiosInstanceMain.get<GetUsersWithRoleResponse>(`${pathApiUsers.getAllUsersWithRole}?role=${role}`)
  },

  async getUsers(query: GetAllUserRequestQuery) {
    return await axiosJson.get<GetUserResponse>(`/users?_page=${query.page}&_limit=${query.limit}`)
  }
}

export default userApi
