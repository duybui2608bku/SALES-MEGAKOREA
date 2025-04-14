import { Avatar, Button, Col, Flex, Row, Typography } from 'antd'
import Paragraph from 'antd/es/typography/Paragraph'
import Title from 'antd/es/typography/Title'
import { Fragment } from 'react/jsx-runtime'
import ShowInforUserComponent from './Components/showInforUserComponent'
const { Text } = Typography

const UserInformation = () => {
  return (
    <Fragment>
      <Row style={{ padding: '20px' }}>
        <Col>
          <Title level={3}>Xin chào, admin</Title>
          <Typography style={{ fontSize: '12px', color: 'rgba(0,0,0,30%)' }}>Ngày 5 tháng 11 năm 2003</Typography>
        </Col>
      </Row>
      <Row style={{ padding: '0 20px' }}>
        <Col span={24}>
          <img style={{ borderRadius: '10px 10px 0 0' }} src='src/Assets/bg_userInfor.png' alt='' />
        </Col>
        <Row
          style={{
            width: '100%',
            padding: '10px 30px 50px',
            backgroundColor: 'rgba(0,0,0,3%)',
            borderRadius: '0 0 10px 10px'
          }}
        >
          <Flex style={{ width: '100%', margin: '25px 0' }} justify='space-between' align='center'>
            <Flex align='center' gap={20}>
              <Avatar size={100} src='src/Assets/1E928D9A-B834-4765-A785-66607BD5D990.jpeg' />
              {/* <Avatar size={100} src='https://fbads-megakorea.s3-hcm-r1.s3cloud.vn/3bebc66ff53eab20f02d7eb03.jpg' /> */}
              <Col>
                <Text strong style={{ fontSize: '18px' }}>
                  Huỳnh Minh Trung
                </Text>
                <Paragraph style={{ color: 'rgba(0,0,0,50%)', paddingTop: '10px', fontSize: '12px' }}>
                  minhtrung010321@gmail.com
                </Paragraph>
              </Col>
            </Flex>

            <Button type='primary' style={{ padding: '15px 18px', fontSize: '' }}>
              Sửa thông tin
            </Button>
          </Flex>
          <Row style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }} gutter={[16, 16]}>
            <ShowInforUserComponent title='Họ và tên' value='Huỳnh Minh Trung' />
            <ShowInforUserComponent title='Email' value='minhtrung010321@gmail.com' />
            <ShowInforUserComponent title='Vai trò' value='Kỹ thuật viên' />
            <ShowInforUserComponent title='Chi nhánh' value='Thành phố Hồ Chí Minh' />
          </Row>
        </Row>
      </Row>
    </Fragment>
  )
}

export default UserInformation
