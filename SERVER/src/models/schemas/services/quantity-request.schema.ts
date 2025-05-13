import { ObjectId } from 'mongodb'

export enum QuantityRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface IQuantityRequestData {
  _id?: ObjectId
  userId: ObjectId
  serviceId: ObjectId
  servicesCardSoldId: ObjectId
  currentQuantity: number
  requestedQuantity: number
  branch?: string
  reason?: string
  media: string[]
  status: QuantityRequestStatus
  adminNote?: string
  createdAt?: Date
  updatedAt?: Date
}

export class QuantityRequest {
  _id?: ObjectId
  userId: ObjectId
  serviceId: ObjectId
  currentQuantity: number
  requestedQuantity: number
  reason: string
  media?: string[]
  branch: string
  servicesCardSoldId: ObjectId
  status: QuantityRequestStatus
  adminNote?: string
  createdAt: Date
  updatedAt: Date

  constructor(data: IQuantityRequestData) {
    this._id = data._id || new ObjectId()
    this.userId = data.userId
    this.serviceId = data.serviceId
    this.currentQuantity = data.currentQuantity
    this.requestedQuantity = data.requestedQuantity
    this.servicesCardSoldId = data.servicesCardSoldId
    this.reason = data.reason || ''
    this.branch = data.branch || ''
    this.media = data.media || []
    this.status = data.status || QuantityRequestStatus.PENDING
    this.adminNote = data.adminNote
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }
}

export interface IQuantityRequestHistoryData {
  _id?: ObjectId
  requestId: ObjectId
  action: 'created' | 'approved' | 'rejected'
  performedBy: ObjectId
  note?: string
  createdAt?: Date
}

export class QuantityRequestHistory {
  _id?: ObjectId
  requestId: ObjectId
  action: 'created' | 'approved' | 'rejected'
  performedBy: ObjectId
  note?: string
  createdAt: Date

  constructor(data: IQuantityRequestHistoryData) {
    this._id = data._id || new ObjectId()
    this.requestId = data.requestId
    this.action = data.action
    this.performedBy = data.performedBy
    this.note = data.note
    this.createdAt = data.createdAt || new Date()
  }
}
