export enum RoleUser {
  ADMIN = 1,
  ACCOUNTANT = 2,
  MANAGER = 3,
  SALE = 4,
  TECHNICIAN = 5,
  TECHNICAN_MASTER = 6,
  USER = 7
}

export enum ProductType {
  CONSUMABLE = 0,
  NON_CONSUMABLE = 1
}

export enum TypeCommision {
  PRECENT = 1,
  FIXED = 2
}

export enum UserStatus {
  ACTIVE = 1,
  INACTIVE = 2,
  BANNED = 3
}

export enum Branch {
  BMT = 'Buôn Ma Thuột'
}

export enum GetServicesCardSoldOfCustomerSearchType {
  NAME_CUSTOMER = 1,
  PHONE__CUSTOMER = 2
}

export enum RefundEnum {
  NONE = 0,
  PARTIAL_FULL_TREATMENT = 1,
  PARTIAL_HALF_REATMENT = 2,
  FULL = 3
}

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}
