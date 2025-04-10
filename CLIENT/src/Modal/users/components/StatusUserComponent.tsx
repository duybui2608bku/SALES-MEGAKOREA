import { Radio, Tooltip } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { UserStatus } from 'src/Constants/enum'

const options = [
  {
    label: (
      <Tooltip title='Hoạt động'>
        <CheckCircleOutlined />
      </Tooltip>
    ),
    value: UserStatus.ACTIVE
  },
  {
    label: (
      <Tooltip title='Hoạt động'>
        <CloseCircleOutlined style={{ color: 'red' }} />
      </Tooltip>
    ),
    value: UserStatus.INACTIVE
  }
]

const StatusUserComponent = () => {
  return (
    <Radio.Group defaultValue={UserStatus.ACTIVE} options={options} block optionType='button' buttonStyle='solid' />
  )
}

export default StatusUserComponent
