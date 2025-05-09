// Thay thế component SelectSearchStepServices bằng phiên bản cải tiến này
// import { useQuery } from '@tanstack/react-query'
import { Select, SelectProps, Spin } from 'antd'
import { useCallback, useEffect, useState, memo, useMemo, useRef } from 'react'
import { servicesApi } from 'src/Service/services/services.api'

export interface StepServicesInterface {
  _id: string
  name: string
  commision: number
  type: number
  services_category_id: string | null
}

interface SelectSearchStepServicesProps {
  cateValue?: string
  placeholder?: string
  clear?: boolean
  initialValue?: string
  onHandleChange?: (value: StepServicesInterface | null) => void
  forceSelectedValue?: string // New prop
}

// const STALETIME = 5 * 60 * 1000

const SelectSearchStepServices = memo((props: SelectSearchStepServicesProps) => {
  const {
    placeholder = 'Nhập bước dịch vụ để tìm kiếm',
    onHandleChange,
    clear = true,
    initialValue,
    cateValue,
    forceSelectedValue
  } = props

  const [searchValue, setSearchValue] = useState<string>('')
  const [selectedStepService, setSelectedStepService] = useState<StepServicesInterface | null>(null)
  const [stepServices, setStepServices] = useState<StepServicesInterface[]>([])
  const [loading, setLoading] = useState(false)

  // Track when we should load the initialValue
  const initialValueLoadedRef = useRef(false)
  const initialValueRef = useRef(initialValue)

  // Keep track of category value changes
  const [categoryValue, setCategoryValue] = useState('')
  const prevCategoryValueRef = useRef('')

  // Debug logging
  useEffect(() => {
    console.log('SelectSearchStepServices render with:', {
      initialValue,
      cateValue,
      selectedStepService: selectedStepService ? selectedStepService._id : null,
      initialValueLoaded: initialValueLoadedRef.current,
      optionsCount: stepServices.length
    })
  }, [initialValue, cateValue, selectedStepService, stepServices.length])

  // Update category value when prop changes
  useEffect(() => {
    if (cateValue !== categoryValue) {
      console.log(`Category value changed from ${categoryValue} to ${cateValue}`)

      if (cateValue) {
        setCategoryValue(cateValue)
        prevCategoryValueRef.current = categoryValue

        // When changing categories, we may need to reset the selection
        if (
          selectedStepService &&
          selectedStepService.services_category_id !== cateValue &&
          prevCategoryValueRef.current !== ''
        ) {
          setSelectedStepService(null)
        }
      }
    }
  }, [cateValue, categoryValue, selectedStepService])

  // Reset when initialValue changes - important for when editing different records
  useEffect(() => {
    if (initialValue !== initialValueRef.current) {
      console.log(`initialValue changed from ${initialValueRef.current} to ${initialValue}`)
      initialValueRef.current = initialValue
      initialValueLoadedRef.current = false
    }
  }, [initialValue])

  // Load step services based on category
  useEffect(() => {
    if (!categoryValue) return

    console.log(`Loading step services for category: ${categoryValue}`)
    setLoading(true)

    servicesApi
      .getAllStepService({ services_category_id: categoryValue })
      .then((response) => {
        if (response.data && response.data.result) {
          const filteredSteps = response.data.result.map((step: any) => ({
            _id: step._id,
            name: step.name,
            commision: step.commision || 0,
            type: step.type,
            services_category_id: step.services_category_id || null
          }))

          console.log(`Loaded ${filteredSteps.length} step services for category ${categoryValue}`)
          setStepServices(filteredSteps)

          // Check if we have an initialValue that needs to be loaded
          if (initialValue && !initialValueLoadedRef.current) {
            const matchingStep = filteredSteps.find((step) => step._id === initialValue)
            if (matchingStep) {
              console.log(`Found matching step for initialValue ${initialValue}:`, matchingStep)
              setSelectedStepService(matchingStep)
              initialValueLoadedRef.current = true
            } else {
              console.log(`No matching step found for initialValue ${initialValue} in category ${categoryValue}`)
            }
          }
        }
      })
      .catch((error) => {
        console.error('Error fetching step services by category:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [categoryValue, initialValue])

  // Handle forceSelectedValue updates
  useEffect(() => {
    if (forceSelectedValue && stepServices.length > 0) {
      const matchingStep = stepServices.find((step) => step._id === forceSelectedValue)
      if (matchingStep && (!selectedStepService || selectedStepService._id !== forceSelectedValue)) {
        console.log(`Forcing selection to ${forceSelectedValue}`)
        setSelectedStepService(matchingStep)
      }
    }
  }, [forceSelectedValue, stepServices, selectedStepService])

  // Handle search
  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value)

      if (value.trim() === '') return

      setLoading(true)
      servicesApi
        .getAllStepService({
          search: value,
          services_category_id: categoryValue
        })
        .then((response) => {
          if (response.data && response.data.result) {
            const searchResults = response.data.result.map((step: any) => ({
              _id: step._id,
              name: step.name,
              commision: step.commision || 0,
              type: step.type,
              services_category_id: step.services_category_id || null
            }))
            setStepServices(searchResults)
          }
        })
        .catch((error) => {
          console.error('Error searching step services:', error)
        })
        .finally(() => {
          setLoading(false)
        })
    },
    [categoryValue]
  )

  // Handle selection change
  const handleChange = useCallback(
    (value: string) => {
      if (value) {
        try {
          const stepServicesValue = JSON.parse(value) as StepServicesInterface
          console.log('Selected step service:', stepServicesValue)
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

  // Handle clear selection
  const handleClear = useCallback(() => {
    setSearchValue('')
    setSelectedStepService(null)
    initialValueLoadedRef.current = false
    onHandleChange?.(null)
  }, [onHandleChange])

  // Prepare options for the Select
  const options: SelectProps['options'] = useMemo(
    () =>
      stepServices.map((step: StepServicesInterface) => ({
        value: JSON.stringify(step),
        label: `${step.name}`
      })),
    [stepServices]
  )

  // Format the selected value for the Select
  const selectValue = useMemo(() => {
    if (!selectedStepService) return undefined
    return JSON.stringify(selectedStepService)
  }, [selectedStepService])

  return (
    <Select
      value={selectValue}
      showSearch
      placeholder={placeholder}
      filterOption={false}
      options={options}
      allowClear={clear}
      onSearch={handleSearch}
      onChange={handleChange}
      onClear={handleClear}
      loading={loading}
      defaultActiveFirstOption={false}
      searchValue={searchValue}
      autoClearSearchValue={false}
      labelInValue={false}
      notFoundContent={loading ? <Spin size='small' /> : 'Không tìm thấy dữ liệu'}
      optionFilterProp='label'
    />
  )
})

SelectSearchStepServices.displayName = 'SelectSearchStepServices'

export default SelectSearchStepServices
