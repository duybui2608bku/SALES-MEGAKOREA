import { Menu, MenuProps, Layout, Button } from 'antd'
import { useState } from 'react'
import { SiGoogleanalytics } from 'react-icons/si'
import { MdMailLock, MdSettings } from 'react-icons/md'
import { BiSolidCaretLeftSquare, BiSolidCaretRightSquare } from 'react-icons/bi'
const { Header, Sider, Content } = Layout
import logo from '../../Assets/megakorea-logo-300x105-1.png'
import logoMobile from '../../Assets/logo-mobile.png'
interface Props {
  children?: React.ReactNode
}

type MenuItem = Required<MenuProps>['items'][number]

const items: MenuItem[] = [
  {
    key: 'sub1',
    label: 'Navigation One',
    icon: <SiGoogleanalytics />,
    children: [
      {
        key: 'g1',
        label: 'Item 1',
        type: 'group',
        children: [
          { key: '1', label: 'Option 1' },
          { key: '2', label: 'Option 2' }
        ]
      },
      {
        key: 'g2',
        label: 'Item 2',
        type: 'group',
        children: [
          { key: '3', label: 'Option 3' },
          { key: '4', label: 'Option 4' }
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

const MainLayout = ({ children }: Props) => {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
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
        <Header style={{ padding: 0, background: 'none', borderBottom: '1px solid red' }}>
          <Button
            type='text'
            icon={collapsed ? <BiSolidCaretRightSquare size={25} /> : <BiSolidCaretLeftSquare size={25} />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64
            }}
          />
        </Header>
        <Content>{children}</Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
