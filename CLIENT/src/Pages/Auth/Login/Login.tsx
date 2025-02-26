import './Login.scss'
import background from '../../../Assets/bg.jpg'
import { Button, Form, FormProps, Input, Switch } from 'antd'
import { FaUser, FaLock } from 'react-icons/fa'
import { useNavigate } from 'react-router'
import { AppContext } from 'src/Context/AppContext'
import { useContext, useState } from 'react'
import { AxiosError } from 'axios'
import { setProfileFromLS } from 'src/Utils/localStorage'
import { authApi } from 'src/Service/auth/auth.api'

type FieldType = {
  email: string
  password: string
}

type ErrorType = {
  errors: {
    [key: string]: { msg: string }
  }
}

const Login = () => {
  const nagivate = useNavigate()
  const { setIsAuthenticated, notificationApi } = useContext(AppContext)
  const [isLoad, setIsLoad] = useState(false)

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    setIsLoad(true)
    try {
      const result = await authApi.login(values)
      if (result.data.success) {
        setIsAuthenticated(true)
        setProfileFromLS(result.data.result.user)
        window.location.reload()
        nagivate('/')
      }
    } catch (error: unknown) {
      const err = error as AxiosError<ErrorType>
      const errObj = err.response?.data.errors
      if (errObj) {
        const errorMessages = Object.keys(errObj).map((key) => errObj[key].msg)
        notificationApi?.error({
          message: (
            <>
              {errorMessages.map((msg, index) => (
                <span key={index}>
                  {msg}
                  <br />
                </span>
              ))}
            </>
          ),
          showProgress: true,
          pauseOnHover: true
        })
      } else {
        notificationApi?.error({
          message: 'Đã xảy ra lỗi không xác định!'
        })
      }
    } finally {
      setIsLoad(false)
    }
  }

  return (
    <div
      className='login-container'
      style={{
        backgroundImage: `url('${background}')`
      }}
    >
      <div className='login-container__content'>
        <h1 className='login-container__content__title'>Đăng Nhập</h1>
        <Form name='login' layout='vertical' initialValues={{ remember: true }} onFinish={onFinish} autoComplete='off'>
          <Form.Item<FieldType>
            label='Email'
            name='email'
            rules={[{ required: true, message: 'Vui lòng nhập email!', type: 'email' }]}
          >
            <Input prefix={<FaUser />} />
          </Form.Item>
          <Form.Item<FieldType>
            label='Mật khẩu'
            name='password'
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<FaLock />} />
          </Form.Item>
          <div className='login-container__content__sw'>
            Nhớ tài khoản
            <Switch loading={isLoad} defaultChecked />
          </div>
          <Form.Item>
            <Button loading={isLoad} type='primary' htmlType='submit' style={{ width: '100%', padding: '20px 0' }}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default Login
