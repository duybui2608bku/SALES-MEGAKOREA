import _ from 'lodash'
import { RoleUser, TypeCommision } from 'src/Constants/enum'

export const generateCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const codeArray = _.times(6, () => _.sample(characters))
  return codeArray.join('')
}

export const encodeURI = (uri: string) => {
  return encodeURIComponent(uri)
}

export const comparePrice = (a: number, b: number) => a - b

export const getTypeCommision = (type: TypeCommision) => {
  switch (type) {
    case TypeCommision.FIXED:
      return 'Cố định'
    case TypeCommision.PRECENT:
      return 'Phần trăm'
    default:
      return 'Cố định'
  }
}

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

export const BranchDataHardCode = [
  {
    _id: '67cc0c70b0c361aee3e7055b',
    name: 'Buôn Ma Thuột',
    acronym: 'BMT'
  },
  {
    _id: '67cc0d4bb0c361aee3e7055c',
    name: 'Quảng Trị',
    acronym: 'QT'
  },
  {
    _id: '67cc0d90b0c361aee3e7055d',
    name: 'Quảng Bình',
    acronym: 'DH'
  },
  {
    _id: '67cc0d9cb0c361aee3e7055e',
    name: 'Đà Nẵng',
    acronym: 'DN'
  },
  {
    _id: '67cc0dafb0c361aee3e7055f',
    name: 'Nha Trang',
    acronym: 'NT'
  },
  {
    _id: '67cc0dc3b0c361aee3e70560',
    name: 'Medicare Nha Trang',
    acronym: 'MDC'
  },
  {
    _id: '67cc0dd6b0c361aee3e70561',
    name: 'Phan Thiết',
    acronym: 'PT'
  },
  {
    _id: '67cc0de7b0c361aee3e70563',
    name: 'Cà Mau',
    acronym: 'CM'
  },
  {
    _id: '67cc0de6b0c361aee3e70562',
    name: 'Cà Mau',
    acronym: 'CM'
  },
  {
    _id: '67cc0e19b0c361aee3e70564',
    name: 'Huế',
    acronym: 'HUE'
  }
]

export const getChangedFields = (original: any, updated: any): Partial<any> => {
  return _.pickBy(updated, (value, key) => {
    return !_.isEqual(value, original[key as keyof any])
  }) as Partial<any>
}

export const dataTestOutstandingStaff = [
  {
    user: {
      avatar: '',
      name: 'Nguyễn Thị Nở'
    },
    count: 484
  },
  {
    user: {
      avatar: '',
      name: 'Đoàn Minh Tâm'
    },
    count: 112
  },
  {
    user: {
      avatar: '',
      name: 'Phan Thanh Tùng'
    },
    count: 191
  },
  {
    user: {
      avatar: '',
      name: 'Đoàn Minh Tâm'
    },
    count: 356
  },
  {
    user: {
      avatar: '',
      name: 'Đoàn Minh Tâm'
    },
    count: 327
  },
  {
    user: {
      avatar: '',
      name: 'Nguyễn Thị Nở'
    },
    count: 267
  },
  {
    user: {
      avatar: '',
      name: 'Nguyễn Tuấn Anh'
    },
    count: 191
  },
  {
    user: {
      avatar: '',
      name: 'Nguyễn Tuấn Anh'
    },
    count: 250
  },
  {
    user: {
      avatar: '',
      name: 'Hoàng Hải Long'
    },
    count: 420
  },
  {
    user: {
      avatar: '',
      name: 'Phan Thanh Tùng'
    },
    count: 223
  }
]
