import { Menu, MenuProps, Layout, Button } from 'antd'
import { Fragment, useState } from 'react'
import { BiSolidCaretLeftSquare, BiSolidCaretRightSquare } from 'react-icons/bi'
const { Header, Sider, Content } = Layout
import logo from '../../Assets/megakorea-logo-300x105-1.png'
import logoMobile from '../../Assets/logo-mobile.png'
import { FcEngineering, FcAssistant, FcKindle, FcButtingIn } from 'react-icons/fc'
import { IoMdLogOut } from 'react-icons/io'
import HeaderMain from '../Header/Header'
import './MainLayout.scss'
import { useNavigate } from 'react-router'
import { pathRoutersProduct, pathRoutersService, pathRoutersUser, pathRoutesCustomers } from 'src/Constants/path'
import ModalLogout from 'src/Modal/ModalLogout'

interface Props {
  children?: React.ReactNode
}

const MainLayout = ({ children }: Props) => {
  const [collapsed, setCollapsed] = useState(false)
  const [openModalLogout, setOpenModalLogout] = useState(false)
  const navigate = useNavigate()

  type MenuItem = Required<MenuProps>['items'][number]

  const items: MenuItem[] = [
    {
      key: 'customers',
      label: 'Khách hàng',
      // eslint-disable-next-line react/jsx-no-undef
      icon: <FcButtingIn size={20} />,
      onClick: () => navigate(pathRoutesCustomers.customers)
    },
    {
      key: 'card-service',
      label: 'Thẻ dịch vụ',
      icon: <FcKindle size={20} />,

      children: [
        {
          key: 'card-service',
          label: 'Thẻ dịch vụ',
          onClick: () => navigate(pathRoutersService.cardService)
        },
        {
          key: 'sell-card-service',
          label: 'Bán thẻ dịch vụ',
          onClick: () => navigate(pathRoutersService.sellCardService)
        },
        {
          key: 'sold-card-service',
          label: 'Thẻ dịch vụ đã bán',
          onClick: () => navigate(pathRoutersService.soldCardService)
        }
      ]
    },
    {
      key: 'setting',
      label: 'Cài đặt',
      icon: <FcEngineering size={20} />,
      children: [
        {
          key: 'product',
          label: 'Sản phẩm',
          type: 'group',
          children: [
            { key: '1', label: 'Vật tư chung', onClick: () => navigate(pathRoutersProduct.productGeneral) },
            { key: '2', label: 'Vật tư tiêu hao' }
          ]
        },
        {
          key: 'services',
          label: 'Dịch vụ',
          type: 'group',
          children: [
            { key: '3', label: 'Dịch Vụ', onClick: () => navigate(pathRoutersService.service) },
            { key: '4', label: 'Danh Mục Dịch Vụ', onClick: () => navigate(pathRoutersService.categoryService) }
          ]
        }
      ]
    },
    {
      key: 'users',
      label: 'Nhân viên',
      icon: <FcAssistant size={20} />,
      children: [
        { key: '5', label: 'Danh sách nhân viên', onClick: () => navigate(pathRoutersUser.userGeneral) },
        { key: '6', label: 'Hoa hồng K.Thuật viên', onClick: () => navigate(pathRoutersUser.userCommisionTechnican) },
        { key: '7', label: 'Hoa hồng N.viên Sale', onClick: () => navigate(pathRoutersUser.userCommisionSale) }
      ]
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <IoMdLogOut size={20} />,
      onClick: () => setOpenModalLogout(true)
    }
  ]

  return (
    <Fragment>
      <Layout>
        <Sider
          style={{ zIndex: '999', position: 'fixed', left: '0', overflow: 'scroll' }}
          width={250}
          trigger={null}
          collapsible
          collapsed={collapsed}
        >
          <div
            style={{
              height: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px 0',
              background: 'white'
            }}
          >
            <img
              src={collapsed ? logoMobile : logo}
              alt='Logo'
              style={{
                height: '100%',
                width: '62%',
                transition: 'all 0.3s',
                transform: collapsed ? 'scale(0.8)' : 'scale(1)'
              }}
            />
          </div>
          <Menu style={{ height: '100vh' }} theme='light' mode='inline' defaultSelectedKeys={['1']} items={items} />
        </Sider>
        <Layout>
          <Header className='main-layout-container__header'>
            <Button
              type='text'
              icon={collapsed ? <BiSolidCaretRightSquare size={25} /> : <BiSolidCaretLeftSquare size={25} />}
              onClick={() => setCollapsed(!collapsed)}
              style={
                !collapsed
                  ? {
                      transition: 'all .2s ease',
                      marginLeft: '250px',
                      width: 64,
                      height: 64
                    }
                  : {
                      transition: 'all .2s ease',
                      marginLeft: '80px',
                      width: 64,
                      height: 64
                    }
              }
            />
            <HeaderMain />
          </Header>
          <Content
            style={
              !collapsed
                ? { transition: 'all .2s ease', marginLeft: '250px', width: 'calc(100vw - 250px)' }
                : { transition: 'all .2s ease', marginLeft: '80px', width: 'calc(100vw - 80px)' }
            }
            className='main-layout-container__content'
          >
            {children}
          </Content>
        </Layout>
      </Layout>
      <ModalLogout open={openModalLogout} onClose={setOpenModalLogout} />
    </Fragment>
  )
}

export default MainLayout
