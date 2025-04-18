import { Select } from 'antd'
import { useEffect, useState } from 'react'
import useQueryBranch from 'src/hook/query/useQueryBranch'

interface BranchOptionsType {
  mode?: 'multiple' | 'tags' | undefined
  placeholder?: string
  search?: boolean
  onchange?: (value: string[]) => void
  initialValue?: string[]
  disabled?: boolean
}

const OptionsBranch = (props: BranchOptionsType) => {
  const { mode, search = true, onchange, placeholder, initialValue, disabled } = props
  const { branchList, isLoading } = useQueryBranch()
  const [selectedValue, setSelectedValue] = useState<string[]>(initialValue || [])

  const branchOptions = branchList?.map((branch, index) => ({
    key: index,
    label: branch.name,
    value: branch._id
  }))

  const branchOptionsWithAll = [{ label: 'Tất cả', value: 'all', key: 'all' }, ...branchOptions]

  useEffect(() => {
    setSelectedValue(initialValue || [])
  }, [initialValue])

  const handleChange = (value: string[]) => {
    setSelectedValue(value)
    onchange?.(value)
  }

  return (
    <Select
      onChange={handleChange}
      value={selectedValue}
      style={{ width: '100%' }}
      mode={mode}
      allowClear
      disabled={disabled}
      placeholder={placeholder || 'Chọn chi nhánh'}
      loading={isLoading}
      options={branchOptionsWithAll}
      showSearch={search}
    />
  )
}

export default OptionsBranch
