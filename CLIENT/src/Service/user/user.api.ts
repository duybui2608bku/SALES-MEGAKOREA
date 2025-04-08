import {
  CreateUserResponse,
  DeleteUserResponse,
  GetUserResponse,
  GetUsersWithRoleResponse,
  SearchUserResponse
} from 'src/Types/user/user.type'
import axiosInstanceMain, { axiosJson } from '../axious.api'
import { pathApiUsers } from 'src/Constants/path'
import {
  CreateUserRequestBody,
  GetAllUserRequestQuery,
  SearchUserRequestQuery,
  UpdateUserBody
} from 'src/Interfaces/user.interface'

const userApi = {
  getUsersWithRole: async (role: number) => {
    return axiosInstanceMain.get<GetUsersWithRoleResponse>(`${pathApiUsers.getAllUsersWithRole}?role=${role}`)
  },

  // async getUsers(query: GetAllUserRequestQuery) {
  //   return await axiosInstanceMain.get<GetUserResponse>(pathApiUsers.getAllUser, { params: query })
  // },

  async getUsers(query: GetAllUserRequestQuery) {
    return await axiosJson.get<GetUserResponse>(`/users`, { params: query })
  },

  // updateUser(user: UpdateUserBody) {
  //   return axiosInstanceMain.patch<CreateUserRespone>(pathApiUsers.updateUser, user)
  // }

  createUser(user: CreateUserRequestBody) {
    return axiosJson.post<CreateUserResponse>(`/users`, user)
  },

  updateUser(user: UpdateUserBody) {
    return axiosJson.patch<CreateUserResponse>(`/users/${user.id}`, user)
  },

  searchUser(query: SearchUserRequestQuery) {
    return axiosJson.get<SearchUserResponse>(`/users?name=${query.result}&branch=${query.branch}`)
  },

  deleteUser(id: string) {
    return axiosJson.delete<DeleteUserResponse>(`/users/${id}`)
  }
}

export default userApi
