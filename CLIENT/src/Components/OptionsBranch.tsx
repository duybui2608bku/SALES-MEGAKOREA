import { Select } from 'antd'
import { useContext, useEffect, useState } from 'react'
import { RoleUser } from 'src/Constants/enum'
import { AppContext } from 'src/Context/AppContext'
import useQueryBranch from 'src/hook/query/useQueryBranch'
import { isAdminValidator } from 'src/Utils/util.utils'

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
  const { profile } = useContext(AppContext)
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
      value={
        !isAdminValidator(profile?.role as RoleUser)
          ? Array.isArray(profile?.branch._id)
            ? profile.branch._id.filter((id): id is string => id !== undefined)
            : [profile?.branch._id].filter((id): id is string => id !== undefined)
          : selectedValue
      }
      style={{ width: '100%' }}
      mode={!isAdminValidator(profile?.role as RoleUser) ? undefined : mode}
      allowClear
      disabled={disabled || !isAdminValidator(profile?.role as RoleUser)}
      placeholder={placeholder || 'Chọn chi nhánh'}
      loading={isLoading}
      options={branchOptionsWithAll}
      showSearch={search}
    />
  )
}

export default OptionsBranch
