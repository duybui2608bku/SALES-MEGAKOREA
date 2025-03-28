import { Select } from 'antd'
import { useEffect, useState } from 'react'
import useQueryServices from 'src/hook/query/useQueryServicesCard'

interface ServicesOptionsType {
  mode?: 'multiple' | 'tags'
  placeholder?: string
  search: boolean
  onchange?: (value: string) => void
  initialValue?: string
}

const OptionsServices = (props: ServicesOptionsType) => {
  const { mode, search, onchange, placeholder, initialValue } = props
  const { services, isLoading } = useQueryServices()
  const [selectedValue, setSelectedValue] = useState<string>()

  const servicesOptions = services?.map((service, index) => ({
    key: index,
    label: `${service.name} - ${service.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`,
    value: [service._id, service.price].join('-')
  }))

  useEffect(() => {
    return setSelectedValue(initialValue)
  }, [initialValue])

  const handleChange = (value: string) => {
    setSelectedValue(value)
    onchange?.(value)
  }

  return (
    <Select
      onChange={handleChange}
      value={selectedValue}
      style={{ width: '100%' }}
      mode={mode || undefined}
      allowClear
      placeholder={placeholder || 'Chọn dịch vụ'}
      loading={isLoading}
      options={servicesOptions}
      showSearch={search}
    />
  )
}

export default OptionsServices
