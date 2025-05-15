import { createProjectionField } from './utils'

export const projectionUser = createProjectionField('user', [
  'password',
  'forgot_password_token',
  'role',
  'status',
  'branch'
])
