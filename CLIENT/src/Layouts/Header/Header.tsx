import { IoNotifications } from 'react-icons/io5'
import logo from 'src/Assets/logo-mobile.png'
import './Header.scss'
import { Avatar, Badge } from 'antd'
import { useNavigate } from 'react-router'
import { pathRoutersUser } from 'src/Constants/path'
import { useQuery } from '@tanstack/react-query'
import userApi from 'src/Service/user/user.api'
const HeaderMain = () => {
  const navigate = useNavigate()

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
      </div>
      <div className='header-container__user'>
        <p className='header-container__user__name'>{dataMe?.data.result.name}</p>
        {!dataMe?.data.result.avatar && (
          <Avatar onClick={() => navigate(pathRoutersUser.userInformation)} size={50} src={logo} />
        )}
        {dataMe?.data.result.avatar && (
          <Avatar
            onClick={() => navigate(pathRoutersUser.userInformation)}
            size={50}
            src={dataMe?.data.result.avatar}
          />
        )}
      </div>
    </div>
  )
}

export default HeaderMain
