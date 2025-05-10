import {
  Modal,
  Form,
  InputNumber,
  Row,
  Col,
  Typography,
  Button,
  message,
  Space,
  Divider,
  Card,
  Avatar,
  Tag
} from 'antd'
import { useEffect, useState } from 'react'
import { GetServicesCardSoldOfCustomer } from 'src/Interfaces/services/services.interfaces'
import commisionSaleApi from 'src/Service/commision/commision.sale.api'
import { servicesApi } from 'src/Service/services/services.api'
import { useQuery } from '@tanstack/react-query'
import { UserWithRole } from 'src/Types/user/user.type'
import userApi from 'src/Service/user/user.api'
import { queryClient } from 'src/main'
import OptionsGetUsersWithRole from 'src/Components/OptionsGetUsersWithRole'
import {
  UserAddOutlined,
  DollarOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  CreditCardOutlined,
  UserOutlined,
  WalletOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

interface ModalCommissionDistributionProps {
  open: boolean
  onClose: () => void
  serviceCardData: GetServicesCardSoldOfCustomer | null
}

type UserCommission = {
  user_id: string
  name: string
  commission: number
}

const ModalCommissionDistribution = ({ open, onClose, serviceCardData }: ModalCommissionDistributionProps) => {
  const [form] = Form.useForm()
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [userCommissions, setUserCommissions] = useState<UserCommission[]>([])
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [commissionAmount, setCommissionAmount] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [totalDistribution, setTotalDistribution] = useState(0)

  const { data: usersData } = useQuery({
    queryKey: ['getAllUsers'],
    queryFn: () => userApi.getUsersWithRole(0), // 0 = all users except admin
    enabled: open
  })

  useEffect(() => {
    if (usersData?.data?.result) {
      setUsers(usersData.data.result)
    }
  }, [usersData])

  useEffect(() => {
    if (open) {
      setUserCommissions([])
      setTotalDistribution(0)
      form.resetFields()
    }
  }, [open, form])

  const handleCommissionChange = (value: number | null) => {
    setCommissionAmount(value || 0)
  }

  const handleAddCommission = () => {
    if (!selectedUser || commissionAmount <= 0) {
      message.warning('Vui lòng chọn nhân viên và nhập số tiền hoa hồng hợp lệ')
      return
    }

    const selectedUserData = users.find((user) => user._id === selectedUser)
    if (!selectedUserData) return

    // Check if this user already has a commission entry
    const existingUserIndex = userCommissions.findIndex((uc) => uc.user_id === selectedUser)

    if (existingUserIndex >= 0) {
      // Update existing entry
      const newUserCommissions = [...userCommissions]
      newUserCommissions[existingUserIndex].commission = commissionAmount
      setUserCommissions(newUserCommissions)
    } else {
      // Add new entry
      setUserCommissions([
        ...userCommissions,
        {
          user_id: selectedUser,
          name: selectedUserData.name,
          commission: commissionAmount
        }
      ])
    }

    // Reset inputs
    setSelectedUser('')
    setCommissionAmount(0)
    form.setFieldsValue({ user_id: undefined, commission: undefined })
  }

  const removeUserCommission = (userId: string) => {
    setUserCommissions(userCommissions.filter((uc) => uc.user_id !== userId))
  }

  useEffect(() => {
    // Calculate total distribution
    const total = userCommissions.reduce((sum, item) => sum + item.commission, 0)
    setTotalDistribution(total)
  }, [userCommissions])

  const validateDistribution = (): boolean => {
    if (!serviceCardData) return false

    // Check if total distribution is greater than price_paid
    const pricePaid = serviceCardData.price_paid || 0
    if (totalDistribution > pricePaid) {
      message.error(
        `Tổng số tiền chia không được vượt quá số tiền đã thanh toán (${pricePaid.toLocaleString('vi-VN')} VNĐ)`
      )
      return false
    }

    if (userCommissions.length === 0) {
      message.error('Vui lòng thêm ít nhất một nhân viên để chia hoa hồng')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!serviceCardData || !validateDistribution()) return

    try {
      setLoading(true)

      // Create commission records for each employee
      const commissionsPromises = userCommissions.map((userCommission) =>
        commisionSaleApi.createCommisionSeller({
          user_id: userCommission.user_id,
          commision: userCommission.commission,
          date: new Date(),
          services_card_sold_of_customer_id: serviceCardData._id
        })
      )

      const results = await Promise.all(commissionsPromises)

      // Extract insertedIds
      const commissionIds = results.map((result) => result.data.result.insertedId)

      // Update service card with employee commissions
      await servicesApi.updateServicesCardSoldOfCustomer({
        _id: serviceCardData._id,
        employee_commision_id: commissionIds
      })

      message.success('Phân chia hoa hồng thành công')
      queryClient.invalidateQueries({ queryKey: ['services-card-sold-customer'] })
      onClose()
    } catch (error) {
      console.error('Error distributing commission:', error)
      message.error('Có lỗi xảy ra khi phân chia hoa hồng')
    } finally {
      setLoading(false)
    }
  }

  const maxAvailableAmount = serviceCardData?.price_paid || 0
  const remainingAmount = maxAvailableAmount - totalDistribution
  const percentUsed = maxAvailableAmount > 0 ? (totalDistribution / maxAvailableAmount) * 100 : 0

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>
            <TeamOutlined /> Chia Doanh Số Dịch Vụ
          </Title>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={700}
      footer={null}
      destroyOnClose
      centered
      bodyStyle={{
        padding: '24px',
        backgroundColor: '#f7fafc'
      }}
    >
      {serviceCardData && (
        <div style={{ maxHeight: '80vh', overflowY: 'scroll' }}>
          <Card
            bordered={false}
            style={{
              marginBottom: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
            }}
          >
            <Row gutter={[16, 16]}>
              <Col span={18}>
                <Space direction='vertical' style={{ width: '100%', color: 'white' }}>
                  <div>
                    <Text strong style={{ color: 'white', fontSize: '16px', display: 'block' }}>
                      <UserOutlined style={{ marginRight: 8 }} />
                      {serviceCardData.customers?.name}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
                      {serviceCardData.customers?.phone}
                    </Text>
                  </div>
                  <div>
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', display: 'block' }}>
                      <CreditCardOutlined style={{ marginRight: 8 }} />
                      Mã thẻ:{' '}
                      <Tag color='volcano' style={{ marginLeft: 4 }}>
                        {serviceCardData.code}
                      </Tag>
                    </Text>
                  </div>
                  <div>
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                      <WalletOutlined style={{ marginRight: 8 }} />
                      Đã thanh toán:{' '}
                      <Tag color='green' style={{ marginLeft: 4 }}>
                        {(serviceCardData.price_paid || 0).toLocaleString('vi-VN')} VNĐ
                      </Tag>
                    </Text>
                  </div>
                </Space>
              </Col>
              <Col span={6} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Avatar
                  size={80}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: '#e0f2fe',
                    color: '#3B82F6',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
              </Col>
            </Row>
          </Card>

          <Card
            title={
              <Text strong>
                <UserAddOutlined /> Thêm Nhân Viên
              </Text>
            }
            bordered={false}
            style={{
              marginBottom: 24,
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
            }}
          >
            <Form form={form} layout='vertical'>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name='user_id'
                    label='Chọn nhân viên'
                    rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
                  >
                    <OptionsGetUsersWithRole
                      placeholder='Chọn nhân viên'
                      onchange={(value) => setSelectedUser(value)}
                      search={true}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name='commission'
                    label='Số tiền hoa hồng'
                    rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value): number => {
                        if (!value) return 0
                        const parsedValue = value.replace(/\$\s?|(,*)/g, '')
                        return Number(parsedValue)
                      }}
                      onChange={handleCommissionChange}
                      min={0}
                      max={maxAvailableAmount}
                      prefix={<DollarOutlined />}
                    />
                  </Form.Item>
                </Col>
                <Col span={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Button
                    type='primary'
                    onClick={handleAddCommission}
                    style={{ width: '100%', background: '#3B82F6', borderColor: '#3B82F6' }}
                    icon={<UserAddOutlined />}
                  >
                    Thêm
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card
            title={
              <Text strong>
                <TeamOutlined /> Danh Sách Chia Hoa Hồng
              </Text>
            }
            bordered={false}
            style={{
              marginBottom: 24,
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
            }}
          >
            {userCommissions.length > 0 ? (
              <div>
                {userCommissions.map((item, index) => (
                  <Card
                    key={index}
                    size='small'
                    style={{
                      marginBottom: 12,
                      borderRadius: '4px',
                      borderLeft: '4px solid #3B82F6'
                    }}
                  >
                    <Row gutter={16} align='middle'>
                      <Col span={2}>
                        <Avatar style={{ backgroundColor: '#3B82F6' }} icon={<UserOutlined />} />
                      </Col>
                      <Col span={10}>
                        <Text strong>{item.name}</Text>
                      </Col>
                      <Col span={8}>
                        <Tag color='blue' style={{ padding: '4px 8px', fontSize: '14px' }}>
                          <DollarOutlined /> {item.commission.toLocaleString('vi-VN')} VNĐ
                        </Tag>
                      </Col>
                      <Col span={4} style={{ textAlign: 'right' }}>
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          size='small'
                          onClick={() => removeUserCommission(item.user_id)}
                          shape='circle'
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}

                <Divider style={{ margin: '16px 0' }} />

                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd'
                  }}
                >
                  <Row style={{ marginBottom: 8 }}>
                    <Col span={12}>
                      <Text strong style={{ fontSize: '15px' }}>
                        Tổng cộng:
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text
                        strong
                        style={{
                          fontSize: '15px',
                          color: totalDistribution > maxAvailableAmount ? '#ef4444' : '#10b981'
                        }}
                      >
                        {totalDistribution > maxAvailableAmount ? <CloseCircleOutlined /> : <CheckCircleOutlined />}{' '}
                        {totalDistribution.toLocaleString('vi-VN')} VNĐ
                      </Text>
                    </Col>
                  </Row>

                  <Row>
                    <Col span={12}>
                      <Text style={{ fontSize: '14px' }}>Còn lại:</Text>
                    </Col>
                    <Col span={12}>
                      <Text style={{ fontSize: '14px' }}>
                        {remainingAmount.toLocaleString('vi-VN')} VNĐ ({Math.round(percentUsed)}%)
                      </Text>
                    </Col>
                  </Row>

                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        height: '8px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(percentUsed, 100)}%`,
                          height: '100%',
                          backgroundColor: percentUsed > 100 ? '#ef4444' : percentUsed > 75 ? '#f59e0b' : '#10b981',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '32px 0',
                  background: '#f9fafb',
                  borderRadius: '8px'
                }}
              >
                <TeamOutlined style={{ fontSize: '32px', color: '#94a3b8', marginBottom: 8 }} />
                <Text type='secondary' style={{ display: 'block' }}>
                  Chưa có nhân viên được chia hoa hồng
                </Text>
                <Text type='secondary' style={{ fontSize: '13px' }}>
                  Vui lòng thêm ít nhất một nhân viên
                </Text>
              </div>
            )}
          </Card>

          <Row justify='end' style={{ marginTop: 16 }}>
            <Space>
              <Button onClick={onClose} icon={<CloseCircleOutlined />}>
                Hủy
              </Button>
              <Button
                type='primary'
                onClick={handleSubmit}
                loading={loading}
                disabled={totalDistribution <= 0 || totalDistribution > maxAvailableAmount}
                icon={<CheckCircleOutlined />}
                style={{
                  background: '#10b981',
                  borderColor: '#10b981'
                }}
              >
                Xác nhận
              </Button>
            </Space>
          </Row>
        </div>
      )}
    </Modal>
  )
}

export default ModalCommissionDistribution
