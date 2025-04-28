import { Select, Tag } from 'antd'
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
  const [showAll, setShowAll] = useState(false)

  const branchOptions = branchList?.map((branch, index) => ({
    key: index,
    label: branch.name,
    value: branch._id
  }))

  const branchOptionsWithAll = [{ label: 'Tất cả', value: 'all', key: 'all' }, ...branchOptions]
  const allBranchIds = branchList.map((branch) => branch._id)

  useEffect(() => {
    // Kiểm tra xem initialValue có chứa tất cả chi nhánh không
    if (
      initialValue &&
      initialValue.length === branchList.length &&
      initialValue.every((_id) => allBranchIds.includes(_id))
    ) {
      setShowAll(true)
      setSelectedValue(['all'])
    } else {
      setShowAll(false)
      setSelectedValue(initialValue || [])
    }
  }, [initialValue, branchList, allBranchIds])

  const handleChange = (value: string[]) => {
    // Xử lý khi người dụng "Tất cả"
    if (value.includes('all')) {
      setShowAll(true)
      setSelectedValue(['all'])
      onchange?.(['all'])
      return
    }

    // Kiểm tra xem người dùng đã chọn tất cả các chi nhánh chưa
    if (value.length === branchList.length && value.every((_id) => allBranchIds.includes(_id))) {
      setShowAll(true)
      setSelectedValue(['all'])
    } else {
      setShowAll(false)
      setSelectedValue(value)
    }

    onchange?.(value)
  }

  // Custom render cho selected
  const tagRender = (props: any) => {
    const { label, value, closable, onClose } = props
    if (showAll && value === 'all') {
      return (
        <Tag color='blue' closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
          Tất cả
        </Tag>
      )
    }

    return (
      <Tag color='blue' closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
        {label}
      </Tag>
    )
  }

  // Xác định value hiển thị
  const displayValue = () => {
    if (!isAdminValidator(profile?.role as RoleUser)) {
      return Array.isArray(profile?.branch._id)
        ? profile.branch._id.filter((id): id is string => id != undefined)
        : [profile?.branch._id].filter((id): id is string => id != undefined)
    }

    return showAll ? ['all'] : selectedValue
  }

  return (
    <Select
      onChange={handleChange}
      value={displayValue()}
      style={{ width: '100%' }}
      mode={!isAdminValidator(profile?.role as RoleUser) ? undefined : mode}
      allowClear
      disabled={disabled || !isAdminValidator(profile?.role as RoleUser)}
      placeholder={placeholder || 'Chọn chi nhánh'}
      loading={isLoading}
      options={branchOptionsWithAll}
      showSearch={search}
      tagRender={tagRender}
      maxTagCount='responsive'
    />
  )
}

export default OptionsBranch
