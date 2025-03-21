export interface User {
  _id: string
  name: string
  email: string
  avatar: string
  role: number
  status: number
  branch: string[]
  created_at: Date
  updated_at: Date
}
