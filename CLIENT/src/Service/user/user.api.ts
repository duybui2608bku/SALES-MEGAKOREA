import {
  CreateUserResponse,
  DeleteUserResponse,
  GetUserResponse,
  GetUsersResponse,
  GetUsersWithRoleResponse,
  SearchUserResponse,
  UploadAvatarResponse
} from 'src/Types/user/user.type'
import axiosInstanceMain, { axiosJson, axiosUploadAvatar } from '../axious.api'
import { pathApiUploadAvatarUser, pathApiUsers } from 'src/Constants/path'
import {
  CreateUserRequestBody,
  SearchUserRequestQuery,
  UpdateUserRequestBody
} from 'src/Interfaces/user/user.interface'

const userApi = {
  getUsersWithRole: async (role: number) => {
    return axiosInstanceMain.get<GetUsersWithRoleResponse>(`${pathApiUsers.getAllUsersWithRole}?role=${role}`)
  },

  getUser() {
    return axiosInstanceMain.get<GetUserResponse>(`${pathApiUsers.getUser}`)
  },

  getUsers() {
    return axiosInstanceMain.get<GetUsersResponse>(pathApiUsers.getAllUser)
  },

  createUser(user: CreateUserRequestBody) {
    return axiosInstanceMain.post<CreateUserResponse>(pathApiUsers.createUser, user)
  },

  updateUser(user: UpdateUserRequestBody) {
    return axiosInstanceMain.patch<CreateUserResponse>(pathApiUsers.updateUser, user)
  },

  uploadAvatarUser(imageData: FormData) {
    return axiosUploadAvatar.post<UploadAvatarResponse>(pathApiUploadAvatarUser.uploadAvatar, imageData)
  },

  searchUser(query: SearchUserRequestQuery) {
    return axiosJson.get<SearchUserResponse>(`/users?name=${query.result}`)
  },

  deleteUserById(id: string) {
    return axiosInstanceMain.delete<DeleteUserResponse>(`${pathApiUsers.deleteUserById}/${id}`)
  }
}

export default userApi
