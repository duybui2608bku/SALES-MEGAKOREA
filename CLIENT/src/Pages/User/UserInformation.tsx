import { Avatar, Button, Col, Flex, Row, Typography } from 'antd'
import logo from 'src/Assets/logo-mobile.png'
import Paragraph from 'antd/es/typography/Paragraph'
import Title from 'antd/es/typography/Title'
import { Fragment } from 'react/jsx-runtime'
import ShowInforUserComponent from './Components/showInforUserComponent'
import { useQuery } from '@tanstack/react-query'
import userApi from 'src/Service/user/user.api'
import { useEffect, useState } from 'react'
import { UserGeneralInterface } from 'src/Interfaces/user/user.interface'
import { getRoleUser } from 'src/Utils/util.utils'
import ModalCreateOrUpdateUser from 'src/Modal/users/ModalCreateOrUpdateUser'
const { Text } = Typography

const STALETIME = 0

const UserInformation = () => {
  const [dataMeAccount, setDataMeAccount] = useState<UserGeneralInterface>()
  const [dataMeToEdit, setDataMeToEdit] = useState<UserGeneralInterface | null>(null)
  const [openModalUpdate, setOpenModalUpdate] = useState(false)

  // Fetch data account login (now)
  const { data: dataMe } = useQuery({
    queryKey: ['getMe'],
    queryFn: async () => {
      const response = await userApi.getUser()
      return response
    },
    staleTime: STALETIME
  })

  useEffect(() => {
    setDataMeAccount(dataMe?.data.result[0])
  }, [dataMe?.data])

  // Hàm check và chuyển đổi format Date
  const formatDate = (date: Date) => {
    const d = new Date(date)
    if (isNaN(d.getTime())) {
      return 'Ngày không hợp lệ!'
    }
    return d.toLocaleDateString('vi-VN')
  }

  // Hàm update data me
  const handleUpdateDataMe = (dataMe: UserGeneralInterface) => {
    setDataMeToEdit(dataMe)
    setOpenModalUpdate(true)
  }

  return (
    <Fragment>
      <Row style={{ padding: '20px' }}>
        <Col>
          <Title level={3}>
            Xin chào, <Text style={{ color: 'rgba(212,163,53,1)', fontSize: '22px' }}>{dataMeAccount?.name}</Text>{' '}
          </Title>
          <Typography style={{ fontSize: '14px', color: 'rgba(0,0,0,30%)' }}>
            {!dataMeAccount?.created_at ? '' : formatDate(dataMeAccount?.created_at)}
          </Typography>
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
          <Flex style={{ width: '100%', margin: '25px 0' }} justify='space-between' align='center' wrap='wrap' gap={20}>
            <Flex align='center' gap={20}>
              {dataMeAccount?.avatar != '' && <Avatar size={100} src={dataMeAccount?.avatar} />}
              {dataMeAccount?.avatar == '' && <Avatar size={100} src={logo} />}
              <Col>
                <Text strong style={{ fontSize: '18px' }}>
                  {dataMeAccount?.name}
                </Text>
                <Paragraph style={{ color: 'rgba(0,0,0,50%)', paddingTop: '10px', fontSize: '12px' }}>
                  {dataMeAccount?.email}
                </Paragraph>
              </Col>
            </Flex>

            <Button
              onClick={() => dataMeAccount && handleUpdateDataMe(dataMeAccount)}
              type='primary'
              style={{ padding: '15px 18px' }}
            >
              Sửa thông tin
            </Button>
          </Flex>
          <Row style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }} gutter={[16, 16]}>
            <ShowInforUserComponent
              title='Họ và tên'
              value={!dataMeAccount?.name ? 'Chưa có thông tin' : dataMeAccount?.name}
            />
            <ShowInforUserComponent
              title='Email'
              value={!dataMeAccount?.email ? 'Chưa có thông tin' : dataMeAccount.email}
            />
            <ShowInforUserComponent
              title='Vai trò'
              value={!dataMeAccount?.role ? 'Chưa có thông tin' : getRoleUser(dataMeAccount.role)}
            />
            <ShowInforUserComponent title='Chi nhánh' value='Thành phố Hồ Chí Minh' />
          </Row>
        </Row>
      </Row>
      <ModalCreateOrUpdateUser
        open={openModalUpdate}
        close={setOpenModalUpdate}
        userToEdit={dataMeToEdit as UserGeneralInterface | null}
        setUserToEdit={setDataMeToEdit}
      />
    </Fragment>
  )
}

export default UserInformation
