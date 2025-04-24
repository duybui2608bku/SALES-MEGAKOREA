import { Card, Divider, Space, Tag, Typography } from 'antd'
import { ServicesOfCardType } from 'src/Interfaces/services/services.interfaces'
import { DollarOutlined, TagOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
const { Title, Text } = Typography

interface PreviewServiceCardCreatedProp {
  serviceCardCreatedData: ServicesOfCardType
}

const PreviewServiceCardCreated = (props: PreviewServiceCardCreatedProp) => {
  const { serviceCardCreatedData } = props

  if (!serviceCardCreatedData) return null

  return (
    <Card
      key={serviceCardCreatedData._id}
      hoverable
      style={{
        flex: '0 0 240px',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid lightgray',
        background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)'
      }}
    >
      <div style={{ flexGrow: 1 }}>
        <Space direction='vertical' size='middle' style={{ width: '100%' }}>
          <Title level={5} style={{ margin: 0, color: '#2d3436', fontWeight: 600, lineHeight: '1.4' }}>
            {serviceCardCreatedData.name}
          </Title>

          <Divider style={{ margin: '2px 0', borderColor: '#e8ecef' }} />

          <Space align='center'>
            <DollarOutlined style={{ color: '#fa8c16', fontSize: '17px' }} />
            <Text strong style={{ fontSize: '15px', color: '#2d3436' }}>
              {serviceCardCreatedData.price.toLocaleString('vi-VN')} VNĐ
            </Text>
          </Space>

          <Space direction='vertical' size={8}>
            <Text strong style={{ fontSize: '12px', color: '#2d3436' }}>
              Dịch vụ:
            </Text>
            {serviceCardCreatedData.services_of_card.map((service, index) => (
              <Space key={index} align='center' style={{ width: '100%' }}>
                <Tag
                  color='cyan'
                  icon={<TagOutlined />}
                  style={{
                    fontSize: '10px',
                    padding: '4px 10px',
                    borderRadius: '10px',
                    background: '#e6f7ff',
                    border: 'none'
                  }}
                >
                  {service.service_details.name}
                </Tag>
                <Text type='secondary' style={{ fontSize: '10px' }}>
                  x{service.quantity}
                </Text>
              </Space>
            ))}
          </Space>

          <Divider style={{ margin: '2px 0', borderColor: '#e8ecef' }} />
          <Text type='secondary' style={{ fontSize: '10px' }}>
            Ngày tạo: {dayjs(serviceCardCreatedData.created_at).format('DD/MM/YYYY HH:mm')}
          </Text>
        </Space>
      </div>
    </Card>
  )
}

export default PreviewServiceCardCreated
