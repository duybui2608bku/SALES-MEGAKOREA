import { Menu, MenuProps, Layout, Button } from 'antd'
import { Fragment, useEffect, useState } from 'react'
import { BiSolidCaretLeftSquare, BiSolidCaretRightSquare } from 'react-icons/bi'
const { Header, Sider, Content } = Layout
import logo from '../../Assets/megakorea-logo-300x105-1.png'
import logoMobile from '../../Assets/logo-mobile.png'
import { FcEngineering, FcAssistant, FcKindle, FcButtingIn } from 'react-icons/fc'
import { IoMdLogOut } from 'react-icons/io'
import HeaderMain from '../Header/Header'
import './MainLayout.scss'
import { useLocation, useNavigate } from 'react-router'
import { pathRoutersProduct, pathRoutersService, pathRoutersUser, pathRoutesCustomers } from 'src/Constants/path'
import ModalLogout from 'src/Modal/ModalLogout'

interface Props {
  children?: React.ReactNode
}

const MainLayout = ({ children }: Props) => {
  const [collapsed, setCollapsed] = useState(false)
  const [openModalLogout, setOpenModalLogout] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedKey, setSelectedKey] = useState<string[]>(['customers'])
  const [openKeys, setOpenKeys] = useState<string[]>([])

  useEffect(() => {
    // Xác định khóa menu và menu con mở dựa trên đường dẫn hiện tại
    const path = location.pathname
    let newSelectedKey: string[] = ['customers']
    let newOpenKeys: string[] = []

    // Map đường dẫn tới khóa menu tương ứng
    if (path.includes(pathRoutesCustomers.customers)) {
      newSelectedKey = ['customers']
    } else if (path.includes(pathRoutersService.cardService)) {
      newSelectedKey = ['card-service']
      newOpenKeys = ['card-service-main']
    } else if (path.includes(pathRoutersService.sellCardService)) {
      newSelectedKey = ['card-service-sell']
      newOpenKeys = ['card-service-main']
    } else if (path.includes(pathRoutersService.soldCardService)) {
      newSelectedKey = ['card-service-sold']
      newOpenKeys = ['card-service-main']
    } else if (path.includes(pathRoutersProduct.productGeneral)) {
      newSelectedKey = ['product-general']
      newOpenKeys = ['setting']
    } else if (path.includes(pathRoutersService.service)) {
      newSelectedKey = ['service']
      newOpenKeys = ['setting']
    } else if (path.includes(pathRoutersService.categoryService)) {
      newSelectedKey = ['category-service']
      newOpenKeys = ['setting']
    } else if (path.includes(pathRoutersService.stepService)) {
      newSelectedKey = ['step-service']
      newOpenKeys = ['setting']
    } else if (path.includes(pathRoutersUser.userGeneral)) {
      newSelectedKey = ['user-general']
      newOpenKeys = ['users']
    } else if (path.includes(pathRoutersUser.userCommisionTechnican)) {
      newSelectedKey = ['user-commision-technican']
      newOpenKeys = ['users']
    } else if (path.includes(pathRoutersUser.userCommisionSale)) {
      newSelectedKey = ['user-commision-sale']
      newOpenKeys = ['users']
    }

    setSelectedKey(newSelectedKey)
    setOpenKeys(newOpenKeys)
  }, [location])

  const onOpenChange = (keys: string[]) => {
    setOpenKeys(keys)
  }

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
      key: 'card-service-main',
      label: 'Thẻ dịch vụ',
      icon: <FcKindle size={20} />,
      children: [
        {
          key: 'card-service',
          label: 'Thẻ dịch vụ',
          onClick: () => navigate(pathRoutersService.cardService)
        },
        {
          key: 'card-service-sell',
          label: 'Bán thẻ dịch vụ',
          onClick: () => navigate(pathRoutersService.sellCardService)
        },
        {
          key: 'card-service-sold',
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
            {
              key: 'product-general',
              label: 'Vật tư chung',
              onClick: () => navigate(pathRoutersProduct.productGeneral)
            },
            { key: '2', label: 'Vật tư tiêu hao' }
          ]
        },
        {
          key: 'services',
          label: 'Dịch vụ',
          type: 'group',
          children: [
            { key: 'service', label: 'Dịch Vụ', onClick: () => navigate(pathRoutersService.service) },
            {
              key: 'category-service',
              label: 'Danh Mục Dịch Vụ',
              onClick: () => navigate(pathRoutersService.categoryService)
            },
            {
              key: 'step-service',
              label: 'Bước Dịch Vụ',
              onClick: () => navigate(pathRoutersService.stepService)
            }
          ]
        }
      ]
    },
    {
      key: 'users',
      label: 'Nhân viên',
      icon: <FcAssistant size={20} />,
      children: [
        { key: 'user-general', label: 'Danh sách nhân viên', onClick: () => navigate(pathRoutersUser.userGeneral) },
        {
          key: 'user-commision-technican',
          label: 'Hoa hồng K.Thuật viên',
          onClick: () => navigate(pathRoutersUser.userCommisionTechnican)
        },
        {
          key: 'user-commision-sale',
          label: 'Hoa hồng N.viên Sale',
          onClick: () => navigate(pathRoutersUser.userCommisionSale)
        }
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
          <Menu
            style={{ height: '100vh' }}
            theme='light'
            mode='inline'
            selectedKeys={selectedKey}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            items={items}
          />
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
