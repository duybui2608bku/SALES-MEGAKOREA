import React, { CSSProperties, useEffect, useState } from 'react'
import { Select } from 'antd'
import { useQuery } from '@tanstack/react-query'
import type { SelectProps } from 'antd'
import { customerApi } from 'src/Service/customers/customer.api'

// Interface giả định cho Customer
interface Customer {
  _id: string
  name: string
  phone: string
}

// Component SearchCustomer
const SelectSearchCustomers: React.FC<{
  placeholder?: string
  style?: CSSProperties
  clear?: boolean
  onHandleChange?: (value: Customer) => void
}> = ({ placeholder = 'Nhập số điện thoại để tìm kiếm', style, clear = true, onHandleChange }) => {
  const [searchPhone, setSearchPhone] = useState<string>('') // Giá trị tìm kiếm hiện tại
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null) // Khách hàng được chọn
  const [customers, setCustomers] = useState<Customer[]>([]) // Danh sách khách hàng tìm được

  // Sử dụng React Query để gọi API
  const { data, isLoading } = useQuery({
    queryKey: ['searchCustomer', searchPhone], // Key duy nhất cho query
    queryFn: () => customerApi.searchCustomer(searchPhone), // Gọi API
    enabled: !!searchPhone, // Chỉ gọi API khi searchPhone không rỗng
    select: (response) => response.data, // Lấy data từ SuccessResponse
    staleTime: 5 * 60 * 1000 // Dữ liệu "tươi" trong 5 phút
  })

  // Xử lý khi người dùng nhập vào ô tìm kiếm
  const handleSearch = (value: string) => {
    setSearchPhone(value) // Cập nhật giá trị tìm kiếm
    if (!value) {
      setSelectedCustomer(null) // Xóa khách hàng được chọn khi xóa ô tìm kiếm
    }
  }

  // Xử lý khi người dùng chọn một gợi ý
  const handleChange = (value: string) => {
    if (value) {
      const customer = JSON.parse(value) as Customer
      setSelectedCustomer(customer) // Cập nhật khách hàng được chọn
      setSearchPhone(customer.phone) // Cập nhật ô tìm kiếm với số điện thoại
      onHandleChange?.(customer) // Gọi hàm callback
    }
  }

  // Xử lý khi xóa lựa chọn
  const handleClear = () => {
    setSearchPhone('')
    setSelectedCustomer(null)
  }

  useEffect(() => {
    if (data) {
      setCustomers(data.result) // Cập nhật danh sách khách hàng
    }
  }, [data])

  // Chuyển đổi dữ liệu khách hàng thành options cho Select
  const options: SelectProps['options'] = customers.map((customer: Customer) => ({
    value: JSON.stringify(customer), // Giá trị là chuỗi JSON của customer
    label: `${customer.name} - ${customer.phone}` // Hiển thị tên và số điện thoại
  }))

  return (
    <Select
      showSearch
      value={selectedCustomer ? JSON.stringify(selectedCustomer) : searchPhone} // Sử dụng selectedCustomer nếu có
      placeholder={placeholder}
      style={style}
      allowClear={clear}
      defaultActiveFirstOption={false}
      filterOption={false} // Tắt lọc mặc định của Select
      onSearch={handleSearch}
      onChange={handleChange}
      onClear={handleClear} // Xử lý khi xóa
      loading={isLoading}
      options={options}
      notFoundContent={searchPhone && !isLoading && options.length === 0 ? 'Không tìm thấy khách hàng' : null}
    />
  )
}

export default SelectSearchCustomers
