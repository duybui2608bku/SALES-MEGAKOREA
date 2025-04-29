// import { Select } from 'antd'
// import { useContext, useEffect, useState } from 'react'
// import { RoleUser } from 'src/Constants/enum'
// import { AppContext } from 'src/Context/AppContext'
// import useQueryBranch from 'src/hook/query/useQueryBranch'
// import { isAdminValidator } from 'src/Utils/util.utils'

// interface BranchOptionsType {
//   mode?: 'multiple' | 'tags' | undefined
//   placeholder?: string
//   search?: boolean
//   onchange?: (value: string[]) => void
//   initialValue?: string[]
//   disabled?: boolean
// }

// const OptionsBranch = (props: BranchOptionsType) => {
//   const { mode, search = true, onchange, placeholder, initialValue, disabled } = props
//   const { branchList, isLoading } = useQueryBranch()
//   const [selectedValue, setSelectedValue] = useState<string[]>(initialValue || [])
//   const { profile } = useContext(AppContext)

//   const branchOptions = branchList?.map((branch, index) => ({
//     key: index,
//     label: branch.name,
//     value: branch._id
//   }))

//   const branchOptionsWithAll = [{ label: 'Tất cả', value: 'all', key: 'all' }, ...branchOptions]

//   useEffect(() => {
//     setSelectedValue(initialValue || [])
//   }, [initialValue])

//   const handleChange = (value: string[]) => {
//     setSelectedValue(value)
//     onchange?.(value)
//   }

//   return (
//     <Select
//       onChange={handleChange}
//       value={
//         !isAdminValidator(profile?.role as RoleUser)
//           ? Array.isArray(profile?.branch._id)
//             ? profile.branch._id.filter((id): id is string => id !== undefined)
//             : [profile?.branch._id].filter((id): id is string => id !== undefined)
//           : selectedValue
//       }
//       style={{ width: '100%' }}
//       mode={!isAdminValidator(profile?.role as RoleUser) ? undefined : mode}
//       allowClear
//       disabled={disabled || !isAdminValidator(profile?.role as RoleUser)}
//       placeholder={placeholder || 'Chọn chi nhánh'}
//       loading={isLoading}
//       options={!(selectedValue.length === branchList.length) ? branchOptionsWithAll : branchOptions}
//       showSearch={search}
//     />
//   )
// }

// export default OptionsBranch

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
}

const OptionsBranch = (props: BranchOptionsType) => {
  const { mode, search = true, onchange, placeholder, initialValue, disabled } = props
  const { branchList, isLoading } = useQueryBranch()
  const [selectedValues, setSelectedValues] = useState<string[]>(initialValue || [])
  const { profile } = useContext(AppContext)

  // Tạo danh sách options cho Select
  const branchOptions = branchList?.map((branch, index) => ({
    key: index,
    label: branch.name,
    value: branch._id
  }))

  // Cập nhật selected values khi initialValue thay đổi
  useEffect(() => {
    setSelectedValues(initialValue || [])
  }, [initialValue])

  // Xử lý khi người dùng chọn/bỏ chọn
  const handleChange = (values: string[]) => {
    setSelectedValues(values)
    onchange?.(values)
  }

  // Kiểm tra xem đã chọn tất cả chưa
  const isAllSelected = () => {
    return (
      selectedValues.length === branchList.length && branchList.every((branch) => selectedValues.includes(branch._id))
    )
  }

  const customTagRender = (props: any) => {
    const { label, value, closable, onClose } = props

    // Nếu đã chọn tất cả và đây không phải là tag đầu tiên, không hiển thị
    if (isAllSelected() && selectedValues.indexOf(value) > 0) {
      return null
    }

    // Nếu đã chọn tất cả và đây là tag đầu tiên, hiển thị "Tất cả"
    if (isAllSelected() && selectedValues.indexOf(value) === 0) {
      return (
        <Tag icon={<UnorderedListOutlined />} color='magenta' closable={false} style={{ marginRight: 3 }}>
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

  return (
    <Select
      onChange={handleChange}
      value={
        !isAdminValidator(profile?.role as RoleUser)
          ? Array.isArray(profile?.branch._id)
            ? profile.branch._id.filter((id): id is string => id !== undefined)
            : [profile?.branch._id].filter((id): id is string => id !== undefined)
          : selectedValues
      }
      style={{ width: '100%' }}
      mode={!isAdminValidator(profile?.role as RoleUser) ? undefined : mode}
      allowClear
      disabled={disabled || !isAdminValidator(profile?.role as RoleUser)}
      placeholder={placeholder || 'Chọn chi nhánh'}
      loading={isLoading}
      options={branchOptions}
      showSearch={search}
      tagRender={customTagRender}
    />
  )
}

export default OptionsBranch
