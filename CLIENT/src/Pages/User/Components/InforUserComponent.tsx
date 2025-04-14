import { Avatar, Col, Row, Tag, Typography } from 'antd'
const { Text } = Typography
import { UserStatus } from 'src/Constants/enum'
import { FcCancel, FcPortraitMode } from 'react-icons/fc'
import { CloseCircleOutlined } from '@ant-design/icons'

type InforUserProps = {
  avatar: string
  name: string
  status: UserStatus
}

const InforUserComponent = ({ avatar, name, status }: InforUserProps) => {
  return (
    <div style={{ width: '100%' }}>
      {status != UserStatus.BANNED && avatar == '' && (
        <Row align={'middle'} gutter={[16, 16]}>
          <Col xs={24} xl={7}>
            <Avatar
              style={{ backgroundColor: 'transparent', border: '1px solid rgba(0,0,0,10%)' }}
              size={50}
              icon={<FcPortraitMode />}
            />
          </Col>
          <Col xs={24} xl={17} flex='auto'>
            <Typography>{name}</Typography>
          </Col>
        </Row>
      )}
      {status != UserStatus.BANNED && avatar != '' && (
        <Row align={'middle'} gutter={[16, 16]}>
          <Col xs={24} xl={7}>
            <Avatar
              // style={{ backgroundColor: 'transparent', border: '1px solid rgba(0,0,0,10%)' }}
              size={50}
              src={avatar}
            />
          </Col>
          <Col xs={24} xl={17} flex='auto'>
            <Typography>{name}</Typography>
          </Col>
        </Row>
      )}
      {status == UserStatus.BANNED && (
        <Row align={'middle'} gutter={[16, 16]}>
          <Col xs={24} xl={7}>
            <Avatar style={{ border: '1px solid red', backgroundColor: '#fff' }} size={50} icon={<FcCancel />} />
          </Col>
          <Col xs={24} xl={17} flex='auto'>
            <Typography>{name}</Typography>
            <Text style={{ fontSize: '11px' }} type='danger'>
              <Tag style={{ fontSize: '9px' }} icon={<CloseCircleOutlined />} color='error'>
                Tài khoản đã bị khoá
              </Tag>
            </Text>
          </Col>
        </Row>
      )}
    </div>
  )
}

export default InforUserComponent
