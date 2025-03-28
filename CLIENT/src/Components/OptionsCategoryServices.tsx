import { Select } from 'antd'
import { useEffect, useState } from 'react'

import useQueryServicesCategory from 'src/hook/query/useQueryServicesCategory'

interface ServicesCategoryOptionsType {
  mode?: 'multiple' | 'tags'
  placeholder?: string
  search: boolean
  onchange?: (value: string) => void
  initialValue?: string
}

const OptionsCategoryServices = (props: ServicesCategoryOptionsType) => {
  const { mode, search, onchange, placeholder, initialValue } = props
  const { categoryServices, isLoading } = useQueryServicesCategory()
  const [selectedValue, setSelectedValue] = useState<string>()

  const categoryServicesOptions = categoryServices?.map((branch, index) => ({
    key: index,
    label: branch.name,
    value: branch._id
  }))

  useEffect(() => {
    setSelectedValue(initialValue)
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
      placeholder={placeholder || 'Chọn danh mục dịch vụ'}
      loading={isLoading}
      options={categoryServicesOptions}
      showSearch={search}
    />
  )
}

export default OptionsCategoryServices
