import { Button, Col, Form, Input, message, Modal, Radio, Row, Select, Switch, Tooltip, Typography, Upload } from 'antd'
import { CreateUserRequestBody, UpdateUserBody, UserGeneralInterface } from 'src/Interfaces/user.interface'
import { CheckCircleOutlined, CloseCircleOutlined, UploadOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import userApi from 'src/Service/user/user.api'
import { queryClient } from 'src/main'
import { RoleUser, UserStatus } from 'src/Constants/enum'
import { useEffect } from 'react'
import createOptimisticUpdateHandler from 'src/Function/product/createOptimisticUpdateHandler'
import HttpStatusCode from 'src/Constants/httpCode'
import StatusUserComponent from './components/StatusUserComponent'
import { values } from 'lodash'

interface ModalCreateOrUpdateUserProps {
  open: boolean
  close: (value: boolean) => void
  userToEdit?: UserGeneralInterface | null
  setUserToEdit?: (value: UserGeneralInterface | null) => void
}

interface FieldsType {
  name: string
  email: string
  avatar?: string
  role?: number
  status?: number
  branch?: string
  created_at: Date
  updated_at?: Date
}

const ModalCreateOrUpdateUser = (props: ModalCreateOrUpdateUserProps) => {
  const { open, close, userToEdit, setUserToEdit } = props
  const [form] = Form.useForm()

  // Fetch data user to edit
  useEffect(() => {
    if (userToEdit) {
      const formattedDataUser = {
        ...userToEdit,
        avatar: userToEdit.avatar === '' && [],
        status: userToEdit.status === UserStatus.ACTIVE,
        branch: userToEdit.branch || [],
        updated_at: new Date()
      }
      form.setFieldsValue(formattedDataUser)
    } else {
      form.resetFields()
    }
  }, [userToEdit, form])

  // Func create a new user
  const { mutate: createUser, isPending: isCreating } = useMutation({
    mutationFn: userApi.createUser,
    onMutate: async () => {
      return createOptimisticUpdateHandler(queryClient, ['getUsersGeneral'])()
    },
    onSuccess: () => {
      message.success('Tạo nhân viên thành công!')
      queryClient.invalidateQueries({ queryKey: ['getUsersGeneral'] })
      form.resetFields()
      close(false)
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(['getUsersGeneral'], context?.previousData)
      const errorMsg = error.message.includes(String(HttpStatusCode.BadRequest))
        ? 'Dữ liệu không hợp lệ!'
        : error.message.includes(`${HttpStatusCode.Unauthorized}`)
          ? 'Bạn không có quyền thực thi hành động này!'
          : `Lỗi khi tạo nhân viên: ${error.message}`
      message.error(errorMsg)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['getUsersGeneral'] })
    },
    retry: 2
  })

  // Func update user
  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: (data: UpdateUserBody) => userApi.updateUser(data),
    onMutate: async () => {
      return createOptimisticUpdateHandler(queryClient, ['getUsersGeneral'])()
    },
    onSuccess: () => {
      message.success('Cập nhật nhân viên thành công!')
      form.resetFields()
      setUserToEdit?.(null)
      close(false)
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(['getUsersGeneral'], context?.previousData)
      const errorMsg = error.message.includes(`${HttpStatusCode.BadRequest}`)
        ? 'Dữ liệu không hợp lệ!'
        : error.message.includes(`${HttpStatusCode.NotFound}`)
          ? 'Nhân viên không tồn tại!'
          : `Lỗi khi cập nhật nhân viên: ${error.message}`
      message.error(errorMsg)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['getUsersGeneral'] })
    },
    retry: 2
  })

  const handleCreateUser = (values: FieldsType) => {
    const created_at = new Date()
    const status = values.status ? UserStatus.ACTIVE : UserStatus.INACTIVE
    const avatar = !values.avatar || values.avatar.length === 0 ? '' : values.avatar
    const user: CreateUserRequestBody = { ...values, avatar, status, created_at }
    createUser(user)
  }

  const handleUpdateUser = (values: FieldsType) => {
    if (!userToEdit || !userToEdit.id) {
      message.error('Không thể cập nhật nhân viên: UserID không hợp lệ!')
      setUserToEdit?.(null)
      return
    }
    const updated_at = new Date()
    const status = values.status ? UserStatus.ACTIVE : UserStatus.INACTIVE
    const avatar = !values.avatar || values.avatar.length === 0 ? '' : values.avatar
    const userUpdate: UpdateUserBody = {
      ...values,
      id: userToEdit.id,
      status: status,
      avatar: avatar,
      updated_at: updated_at
    }
    updateUser(userUpdate)
  }

  const onFinish = (values: FieldsType) => {
    try {
      if (userToEdit) {
        handleUpdateUser(values)
      } else {
        handleCreateUser(values)
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi không xác định!')
    }
  }

  const handleCancelModal = () => {
    close(false)
    // form.resetFields()
    setUserToEdit?.(null)
  }

  const handleTest = (value: string[]) => {
    console.log('value: ', value)
  }

  // Sự kiện loading
  const isPending = isCreating || isUpdating

  return (
    <Modal
      // open={open}
      open={true}
      onCancel={handleCancelModal}
      width='90%'
      style={{ maxWidth: 800 }}
      centered
      okText={userToEdit ? 'Cập nhật' : 'Tạo'}
      cancelText='Huỷ'
      onOk={() => form.submit()}
      confirmLoading={isPending}
    >
      <Row>
        <Col span={24}>
          <Typography.Title style={{ textAlign: 'center' }} level={4} className='center-div'>
            {userToEdit ? 'Chỉnh sửa thông tin nhân viên' : 'Tạo nhân viên mới'}
          </Typography.Title>
        </Col>
        <Col span={24} style={{ marginTop: 20 }}>
          <Form onFinish={onFinish} autoComplete='off' layout='vertical' name='create-update-user' form={form}>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name='name'
                  label='Tên nhân viên'
                  rules={[{ required: true, message: 'Vui lòng nhập tên nhân viên!' }]}
                >
                  <Input placeholder='Nhập tên nhân viên' />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  rules={[
                    { required: true, message: 'Vui lòng nhập email nhân viên!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                  name='email'
                  label='Email nhân viên'
                >
                  <Input placeholder='Nhập email nhân viên' />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  style={{ width: '100%' }}
                  name='avatar'
                  label='Avatar'
                  valuePropName='fileList'
                  getValueFromEvent={(e) => {
                    if (Array.isArray(e)) return e
                    return e?.fileList
                  }}
                >
                  <Upload
                    style={{ display: 'block', width: '100%' }}
                    name='file'
                    onChange={(infor) => {
                      if (infor.file.status === 'done') {
                        message.success(`${infor.file.name} đã tải lên thành công!`)
                      } else if (infor.file.status === 'error') {
                        console.log('infor.file: ', infor.file.status)
                        message.error(`${infor.file.name} tải lên thất bại!`)
                      }
                    }}
                    maxCount={1}
                    // action='https://www.mocky.io/v2/5cc8019d300000980a055e76'
                    action='https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload'
                    listType='picture'
                    beforeUpload={() => true}
                  >
                    <Button
                      block
                      style={{
                        fontSize: '12px',
                        backgroundColor: 'white',
                        color: '#000',
                        border: '1px solid lightgray'
                      }}
                      type='primary'
                      icon={<UploadOutlined />}
                    >
                      Click to upload
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name='role' label='Vai trò nhân viên' initialValue={RoleUser.USER}>
                  <Select
                    showSearch
                    options={[
                      { value: RoleUser.ACCOUNTANT, label: 'Kế toán' },
                      { value: RoleUser.MANAGER, label: 'Quản lý' },
                      { value: RoleUser.SALE, label: 'Saler' },
                      { value: RoleUser.TECHNICAN_MASTER, label: 'Kỹ sư' },
                      { value: RoleUser.TECHNICIAN, label: 'Kỹ thuật viên' },
                      { value: RoleUser.USER, label: 'Khách hàng' }
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name='branch' label='Chi nhánh'>
                  <Select
                    showSearch
                    onChange={handleTest}
                    placeholder='Chọn chi nhánh'
                    options={[
                      { value: 'Quảng Bình', label: 'Quảng Bình' },
                      { value: 'Huế', label: 'Huế' },
                      { value: 'Quảng Trị', label: 'Quảng Trị' },
                      { value: 'Buôn Ma Thuột', label: 'Buôn Ma Thuột' },
                      { value: 'Cà Mau', label: 'Cà Mau' },
                      { value: 'Phan Thiết', label: 'Phan Thiết' },
                      { value: 'Nha Trang', label: 'Nha Trang' },
                      { value: 'Medicare NT', label: 'Medicare NT' },
                      { value: 'Đà Nẵng', label: 'Đà Nẵng' }
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name='status' label='Trạng thái'>
                  {/* <Switch defaultChecked /> */}
                  <Radio.Group
                    defaultValue={UserStatus.ACTIVE}
                    options={[
                      {
                        label: (
                          <Tooltip title='Hoạt động'>
                            <CheckCircleOutlined />
                          </Tooltip>
                        ),
                        value: UserStatus.ACTIVE
                      },
                      {
                        label: (
                          <Tooltip title='Không hoạt động'>
                            <CloseCircleOutlined style={{ color: 'red' }} />
                          </Tooltip>
                        ),
                        value: UserStatus.INACTIVE
                      }
                    ]}
                    block
                    optionType='button'
                    buttonStyle='solid'
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Modal>
  )
}

export default ModalCreateOrUpdateUser
