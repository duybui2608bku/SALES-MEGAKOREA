import { QueryClient } from '@tanstack/react-query'

// Định nghĩa type chung cho dữ liệu sản phẩm (có thể tùy chỉnh theo nhu cầu)
interface ProductData {
  _id: string
  [key: string]: unknown // Cho phép các thuộc tính khác
}

// Hàm dùng chung cho optimistic update
const createOptimisticUpdateHandler = <T extends ProductData>(
  queryClient: QueryClient,
  queryKey: string | string[],
  updateData: T
) => {
  return async () => {
    // Chuẩn hóa queryKey thành mảng
    const normalizedQueryKey = Array.isArray(queryKey) ? queryKey : [queryKey]

    // Hủy các query đang chạy
    await queryClient.cancelQueries({ queryKey: normalizedQueryKey })

    // Lấy dữ liệu cũ từ cache
    const previousData = queryClient.getQueryData(normalizedQueryKey)

    // Cập nhật cache với dữ liệu mới
    queryClient.setQueryData(normalizedQueryKey, (old: { products: T[] } | undefined) => ({
      ...old,
      products: old?.products?.map((item: T) => (item._id === updateData._id ? { ...item, ...updateData } : item)) || []
    }))

    // Trả về dữ liệu cũ để rollback nếu cần
    return { previousData }
  }
}

export default createOptimisticUpdateHandler
