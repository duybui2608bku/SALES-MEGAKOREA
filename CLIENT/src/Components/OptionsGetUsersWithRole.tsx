import { Select } from 'antd'
import { useEffect, useState } from 'react'
import { RoleUser } from 'src/Constants/enum'
import useQueryUsersWithRole from 'src/hook/query/useQueryUsersWithRole'

interface UsersOptionsType {
  mode?: 'multiple' | 'tags'
  placeholder?: string
  search?: boolean
  onchange?: (value: string) => void
  initialValue?: string
  role: RoleUser
  style?: React.CSSProperties
}

const OptionsGetUsersWithRole = (props: UsersOptionsType) => {
  const { mode, search, onchange, placeholder, initialValue, role, style } = props
  const { userSWithRole, isLoading } = useQueryUsersWithRole(role)
  const [selectedValue, setSelectedValue] = useState<string>()

  const categoryServicesOptions = userSWithRole?.map((branch, index) => ({
    key: index,
    label: branch.name,
    value: branch._id
  }))

  useEffect(() => {
    setSelectedValue(initialValue)
  }, [initialValue])

  const handleChange = (value: string) => {
    setSelectedValue(value)
    onchange?.(value)
  }

  return (
    <Select
      onChange={handleChange}
      value={selectedValue}
      style={{
        width: '100%',
        ...style
      }}
      mode={mode || undefined}
      allowClear
      placeholder={placeholder || 'Chọn người dùng'}
      loading={isLoading}
      options={categoryServicesOptions}
      showSearch={search}
    />
  )
}

export default OptionsGetUsersWithRole
