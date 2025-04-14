import { Menu, MenuProps, Layout, Button } from 'antd'
import { useState } from 'react'
import { MdMailLock, MdSettings } from 'react-icons/md'
import { BiSolidCaretLeftSquare, BiSolidCaretRightSquare } from 'react-icons/bi'
const { Header, Sider, Content } = Layout
import logo from '../../Assets/megakorea-logo-300x105-1.png'
import logoMobile from '../../Assets/logo-mobile.png'
import { FcEngineering } from 'react-icons/fc'
import HeaderMain from '../Header/Header'
import './MainLayout.scss'
import { useNavigate } from 'react-router'
import { pathRoutersProduct, pathRoutersService, pathRoutesCustomers } from 'src/Constants/path'
import { CiCreditCard2, CiUser } from 'react-icons/ci'

interface Props {
  children?: React.ReactNode
}

const MainLayout = ({ children }: Props) => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  type MenuItem = Required<MenuProps>['items'][number]

  const items: MenuItem[] = [
    {
      key: 'customers',
      label: 'Khách hàng',
      // eslint-disable-next-line react/jsx-no-undef
      icon: <CiUser size={20} />,
      onClick: () => navigate(pathRoutesCustomers.customers)
    },
    {
      key: 'card-service',
      label: 'Thẻ dịch vụ',
      icon: <CiCreditCard2 size={20} />,

      children: [
        {
          key: 'card-service',
          label: 'Thẻ dịch vụ',
          onClick: () => navigate(pathRoutersService.soldCardService)
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
      key: 'sub2',
      label: 'Navigation Two',
      icon: <MdMailLock />,
      children: [
        { key: '5', label: 'Option 5' },
        { key: '6', label: 'Option 6' }
      ]
    },
    {
      type: 'divider'
    },
    {
      key: 'sub4',
      label: 'Navigation Three',
      icon: <MdSettings />,
      children: [
        { key: '9', label: 'Option 9' },
        { key: '10', label: 'Option 10' },
        { key: '11', label: 'Option 11' },
        { key: '12', label: 'Option 12' }
      ]
    }
  ]
  return (
    <Layout>
      <Sider width={250} trigger={null} collapsible collapsed={collapsed}>
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
              width: '80%',
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
            style={{
              width: 64,
              height: 64
            }}
          />
          <HeaderMain />
        </Header>
        <Content className='main-layout-container__content'>{children}</Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
