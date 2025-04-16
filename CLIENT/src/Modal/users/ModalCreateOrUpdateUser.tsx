import { Image, Col, Form, Input, message, Modal, Radio, Row, Select, Tooltip, Typography } from 'antd'
import { CreateUserRequestBody, UpdateUserRequestBody, UserGeneralInterface } from 'src/Interfaces/user/user.interface'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone
} from '@ant-design/icons'
import { BarLoader } from 'react-spinners'
import { RiAiGenerate } from 'react-icons/ri'
import { useMutation, useQuery } from '@tanstack/react-query'
import userApi from 'src/Service/user/user.api'
import { queryClient } from 'src/main'
import { RoleUser, UserStatus } from 'src/Constants/enum'
import { Fragment, useEffect, useState } from 'react'
import createOptimisticUpdateHandler from 'src/Function/product/createOptimisticUpdateHandler'
import HttpStatusCode from 'src/Constants/httpCode'
import { generatePassword } from 'src/Utils/generatePassword'
import UploadAvatar from './components/uploadAvatar'
import OptionsBranchUser from 'src/Components/OptionsBranchUser'
const Text = Typography

interface ModalCreateOrUpdateUserProps {
  open: boolean
  close: (value: boolean) => void
  userToEdit?: UserGeneralInterface | null
  setUserToEdit?: (value: UserGeneralInterface | null) => void
}

const STALETIME = 5 * 50 * 1000

interface FieldsType {
  name: string
  email: string
  password: string
  passwordConfirm: string
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
  const [imageUrl, setImageUrl] = useState('')
  const [isPendingAvatar, setIsPendingAvatar] = useState(false)

  // Check role user
  const { data: dataUser } = useQuery({
    queryKey: ['getUser'],
    queryFn: async () => {
      const response = await userApi.getUser()
      return response
    },
    staleTime: STALETIME
  })

  // Fetch data user to edit
  useEffect(() => {
    if (userToEdit) {
      form.setFieldsValue(userToEdit)
      setImageUrl(userToEdit.avatar)
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
    mutationFn: (data: UpdateUserRequestBody) => userApi.updateUser(data),
    onMutate: async () => {
      return createOptimisticUpdateHandler(queryClient, ['getUsersGeneral'])()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getMe'] })
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

  const handleDeleteAvatar = () => {
    setImageUrl('')
  }

  // Check password và password-confirm
  const passValue = Form.useWatch('password', form)
  const passConfirmValue = Form.useWatch('password-confirm', form)

  // Hàm generate password
  const handleGeneratePassword = () => {
    const password = generatePassword()

    form.setFieldsValue({
      password: password,
      passwordConfirm: password
    })

    // Copy password vào Clipboard
    navigator.clipboard.writeText(password).then(() => {
      message.success('Mật khẩu đã được sao chép vào clipboard!')
    })
  }

  // Hàm tạo nhân viên mới
  const handleCreateUser = (values: FieldsType) => {
    // Check password và password-confirm
    if (passConfirmValue && passConfirmValue !== passValue) {
      message.error('Mật khẩu bạn nhập không khớp!')
      return
    }
    const avatar = !imageUrl ? '' : imageUrl
    const user: CreateUserRequestBody = { ...values, avatar }
    createUser(user)
  }

  // Hàm sửa đổi thông tin nhân viên
  const handleUpdateUser = (values: FieldsType) => {
    if (!userToEdit || !userToEdit._id) {
      message.error('Không thể cập nhật nhân viên: UserID không hợp lệ!')
      setUserToEdit?.(null)
      return
    }
    const avatar = !imageUrl ? '' : imageUrl
    const userUpdate: UpdateUserRequestBody = {
      ...values,
      _id: userToEdit._id,
      avatar: avatar,
      branch: form.getFieldValue('branch')
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
    setUserToEdit?.(null)
    setImageUrl('')
  }

  // Sự kiện loading
  const isPending = isCreating || isUpdating

  return (
    <Modal
      open={open}
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
                  label='Email'
                >
                  <Input placeholder='Nhập email' />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name='branch' label='Chi nhánh'>
                  <OptionsBranchUser
                    mode={undefined}
                    initialValue={userToEdit?.branch.name}
                    placeholder={userToEdit ? 'Chọn chi nhánh' : 'Chọn chi nhánh'}
                    search
                    onchange={(value) => form.setFieldsValue({ branch: value })}
                  />
                </Form.Item>
              </Col>
            </Row>
            {/* 
              - Nếu tài khoản là ADMIN: Khi mở Modal Edit NHÂN VIÊN sẽ hiển thị 2 ô input [password, password-confirm] 
              - Không phân biệt RoleUser: Khi không tồn tại userToEdit(giá trị để mở Modal Edit NHÂN VIÊN) 
                => Modal Create NHÂN VIÊN mặc định hiển thị 2 ô input [password, password-confirm]
            */}
            {((dataUser?.data.result[0].role == RoleUser.ADMIN && userToEdit) || !userToEdit) && (
              <>
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      rules={
                        userToEdit ? [{ required: false }] : [{ required: true, message: 'Vui lòng nhập mật khẩu!' }]
                      }
                      name='password'
                      label='Mật khẩu'
                    >
                      <Input.Password
                        prefix={
                          <Tooltip title='Tạo mật khẩu tự động'>
                            <RiAiGenerate
                              style={{ cursor: 'pointer', color: 'purple' }}
                              onClick={handleGeneratePassword}
                            />
                          </Tooltip>
                        }
                        placeholder='Nhập mật khẩu'
                        iconRender={(visivle) => (visivle ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      rules={
                        userToEdit
                          ? [{ required: false }]
                          : [{ required: true, message: 'Vui lòng nhập lại mật khẩu!' }]
                      }
                      name='passwordConfirm'
                      label='Nhập lại mật khẩu'
                    >
                      <Input.Password
                        placeholder='Nhập lại mật khẩu'
                        iconRender={(visivle) => (visivle ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name='role' label='Vai trò' initialValue={RoleUser.USER}>
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
                </Row>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item style={{ width: '100%' }} name='avatar' label='Avatar'>
                      <UploadAvatar setImageUrl={setImageUrl} setIsPendingUploadAvatar={setIsPendingAvatar} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name='status' label='Trạng thái' initialValue={UserStatus.ACTIVE}>
                      <Radio.Group
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
                                <CloseCircleOutlined />
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
              </>
            )}
            {/* Nếu tài khoản không phải là ADMIN: Khi mở Modal Edit NHÂN VIÊN sẽ không hiển thị 2 ô input [password, password-confỉrm]  */}
            {dataUser?.data.result[0].role != RoleUser.ADMIN && userToEdit && (
              <>
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item name='role' label='Vai trò' initialValue={RoleUser.USER}>
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
                    <Form.Item style={{ width: '100%' }} name='avatar' label='Avatar'>
                      <UploadAvatar setImageUrl={setImageUrl} setIsPendingUploadAvatar={setIsPendingAvatar} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name='status' label='Trạng thái' initialValue={UserStatus.ACTIVE}>
                      <Radio.Group
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
                                <CloseCircleOutlined />
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
              </>
            )}

            {isPendingAvatar && <BarLoader color='#1677ff' loading={true} width={'100%'} />}
            {imageUrl && (
              <Fragment>
                <Text style={{ marginBottom: '8px' }}>Preview</Text>
                <Row
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,15%)',
                    gap: '20px',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Col>
                    <Image
                      preview={{ src: imageUrl }}
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                      width={'100px'}
                      height={'100px'}
                      src={imageUrl}
                    />
                  </Col>
                  <Col>{imageUrl}</Col>
                  <Col style={{ paddingRight: '20px' }}>
                    <DeleteOutlined style={{ color: 'lightred' }} onClick={handleDeleteAvatar} />
                  </Col>
                </Row>
              </Fragment>
            )}
          </Form>
        </Col>
      </Row>
    </Modal>
  )
}

export default ModalCreateOrUpdateUser
