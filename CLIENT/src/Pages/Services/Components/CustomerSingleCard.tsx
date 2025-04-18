import React from 'react'
import { Card, Avatar, Typography, Tag, Space, Divider, Tooltip } from 'antd'
import { CalendarOutlined, PhoneOutlined, FacebookOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography

// Interface cho dữ liệu khách hàng
interface CustomerData {
  branch: string
  date: string
  name: string
  phone: string
  social_media: string
  sex: string
  service: string[]
  schedule: string
  status_data: string
}

// Props cho component
interface CustomerSingleCardProps {
  data: CustomerData
}

const CustomerSingleCard: React.FC<CustomerSingleCardProps> = ({ data }) => {
  if (!data) return null

  const { branch, date, name, phone, social_media, sex, service, schedule, status_data } = data

  return (
    <Card
      hoverable
      style={{
        width: '100%', // Giới hạn max-width để không quá rộng trên màn hình lớn
        margin: '0 auto', // Căn giữa card,
        height: '100%',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid #e8ecef',
        background: 'linear-gradient(145deg, #f6f9fc 0%, #ffffff 100%)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}
      bodyStyle={{
        padding: '30px'
      }}
    >
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        {/* Header with Avatar and Name */}
        <Space align='center' size='large' style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }}>
          <Space>
            <Avatar
              size={80}
              icon={<UserOutlined />}
              style={{
                backgroundColor: sex === 'Nữ' ? '#ff6b9d' : '#40c4ff',
                border: '3px solid #fff',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            />
            <div>
              <Title
                level={3}
                style={{
                  margin: 0,
                  color: '#2d3436',
                  fontWeight: 600,
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2
                }}
              >
                {name}
              </Title>
              <Text type='secondary' style={{ fontSize: '16px' }}>
                {sex}
              </Text>
            </div>
          </Space>
          <Tag
            color={status_data === 'Số mới' ? 'green' : 'geekblue'}
            style={{
              fontSize: '14px',
              padding: '6px 14px',
              borderRadius: '12px',
              fontWeight: 500,
              height: 'fit-content'
            }}
          >
            {status_data}
          </Tag>
        </Space>

        <Divider style={{ margin: '20px 0', borderColor: '#e8ecef' }} />

        {/* Contact Info */}
        <Space direction='vertical' size={12} style={{ width: '100%' }}>
          <Space align='center'>
            <PhoneOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
            <Text style={{ fontSize: '16px' }}>
              <a href={`tel:${phone}`} style={{ color: '#1890ff', fontWeight: 500 }}>
                {phone}
              </a>
            </Text>
          </Space>
          <Space align='center'>
            <FacebookOutlined style={{ color: '#3b5998', fontSize: '20px' }} />
            <Tooltip title='Visit Facebook Profile'>
              <Text>
                <a
                  href={social_media}
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{ color: '#3b5998', fontWeight: 500, fontSize: '16px' }}
                >
                  Facebook
                </a>
              </Text>
            </Tooltip>
          </Space>
        </Space>

        {/* Schedule and Services */}
        <Space direction='vertical' size={12} style={{ width: '100%' }}>
          <Space align='center'>
            <CalendarOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
            <Text strong style={{ fontSize: '16px', color: '#2d3436' }}>
              Lịch hẹn :{' '}
            </Text>
            <Text style={{ fontSize: '16px', color: '#636e72' }}>{dayjs(schedule).format('DD/MM/YYYY HH:mm')}</Text>
          </Space>
          <Space align='center' wrap>
            <Text strong style={{ fontSize: '16px', color: '#2d3436' }}>
              Dịch vụ:{' '}
            </Text>
            {service.map((item, index) => (
              <Tag
                key={index}
                color='cyan'
                style={{
                  fontSize: '14px',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  fontWeight: 500,
                  background: '#e6f7ff',
                  border: 'none'
                }}
              >
                {item}
              </Tag>
            ))}
          </Space>
        </Space>

        <Divider style={{ margin: '20px 0', borderColor: '#e8ecef' }} />

        {/* Additional Info */}
        <Space direction='vertical' size={12} style={{ width: '100%' }}>
          <Space align='center'>
            <EnvironmentOutlined style={{ color: '#eb2f96', fontSize: '20px' }} />
            <Text style={{ fontSize: '16px' }}>
              <strong>Chi nhánh:</strong> {branch}
            </Text>
          </Space>
          <Space align='center'>
            <CalendarOutlined style={{ color: '#fa8c16', fontSize: '20px' }} />
            <Text style={{ fontSize: '16px' }}>
              <strong>Date:</strong> {dayjs(date).format('DD/MM/YYYY')}
            </Text>
          </Space>
        </Space>
      </Space>
    </Card>
  )
}

export default CustomerSingleCard
