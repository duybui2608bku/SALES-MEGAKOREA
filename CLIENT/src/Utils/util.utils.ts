import _ from 'lodash'
import { RoleUser } from 'src/Constants/enum'

export const generateCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const codeArray = _.times(6, () => _.sample(characters))
  return codeArray.join('')
}

export const encodeURI = (uri: string) => {
  return encodeURIComponent(uri)
}

export const comparePrice = (a: number, b: number) => a - b

export const getRoleUser = (role: RoleUser) => {
  switch (role) {
    case RoleUser.ADMIN:
      return 'Admin'
    case RoleUser.MANAGER:
      return 'Quản lý'
    case RoleUser.ACCOUNTANT:
      return 'Kế toán'
    case RoleUser.SALE:
      return 'Nhân viên Sale'
    case RoleUser.TECHNICIAN:
      return 'Kỹ thuật viên'
    case RoleUser.TECHNICAN_MASTER:
      return 'Kỹ thuật viên trưởng'
    case RoleUser.USER:
      return 'Khách hàng'
    default:
      return 'Khách hàng'
  }
}

export const isAdminValidator = (role: RoleUser) => {
  return role === RoleUser.ADMIN
}
