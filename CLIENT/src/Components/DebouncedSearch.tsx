import { Input } from 'antd'
import { useState, useCallback, useEffect } from 'react'

const { Search } = Input

interface DebouncedSearchProps {
  placeholder?: string
  onSearch: (value: string) => void
  debounceTime?: number
  loading?: boolean
  resetValue?: boolean
}

const DebouncedSearch = (props: DebouncedSearchProps) => {
  const { placeholder, onSearch, debounceTime = 500, loading, resetValue } = props
  const [value, setValue] = useState<string>('')
  const debounce = useCallback((fn: (val: string) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (searchValue: string) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn(searchValue), delay)
    }
  }, [])

  const debouncedSearch = useCallback(debounce(onSearch, debounceTime), [onSearch, debounceTime])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    debouncedSearch(newValue)
  }

  // Xử lý reset value khi người dùng bấm btn "Quay về" trong <Empty />
  useEffect(() => {
    if (resetValue) {
      setValue('')
      onSearch('')
    }
  }, [resetValue, onSearch])

  const handleSearch = () => {
    onSearch(value)
  }

  return (
    <Search
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      onSearch={handleSearch}
      enterButton
      loading={loading}
      allowClear
    />
  )
}

export default DebouncedSearch
