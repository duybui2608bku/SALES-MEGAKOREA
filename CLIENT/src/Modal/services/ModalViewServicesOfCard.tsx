import { Modal, Card, Descriptions, Tag, Typography, Space } from 'antd'
import { TypeCommision } from 'src/Constants/enum'
import { ServicesOfCard } from 'src/Interfaces/services/services.interfaces'
import { getRoleUser } from 'src/Utils/util.utils'

const { Title, Text } = Typography

interface ModalViewServicesOfCardProps {
  open: boolean
  onCancel: () => void
  data: ServicesOfCard[]
}

const ModalViewServicesOfCard = (props: ModalViewServicesOfCardProps) => {
  const { open, onCancel, data } = props
  console.log('data', data)
  return (
    <Modal
      title={
        <Title className='text-center' level={4}>
          Danh sách dịch vụ
        </Title>
      }
      open={open}
      onCancel={onCancel}
      onOk={onCancel}
      width={900}
      footer={null}
      centered
    >
      <Space direction='vertical' style={{ width: '100%', maxHeight: '80vh', overflowY: 'auto' }} size='large'>
        {data.map((service, index) => (
          <Card key={index} title={service.service_details.name} style={{ marginBottom: 16 }}>
            <Space direction='vertical' style={{ width: '100%' }}>
              {/* Thông tin cơ bản */}
              <Descriptions column={2} bordered size='small'>
                <Descriptions.Item label='Giá'>{service.price.toLocaleString()} VNĐ</Descriptions.Item>
                <Descriptions.Item label='Số lượng'>{service.quantity}</Descriptions.Item>
                <Descriptions.Item label='Giảm giá' style={{ color: 'red' }}>
                  {service?.discount ? service?.discount?.toLocaleString() : 0} VNĐ
                </Descriptions.Item>
                <Descriptions.Item label='Tổng'>
                  <Text type='success'>{service.total.toLocaleString()} VNĐ</Text>
                </Descriptions.Item>
                <Descriptions.Item label='Mã dịch vụ'>{service.service_details.code}</Descriptions.Item>
                <Descriptions.Item label='Trạng thái'>
                  <Tag color={service.service_details.is_active ? 'green' : 'red'}>
                    {service.service_details.is_active ? 'Hoạt động' : 'Không hoạt động'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label='Mô tả' span={2}>
                  {service.service_details.descriptions}
                </Descriptions.Item>
                <Descriptions.Item label='Số chi nhánh'>{service.service_details.branch.length}</Descriptions.Item>
              </Descriptions>

              {/* Các bước dịch vụ */}
              {/* <Card size='small' title='Các bước dịch vụ' style={{ marginTop: 16 }}>
                {service.service_details.step_services.map((step, stepIndex) => (
                  <Card
                    key={stepIndex}
                    hoverable={false}
                    style={{
                      width: '100%',
                      padding: 12,
                      marginBottom: 8,
                      boxShadow: 'none'
                    }}
                  >
                    <Descriptions size='small'>
                      <Descriptions.Item label='Mô tả'>{step.descriptions}</Descriptions.Item>
                      <Descriptions.Item label='Nhân viên'>{step.employee_details.name}</Descriptions.Item>
                      <Descriptions.Item label='Giá'>{step.commision.toLocaleString()} VNĐ</Descriptions.Item>
                      <Descriptions.Item label='Loại giá'>
                        <Tag color={step.type_step_price === TypeCommision.FIXED ? 'blue' : 'purple'}>
                          {step.type_step_price === TypeCommision.PRECENT ? 'Theo tỷ lệ' : 'Cố định'}
                        </Tag>
                      </Descriptions.Item>

                      <Descriptions.Item label='Vai trò'>
                        <Tag color='green'>{getRoleUser(step.employee_details.role)}</Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                ))}
              </Card> */}
            </Space>
          </Card>
        ))}
      </Space>
    </Modal>
  )
}

export default ModalViewServicesOfCard
