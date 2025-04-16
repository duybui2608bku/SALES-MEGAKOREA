import { useContext } from 'react'
import { AppContext } from 'src/Context/AppContext'
import { IoNotifications } from 'react-icons/io5'
import logo from 'src/Assets/logo-mobile.png'
import './Header.scss'
import { Avatar, Badge, Popconfirm } from 'antd'
import { FaSignOutAlt } from 'react-icons/fa'
import { clearLS } from 'src/Utils/localStorage'
import { useNavigate } from 'react-router'
import { pathRoutersUser } from 'src/Constants/path'
import { useQuery } from '@tanstack/react-query'
import userApi from 'src/Service/user/user.api'
const HeaderMain = () => {
  const { profile, reset } = useContext(AppContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    reset()
    clearLS()
  }

  const { data: dataMe } = useQuery({
    queryKey: ['getMe'],
    queryFn: async () => {
      const response = await userApi.getUser()
      return response
    }
  })

  return (
    <div className='header-container'>
      <div className='header-container__icon'>
        <Badge count={8} overflowCount={5}>
          <IoNotifications size={30} />
        </Badge>
        <Popconfirm
          title='Bạn có chắc chắn muốn đăng xuất không ?'
          onConfirm={handleLogout}
          onCancel={() => null}
          okText='Có'
          cancelText='Không'
        >
          <FaSignOutAlt size={30} />
        </Popconfirm>
      </div>
      <div className='header-container__user'>
        <p className='header-container__user__name'>{profile?.name}</p>
        {!dataMe?.data.result[0].avatar && (
          <Avatar onClick={() => navigate(pathRoutersUser.userInformation)} size={50} src={logo} />
        )}
        {dataMe?.data.result[0].avatar && (
          <Avatar
            onClick={() => navigate(pathRoutersUser.userInformation)}
            size={50}
            src={dataMe?.data.result[0].avatar}
          />
        )}
      </div>
    </div>
  )
}

export default HeaderMain
