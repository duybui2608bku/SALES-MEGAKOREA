import { Avatar, Col, Row, Typography } from 'antd'
import { UserOutlined } from '@ant-design/icons'

type InforUserProps = {
  avatar: string
  name: string
}

const InforUserComponent = ({ avatar, name }: InforUserProps) => {
  return (
    <Row wrap={false} align={'middle'} gutter={15}>
      <Col>
        {avatar == '' ? <Avatar size={50} icon={<UserOutlined />} /> : <Avatar size={50} icon={<UserOutlined />} />}
      </Col>
      <Col>
        <Typography>{name}</Typography>
      </Col>
    </Row>
  )
}

export default InforUserComponent
