import { useQuery } from '@tanstack/react-query'
import { Select, SelectProps } from 'antd'
import { useCallback, useEffect, useState, memo, useMemo, useRef } from 'react'
import { servicesApi } from 'src/Service/services/services.api'

// Export this interface so it can be used in other components
export interface StepServicesInterface {
  _id: string
  name: string
  commision: number
  type: number
  services_category_id: string | null
}

interface SelectSearchStepServicesProps {
  placeholder?: string
  clear?: boolean
  initialValue?: string
  onHandleChange?: (value: StepServicesInterface | null) => void
}

const STALETIME = 5 * 60 * 1000

const SelectSearchStepServices = memo((props: SelectSearchStepServicesProps) => {
  const { placeholder = 'Nhập bước dịch vụ để tìm kiếm', onHandleChange, clear = true, initialValue } = props
  const [searchValue, setSearchValue] = useState<string>('')
  const [selectedStepService, setSelectedStepService] = useState<StepServicesInterface | null>(null)
  const [stepServices, setStepServices] = useState<StepServicesInterface[]>([])
  const initialLoadRef = useRef(false)

  // Load initial value if provided
  useEffect(() => {
    if (initialValue && !selectedStepService && !initialLoadRef.current) {
      initialLoadRef.current = true

      // First get all step services to find the one with matching ID
      servicesApi
        .getAllStepService({})
        .then((response) => {
          if (response.data && response.data.result) {
            const allSteps = response.data.result
            const matchingStep = allSteps.find((step: any) => step._id === initialValue)
            if (matchingStep) {
              setSelectedStepService({
                _id: matchingStep._id,
                name: matchingStep.name,
                commision: matchingStep.commision,
                type: matchingStep.type,
                services_category_id: matchingStep.services_category_id || null
              })
              // Don't set search value to allow new searches
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching step services:', error)
        })
    }
  }, [initialValue, selectedStepService])

  // Load all steps on component mount to show options without search
  useEffect(() => {
    servicesApi
      .getAllStepService({})
      .then((response) => {
        if (response.data && response.data.result) {
          const allSteps = response.data.result
          const mappedSteps = allSteps.map((step: any) => ({
            _id: step._id,
            name: step.name,
            commision: step.commision || 0,
            type: step.type,
            services_category_id: step.services_category_id || null
          }))
          setStepServices(mappedSteps)
        }
      })
      .catch((error) => {
        console.error('Error fetching initial step services:', error)
      })
  }, [])

  // Debounce search value changes to prevent excessive API calls
  const debouncedSearchValue = useMemo(() => {
    return searchValue
  }, [searchValue])

  // Fetch data from API with the searchValue as a dependency
  const { data, isLoading } = useQuery({
    queryKey: ['searchStepService', debouncedSearchValue],
    queryFn: () => {
      const query = { search: debouncedSearchValue }
      return servicesApi.getAllStepService(query)
    },
    staleTime: STALETIME,
    // Enable fetching only if there's a search value
    enabled: debouncedSearchValue !== '',
    // Don't refetch on window focus to reduce unnecessary API calls
    refetchOnWindowFocus: false
  })

  useEffect(() => {
    if (data) {
      const searchResults = data.data.result.map((service: any) => ({
        _id: service._id,
        name: service.name,
        commision: service.commision || 0,
        type: service.type,
        services_category_id: service.services_category_id
      }))

      // If search is active, show search results
      if (debouncedSearchValue) {
        setStepServices(searchResults)
      }
    }
  }, [data, debouncedSearchValue])

  // Xử lý khi người dùng nhập vào ô tìm kiếm
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value)
    // Keep selection when searching
  }, [])

  // Xử lý khi người dùng chọn một option
  const handleChange = useCallback(
    (value: string) => {
      if (value) {
        try {
          const stepServicesValue = JSON.parse(value) as StepServicesInterface
          setSelectedStepService(stepServicesValue)
          setSearchValue('') // Clear search after selection
          onHandleChange?.(stepServicesValue)
        } catch (error) {
          console.error('Error parsing step service value:', error)
        }
      } else {
        setSelectedStepService(null)
        onHandleChange?.(null)
      }
    },
    [onHandleChange]
  )

  // Xử lí khi xoá lựa chọn
  const handleClear = useCallback(() => {
    setSearchValue('')
    setSelectedStepService(null)
    initialLoadRef.current = false
    onHandleChange?.(null)
  }, [onHandleChange])

  // Memoize options to prevent unnecessary re-renders
  const options: SelectProps['options'] = useMemo(
    () =>
      stepServices.map((step: StepServicesInterface) => ({
        value: JSON.stringify(step),
        label: `${step.name}`
      })),
    [stepServices]
  )

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
      searchValue={searchValue}
      autoClearSearchValue={false}
      labelInValue={false}
    />
  )
})

// Add display name
SelectSearchStepServices.displayName = 'SelectSearchStepServices'

export default SelectSearchStepServices
