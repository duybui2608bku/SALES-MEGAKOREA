import { useQuery } from '@tanstack/react-query'
import { Select, SelectProps } from 'antd'
import { useEffect, useState } from 'react'
import { servicesApi } from 'src/Service/services/services.api'

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

const STALETIME = 5 * 60 * 1000

const SelectSearchStepServices = (props: SelectSearchStepServicesProps) => {
  const { placeholder = 'Nhập bước dịch vụ để tìm kiếm', onHandleChange, clear = true } = props
  const [searchValue, setSearchValue] = useState<string>('')
  const [selectedStepService, setSelectedStepService] = useState<StepServicesInterface | null>(null)
  const [stepServices, setStepServices] = useState<StepServicesInterface[]>([])

  // Fetch data from API
  const { data, isLoading } = useQuery({
    queryKey: ['searchStepService'],
    queryFn: () => {
      const query = { search: searchValue }
      return servicesApi.getAllStepService(query)
    },
    staleTime: STALETIME
  })

  useEffect(() => {
    if (data) {
      setStepServices(
        data.data.result.map((service: any) => ({
          _id: service._id,
          name: service.name,
          commision: service.commision || 0,
          type: service.type,
          services_category_id: service.services_category_id
        }))
      )
    }
  }, [data])

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

  const options: SelectProps['options'] = stepServices.map((step: StepServicesInterface) => ({
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
      loading={isLoading}
      defaultActiveFirstOption={false}
    />
  )
}

export default SelectSearchStepServices
