import { QueryClient } from '@tanstack/react-query'

// Định nghĩa type chung cho dữ liệu (có thể tùy chỉnh)

// Hàm dùng chung cho optimistic update
const createOptimisticUpdateHandler = (queryClient: QueryClient, queryKey: string | string[]) => {
  return async () => {
    // Chuẩn hóa queryKey thành mảng
    const normalizedQueryKey = Array.isArray(queryKey) ? queryKey : [queryKey]

    // Hủy các query đang chạy
    await queryClient.cancelQueries({ queryKey: normalizedQueryKey })

    // Lấy dữ liệu cũ từ cache
    const previousData = queryClient.getQueryData(normalizedQueryKey)

    // Cập nhật cache với dữ liệu mới
    // queryClient.setQueryData(normalizedQueryKey, (old: unknown) => {
    //   // Trường hợp 1: Dữ liệu cũ là một mảng trực tiếp (T[])
    //   if (Array.isArray(old)) {
    //     return [...old, updateData]
    //   }

    //   // Trường hợp 3: Dữ liệu cũ không tồn tại hoặc không khớp -> khởi tạo mới
    //   return {
    //     data: [updateData]
    //   }
    // })

    // Trả về dữ liệu cũ để rollback nếu cần
    return { previousData }
  }
}

export default createOptimisticUpdateHandler
