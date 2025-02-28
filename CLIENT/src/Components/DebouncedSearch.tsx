import { Input } from 'antd'
import { useState, useCallback } from 'react'

const { Search } = Input

interface DebouncedSearchProps {
  placeholder?: string
  onSearch: (value: string) => void
  debounceTime?: number
}

const DebouncedSearch = (props: DebouncedSearchProps) => {
  const { placeholder, onSearch, debounceTime = 500 } = props
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
      allowClear
    />
  )
}

export default DebouncedSearch
