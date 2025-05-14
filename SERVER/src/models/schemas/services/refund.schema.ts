import { ObjectId } from 'mongodb'
import { RefundEnum } from '~/constants/enum'
import { RefundType } from '~/interface/services/services.interface'

export enum RefundRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface IRefundRequestData {
  _id?: ObjectId
  user_id: ObjectId
  services_card_sold_of_customer_id: ObjectId
  current_price: number
  requested_price: number
  refund_type: RefundEnum
  branch?: string
  reason?: string
  status: RefundRequestStatus
  admin_note?: string
  created_at?: Date
  updated_at?: Date
}

export class RefundRequest {
  _id?: ObjectId
  user_id: ObjectId
  services_card_sold_of_customer_id: ObjectId
  current_price: number
  requested_price: number
  refund_type: RefundEnum
  reason: string
  branch: string
  status: RefundRequestStatus
  admin_note?: string
  created_at: Date
  updated_at: Date
  constructor(data: IRefundRequestData) {
    this._id = data._id || new ObjectId()
    this.user_id = data.user_id
    this.current_price = data.current_price
    this.requested_price = data.requested_price
    this.services_card_sold_of_customer_id = data.services_card_sold_of_customer_id
    this.refund_type = data.refund_type
    this.reason = data.reason || ''
    this.branch = data.branch || ''
    this.status = data.status || RefundRequestStatus.PENDING
    this.admin_note = data.admin_note
    this.created_at = data.created_at || new Date()
    this.updated_at = data.updated_at || new Date()
  }
}

export interface IRefundRequestHistoryData {
  _id?: ObjectId
  request_id: ObjectId
  action: 'created' | 'approved' | 'rejected'
  performed_by: ObjectId
  note?: string
  created_at?: Date
}

export class RefundRequestHistory {
  _id?: ObjectId
  request_id: ObjectId
  action: 'created' | 'approved' | 'rejected'
  performed_by: ObjectId
  note?: string
  created_at: Date

  constructor(data: IRefundRequestHistoryData) {
    this._id = data._id || new ObjectId()
    this.request_id = data.request_id
    this.action = data.action
    this.performed_by = data.performed_by
    this.note = data.note
    this.created_at = data.created_at || new Date()
  }
}
