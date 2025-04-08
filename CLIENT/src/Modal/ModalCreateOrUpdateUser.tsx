import { Button, Col, Form, Input, message, Modal, Row, Select, Switch, Typography, Upload } from 'antd'
import { CreateUserRequestBody, UserGeneralInterface } from 'src/Interfaces/user.interface'
import { UploadOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import userApi from 'src/Service/user/user.api'
import { queryClient } from 'src/main'
import { RoleUser } from 'src/Constants/enum'

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
  branch?: string[]
  created_at: Date
  updated_at?: Date
}

const ModalCreateOrUpdateUser = (props: ModalCreateOrUpdateUserProps) => {
  const { open, close, userToEdit, setUserToEdit } = props
  const [form] = Form.useForm()

  // Func create a new user
  const { mutate: createUser, isPending: isCreating } = useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      message.success('Tạo nhân viên thành công!')
      queryClient.invalidateQueries({ queryKey: ['getUsersGeneral'] })
      form.resetFields()
    }
  })

  const handleCreateUser = (values: FieldsType) => {
    const created_at = new Date()
    const user: CreateUserRequestBody = { ...values, created_at }
    createUser(user)
  }

  const onFinish = (values: FieldsType) => {
    console.log('values: ', values)
    console.log('values role: ', values.role)
    try {
      handleCreateUser(values)
    } catch (error) {
      message.error('Đã xảy ra lỗi không xác định!')
    }
  }

  const handleCancelModal = () => {
    close(false)
    form.resetFields()
  }

  return (
    <Modal
      open={open}
      onCancel={handleCancelModal}
      width={800}
      centered
      cancelText='Huỷ'
      okText='Tạo'
      onOk={() => form.submit()}
      confirmLoading={isCreating}
    >
      <Row>
        <Col span={24}>
          <Typography.Title level={4} className='center-div'>
            Tạo nhân viên mới
          </Typography.Title>
        </Col>
        <Col span={24} style={{ marginTop: 20 }}>
          <Form onFinish={onFinish} autoComplete='off' layout='vertical' name='create-update-user' form={form}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name='name'
                  label='Tên nhân viên'
                  rules={[{ required: true, message: 'Vui lòng nhập tên nhân viên!' }]}
                >
                  <Input placeholder='Nhập tên nhân viên' />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name='email' label='Email nhân viên'>
                  <Input placeholder='Nhập email nhân viên' />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name='role' label='Vai trò nhân viên' initialValue={RoleUser.USER}>
                  <Select
                    options={[
                      { value: RoleUser.ACCOUNTANT, label: 'Kế toán' },
                      { value: RoleUser.MANAGER, label: 'Giám đốc' },
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
              <Col span={8}>
                <Form.Item name='branch' label='Chi nhánh'>
                  <Input placeholder='Chọn chi nhánh' />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name='avatar' label='Avatar' valuePropName='fileList'>
                  <Upload action='https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload' listType='picture'>
                    <Button
                      style={{ backgroundColor: 'white', color: '#000', border: '1px solid lightgray' }}
                      type='primary'
                      icon={<UploadOutlined />}
                    >
                      Upload
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item valuePropName='checked' name='status' label='Trạng thái'>
                  <Switch />
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
