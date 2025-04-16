import { Tag } from 'antd'
import { RoleUser } from 'src/Constants/enum'
import { getRoleUser } from 'src/Utils/util.utils'

interface RoleUserProps {
  roleUser: RoleUser
}

const TagRoleUserComponent = ({ roleUser }: RoleUserProps) => {
  switch (roleUser) {
    case RoleUser.ACCOUNTANT:
      return <Tag color='magenta'>{getRoleUser(roleUser)}</Tag>
    case RoleUser.MANAGER:
      return <Tag color='gold'>{getRoleUser(roleUser)}</Tag>
    case RoleUser.SALE:
      return <Tag color='purple'>{getRoleUser(roleUser)}</Tag>
    case RoleUser.TECHNICAN_MASTER:
      return <Tag color='green'>{getRoleUser(roleUser)}</Tag>
    case RoleUser.TECHNICIAN:
      return <Tag color='orange'>{getRoleUser(roleUser)}</Tag>
    case RoleUser.USER:
      return <Tag color='cyan'>{getRoleUser(roleUser)}</Tag>
    case RoleUser.ADMIN:
      return <Tag color='red'>{getRoleUser(roleUser)}</Tag>
  }
}

export default TagRoleUserComponent
