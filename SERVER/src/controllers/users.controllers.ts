import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import usersService from '../../services/users.services'
import {
  AddUsertoBranchRequestBody,
  changePasswordRequestBody,
  DeleteUserParams,
  GetAllUserRequestBody,
  GetAllUserRequestBodyTest,
  GetAllUserWithRoleRequestParams,
  getProfileRequestBody,
  LoginRequestBody,
  RegisterRequestBody,
  resetPasswordRequestBody,
  TokenPayload,
  UpdateUserRequestBody
} from '~/models/requestes/User.requests'
import { HttpStatusCode, UserRole } from '~/constants/enum'
import { userMessages } from '~/constants/messages'
import { ObjectId } from 'mongodb'
import { ResponseSuccess } from '~/utils/handlers'

export const loginController = async (req: Request<ParamsDictionary, any, LoginRequestBody>, res: Response) => {
  const { user } = req
  const user_id = user?._id as ObjectId
  const role = user?.role
  const result = await usersService.login(user_id.toHexString(), role as UserRole)
  res.status(HttpStatusCode.Ok).json({
    success: true,
    message: userMessages.LOGIN_SUCCESS,
    result: result
  })
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await usersService.register(req.body)
  return res.status(HttpStatusCode.Ok).json({
    success: true,
    message: userMessages.REGISTER_SUCCESS,
    result: result
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, resetPasswordRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  const result = await usersService.resetPassword(user_id, password)
  return res.status(HttpStatusCode.Ok).json({
    success: true,
    message: result.message
  })
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, changePasswordRequestBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { password, old_password } = req.body
  const result = await usersService.changePassword(user_id, old_password)
  if (password === old_password) {
    return res.status(HttpStatusCode.BadRequest).json({
      success: false,
      message: userMessages.NEW_PASSWORD_MUST_BE_DIFFERENT
    })
  }
  return res.status(HttpStatusCode.Ok).json({
    success: true,
    message: result.message
  })
}

export const getMeController = async (req: Request<ParamsDictionary, any, getProfileRequestBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await usersService.getProfile(user_id)
  return res.status(HttpStatusCode.Ok).json({
    success: true,
    message: result.message,
    result: result.user
  })
}

export const getUserWithRole = async (
  req: Request<ParamsDictionary, any, any, GetAllUserWithRoleRequestParams>,
  res: Response
) => {
  const { role } = req.query
  const result = await usersService.getUserWithRole(role)
  ResponseSuccess({
    message: userMessages.GET_ALL_USERS_SUCCESS,
    res,
    result
  })
  // return res.status(HttpStatusCode.Ok).json({
  //   success: true,
  //   message: result.message,
  //   result: result.user
  // })
}

export const updateUserController = async (
  req: Request<ParamsDictionary, any, UpdateUserRequestBody>,
  res: Response
) => {
  const user = await usersService.updateUser(req.body)
  return res.status(HttpStatusCode.Ok).json({
    success: true,
    message: userMessages.UPDATE_USER_SUCCESS,
    result: user
  })
}

export const addUserToBranchController = async (
  req: Request<ParamsDictionary, any, AddUsertoBranchRequestBody>,
  res: Response
) => {
  const { branch_id, user_id } = req.body
  await usersService.addUserToBranch({ user_id, branch_id })
  return res.status(HttpStatusCode.Ok).json({
    success: true,
    message: userMessages.ADD_USER_TO_BRANCH_SUCCESS
  })
}

export const deleteUserFromBranchController = async (
  req: Request<ParamsDictionary, any, AddUsertoBranchRequestBody>,
  res: Response
) => {
  const { branch_id, user_id } = req.body
  await usersService.deleteUserFromBranch({ user_id, branch_id })
  return res.status(HttpStatusCode.Ok).json({
    success: true,
    message: userMessages.DELETE_USER_FROM_BRANCH_SUCCESS
  })
}

export const getAllUsersController = async (
  req: Request<ParamsDictionary, any, GetAllUserRequestBody>,
  res: Response
) => {
  const data = req.body
  const users = await usersService.getAllUsers(data)
  return res.status(HttpStatusCode.Ok).json({
    success: true,
    message: userMessages.GET_ALL_USERS_SUCCESS,
    result: users
  })
}

// Test
export const getAllUsersControllerTest = async (
  req: Request<ParamsDictionary, any, GetAllUserRequestBodyTest>,
  res: Response
) => {
  const data = req.body
  const users = await usersService.getAllUsersTest(data)
  return res.status(HttpStatusCode.Ok).json({
    success: true,
    message: userMessages.GET_ALL_USERS_SUCCESS,
    result: users
  })
}

export const deleteUserById = async (req: Request<ParamsDictionary, any, GetAllUserRequestBody>, res: Response) => {
  const { id } = req.params
  await usersService.deleteUser(id)
  ResponseSuccess({
    message: userMessages.DELETE_BY_ID_SUCCESS,
    res
  })
}
