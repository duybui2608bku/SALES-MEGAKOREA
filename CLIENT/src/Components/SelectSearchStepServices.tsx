import { Select, SelectProps } from 'antd'
import { useState } from 'react'
import { StepServices } from 'src/Utils/options.utils'

interface StepServicesInterface {
  _id: string
  name: string
  commision: number
}

interface SelectSearchStepServicesProps {
  placeholder?: string
  clear?: boolean
  onHandleChange?: (value: StepServicesInterface | null) => void
}

const SelectSearchStepServices = (props: SelectSearchStepServicesProps) => {
  const { placeholder = 'Nhập bước dịch vụ để tìm kiếm', onHandleChange, clear = true } = props
  const [searchValue, setSearchValue] = useState<string>('')
  const [selectedStepService, setSelectedStepService] = useState<StepServicesInterface | null>(null)
  const [stepServices, setStepServices] = useState<StepServicesInterface[]>([])

  // Xử lý khi người dùng nhập vào ô tìm kiếm
  const handleSearch = (value: string) => {
    setSearchValue(value)
    if (!value) {
      setSelectedStepService(null)
    }
  }

  // Xử lý khi người dùng chọn một option
  const handleChange = (value: string) => {
    if (value) {
      const stepServicesValue = JSON.parse(value) as StepServicesInterface
      setSelectedStepService(stepServicesValue)
      setSearchValue(stepServicesValue.name)
      onHandleChange?.(stepServicesValue)
    }
  }

  // Xử lí khi xoá lựa chọn
  const handleClear = () => {
    setSearchValue('')
    setSelectedStepService(null)
    onHandleChange?.(null)
  }

  const options: SelectProps['options'] = StepServices.map((step: StepServicesInterface) => ({
    value: JSON.stringify(step),
    label: `${step.name}`
  }))

  return (
    <Select
      value={selectedStepService ? JSON.stringify(selectedStepService) : undefined}
      showSearch
      placeholder={placeholder}
      filterOption={false}
      options={options}
      allowClear={clear}
      onSearch={handleSearch}
      onChange={handleChange}
      onClear={handleClear}
      defaultActiveFirstOption={false}
    />
  )
}

export default SelectSearchStepServices
