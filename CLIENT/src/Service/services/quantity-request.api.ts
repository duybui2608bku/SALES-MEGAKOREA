import { AxiosInstance } from 'axios'
import {
  ICreateQuantityRequestPayload,
  IQuantityRequest,
  IQuantityRequestHistory,
  IUpdateQuantityRequestStatusPayload
} from 'src/Interfaces/services/quantity-request.interfaces'

export class QuantityRequestAPI {
  private httpClient: AxiosInstance
  private apiEndpoint: string

  constructor(httpClient: AxiosInstance) {
    this.httpClient = httpClient
    this.apiEndpoint = '/services-quantity'
  }

  // User endpoints

  public async createRequest(payload: ICreateQuantityRequestPayload): Promise<IQuantityRequest> {
    const response = await this.httpClient.post(`${this.apiEndpoint}/request`, payload)
    return response.data
  }

  public async getUserRequests(body?: any) {
    const response = await this.httpClient.post(`${this.apiEndpoint}/user-requests`, body)
    return response.data
  }

  public async getUserRequestHistory(requestId: string): Promise<IQuantityRequestHistory[]> {
    const response = await this.httpClient.get(`${this.apiEndpoint}/request/${requestId}/history`)
    return response.data
  }

  // Admin endpoints

  public async getAllRequests() {
    const response = await this.httpClient.post(`${this.apiEndpoint}/admin/requests`)
    return response.data
  }

  public async approveRequest(
    requestId: string,
    payload: IUpdateQuantityRequestStatusPayload
  ): Promise<IQuantityRequest> {
    const response = await this.httpClient.put(`${this.apiEndpoint}/admin/approve/${requestId}`, payload)
    return response.data
  }

  public async rejectRequest(
    requestId: string,
    payload: IUpdateQuantityRequestStatusPayload
  ): Promise<IQuantityRequest> {
    const response = await this.httpClient.put(`${this.apiEndpoint}/admin/reject/${requestId}`, payload)
    return response.data
  }

  public async getRequestStats(): Promise<{
    total: number
    pending: number
    approved: number
    rejected: number
  }> {
    const response = await this.httpClient.get(`${this.apiEndpoint}/admin/stats`)
    return response.data
  }
}