import { Router } from 'express'
import {
  addUserToBranchController,
  changePasswordController,
  deleteUserController,
  deleteUserFromBranchController,
  getAllUsersController,
  getMeController,
  getUserWithRole,
  loginController,
  registerController,
  resetPasswordController,
  updateUserController
} from '~/controllers/users.controllers'
import {
  loginValidator,
  accessTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator,
  changePasswordValidator,
  isAdminValidator
  // addUserToBranchValidator,
  // deleteUserFormBranchValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const userRouters = Router()

/*
Description: Register a new user
path: /register
method: POST
Body:{name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601}
*/

userRouters.post('/register', registerValidator, wrapRequestHandler(registerController))

/*
Description: User login
path: /login
method: POST
Body:{email: string, password: string}
*/
userRouters.post('/login', loginValidator, wrapRequestHandler(loginController))

/*
Description: Reset password
path: /reset-password
method: POST
Body:{forgot_password_token: string, password: string, confirm_password: string}
*/
userRouters.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

/*
Description: Change password
path: /change-password
method: POST
Body:{old_password:string,password: string, confirm_password: string}
*/

userRouters.post(
  '/change-password',
  accessTokenValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

/*
Description: Update user profile
path: /me
method: Patch
Header:{Authorization: Bearer <access_token>}
Body:UserSchema
*/
userRouters.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))

/*
Description: Update user profile
path: /update
method: PATCH
*/

userRouters.patch('/update', accessTokenValidator, updateMeValidator, wrapRequestHandler(updateUserController))

/*
Description: Add user to a branch
path: /add-to-branch
method: POST
Header:{Authorization: Bearer <access_token>}
Body:{branch_id: string,user_id: string[]}
*/

userRouters.post(
  '/add-to-branch',
  accessTokenValidator,
  // addUserToBranchValidator,
  wrapRequestHandler(addUserToBranchController)
)

/*
Description: Delete user from a branch
path: /delete-from-branch
method: POST
Header:{Authorization: Bearer <access_token>}
Body:{branch_id: string,user_id: string[]}
*/

userRouters.post(
  '/delete-from-branch',
  accessTokenValidator,
  // deleteUserFormBranchValidator,
  wrapRequestHandler(deleteUserFromBranchController)
)

/*
Description: Get all users
path: /all
method: GET
Header:{Authorization: Bearer <access_token>}
*/

userRouters.get('/all', accessTokenValidator, wrapRequestHandler(getAllUsersController))

/*
Description: Get me
path: /me
method: GET
Header:{Authorization: Bearer <access_token>}
*/

userRouters.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))

/*
Description: Get user with role
path: /user-with-role
method: GET
Header:{Authorization: Bearer <access_token>}
*/
userRouters.get('/with-role', accessTokenValidator, wrapRequestHandler(getUserWithRole))

/*
Description: Delete user
path: /:id
method: DELETE
Header:{Authorization: Bearer <access_token>}
*/

userRouters.delete('/:id', accessTokenValidator, isAdminValidator, wrapRequestHandler(deleteUserController))

export default userRouters
