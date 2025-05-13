import { Select, Tag } from 'antd'
import { useContext, useEffect, useState } from 'react'
import { RoleUser } from 'src/Constants/enum'
import { AppContext } from 'src/Context/AppContext'
import useQueryBranch from 'src/hook/query/useQueryBranch'
import { isAdminValidator } from 'src/Utils/util.utils'
import { UnorderedListOutlined } from '@ant-design/icons'

interface BranchOptionsType {
  mode?: 'multiple' | 'tags' | undefined
  placeholder?: string
  search?: boolean
  onchange?: (value: string[]) => void
  initialValue?: string[]
  disabled?: boolean
  value?: string[]
}

const OptionsBranch = (props: BranchOptionsType) => {
  const { mode, search = true, onchange, placeholder, initialValue, disabled, value } = props
  const { branchList, isLoading } = useQueryBranch()
  const [internalValue, setInternalValue] = useState<string[]>(initialValue || [])
  const { profile } = useContext(AppContext)
  const isAdmin = isAdminValidator(profile?.role as RoleUser)

  // Tạo danh sách options cho Select
  const branchOptions = branchList?.map((branch, index) => ({
    key: index,
    label: branch.name,
    value: branch._id
  }))

  // Cập nhật giá trị nội bộ khi props thay đổi
  useEffect(() => {
    if (initialValue && initialValue.length > 0) {
      setInternalValue(initialValue)
    }
  }, [initialValue])

  // Đồng bộ giá trị khi prop value thay đổi từ bên ngoài
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value)
    }
  }, [value])

  // Xử lý khi người dùng chọn/bỏ chọn
  const handleChange = (newValues: string[]) => {
    setInternalValue(newValues)
    if (onchange) {
      onchange(newValues)
    }
  }

  // Kiểm tra xem đã chọn tất cả chưa
  const isAllSelected = () => {
    const currentValues = value !== undefined ? value : internalValue
    return (
      branchList?.length > 0 &&
      currentValues.length === branchList.length &&
      branchList.every((branch) => currentValues.includes(branch._id))
    )
  }

  const customTagRender = (props: any) => {
    const { label, value: tagValue, closable, onClose } = props
    const currentValues = value !== undefined ? value : internalValue

    // Nếu đã chọn tất cả và đây không phải là tag đầu tiên, không hiển thị
    if (isAllSelected() && currentValues.indexOf(tagValue) > 0) {
      return null
    }

    // Nếu đã chọn tất cả và đây là tag đầu tiên, hiển thị "Tất cả"
    if (isAllSelected() && currentValues.indexOf(tagValue) === 0) {
      return (
        <Tag
          icon={<UnorderedListOutlined />}
          color='magenta'
          closable={closable}
          onClose={onClose}
          style={{ marginRight: 3 }}
        >
          Tất cả
        </Tag>
      )
    }

    // Hiển thị bình thường cho các trường hợp khác
    return (
      <Tag color='blue' closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
        {label}
      </Tag>
    )
  }

  // Quyết định giá trị hiển thị dựa trên nhiều điều kiện
  const displayValue = () => {
    // Nếu bên ngoài truyền vào value prop, ưu tiên sử dụng nó
    if (value !== undefined) {
      return value
    }

    // Nếu không phải admin, hiển thị chi nhánh của họ
    if (!isAdmin) {
      if (Array.isArray(profile?.branch?._id)) {
        return profile.branch._id.filter((id): id is string => id !== undefined)
      }
      return profile?.branch?._id ? [profile.branch._id] : []
    }

    // Nếu là admin, sử dụng giá trị từ state nội bộ
    return internalValue
  }

  return (
    <Select
      onChange={handleChange}
      value={displayValue()}
      style={{ width: '100%' }}
      mode={isAdmin ? mode : undefined}
      allowClear={isAdmin}
      disabled={disabled || !isAdmin}
      placeholder={placeholder || 'Chọn chi nhánh'}
      loading={isLoading}
      options={branchOptions}
      showSearch={search}
      tagRender={customTagRender}
    />
  )
}

export default OptionsBranch
