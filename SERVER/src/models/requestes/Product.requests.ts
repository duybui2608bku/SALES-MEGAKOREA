export interface CreateConsumablesRequestBody {
  branch?: string[]
  code: string
  price?: number
  label?: string
  category?: string
  type?: string
  name?: string
  unit?: string
  inStock?: number
}
