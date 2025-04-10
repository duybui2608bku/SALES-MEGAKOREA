import React, { useEffect, useState } from 'react'
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
const SelectSearchCustomers: React.FC<{ placeholder?: string; style?: React.CSSProperties }> = ({
  placeholder = 'Nhập số điện thoại để tìm kiếm',
  style
}) => {
  const [searchPhone, setSearchPhone] = useState<string>('') // Giá trị tìm kiếm hiện tại
  const [customers, setCustomers] = useState<Customer[]>([]) // Danh sách khách hàng tìm được

  // Sử dụng React Query để gọi API
  const { data, isLoading } = useQuery({
    queryKey: ['searchCustomer', searchPhone], // Key duy nhất cho query, thay đổi khi searchPhone thay đổi
    queryFn: () => customerApi.searchCustomer(searchPhone), // Gọi API
    enabled: !!searchPhone, // Chỉ gọi API khi searchPhone không rỗng
    select: (response) => response.data, // Lấy data từ SuccessResponse
    staleTime: 5 * 60 * 1000 // Dữ liệu "tươi" trong 5 phút
  })

  // Xử lý khi người dùng nhập vào ô tìm kiếm
  const handleSearch = (value: string) => {
    setSearchPhone(value) // Cập nhật giá trị tìm kiếm
  }

  // Xử lý khi người dùng chọn một gợi ý
  const handleChange = (value: string) => {
    setSearchPhone(value) // Cập nhật giá trị đã chọn
  }

  useEffect(() => {
    if (data) {
      setCustomers(data.result) // Cập nhật danh sách khách hàng khi có dữ liệu từ API
    }
  }, [data])

  // Chuyển đổi dữ liệu khách hàng thành options cho Select
  const options: SelectProps['options'] = customers.map((customer: Customer) => ({
    value: customer._id, // Giá trị là _id của khách hàng
    label: `${customer.name} - ${customer.phone}` // Hiển thị tên và số điện thoại
  }))

  return (
    <Select
      showSearch
      value={searchPhone}
      placeholder={placeholder}
      style={style}
      defaultActiveFirstOption={false}
      filterOption={false} // Tắt lọc mặc định của Select, dùng API để lọc
      onSearch={handleSearch}
      onChange={handleChange}
      loading={isLoading} // Hiển thị loading khi đang fetch dữ liệu
      options={options}

      // notFoundContent={searchPhone && !isLoading && options.length === 0 ? 'Không tìm thấy khách hàng' : null}
    />
  )
}

export default SelectSearchCustomers
