import { Card, Divider, Flex, Space, Tag, Tooltip, Typography } from 'antd'
import { ServicesOfCardType } from 'src/Interfaces/services/services.interfaces'
import { DollarOutlined, DownOutlined, UpOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useState } from 'react'
const { Title, Text } = Typography

interface PreviewServiceCardCreatedProp {
  serviceCardCreatedData: ServicesOfCardType
}

const PreviewServiceCardCreated = (props: PreviewServiceCardCreatedProp) => {
  const { serviceCardCreatedData } = props
  const [expandedCardIds, setExpandedCardIds] = useState(new Set())

  if (!serviceCardCreatedData) return null

  // Xử lý Mở rộng/Thu gọn của service_of_card nếu số lượng service_of_card lớn hơn 2
  const toggleServicesList = (cardId: string) => {
    const newExpandedIds = new Set(expandedCardIds)
    if (newExpandedIds.has(cardId)) {
      newExpandedIds.delete(cardId)
    } else {
      newExpandedIds.add(cardId)
    }
    setExpandedCardIds(newExpandedIds)
  }

  return (
    <Card
      key={serviceCardCreatedData._id}
      hoverable
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease-in-out, border .2s ease-in-out',
        backgroundColor: 'rgb(247, 250, 252)',
        padding: '8px 5px',
        border: 'none'
      }}
      bodyStyle={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ flexGrow: 1 }}>
        <Flex justify='space-between' align='center' style={{ marginBottom: '12px', flexDirection: 'row' }}>
          <Title
            level={4}
            style={{
              margin: 0,
              color: '#262626',
              fontWeight: 600,
              maxWidth: '80%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '17px'
            }}
          >
            <Tooltip title={serviceCardCreatedData.name}>{serviceCardCreatedData.name}</Tooltip>
          </Title>
          <Tag
            color='#1890ff'
            style={{
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: '16px',
              marginRight: 0
            }}
          >
            <DollarOutlined style={{ marginRight: '4px' }} />
            {serviceCardCreatedData.services_of_card.reduce((total, s) => total + s.total, 0).toLocaleString('vi-VN')}
          </Tag>
        </Flex>

        <Divider style={{ margin: '12px 0', borderColor: '#f0f0f0' }} />

        <div className='services-list' style={{ marginBottom: '16px' }}>
          <Flex justify='space-between' align='center' style={{ marginBottom: '12px' }}>
            <Text strong style={{ fontSize: '14px', color: '#262626' }}>
              Dịch vụ ({serviceCardCreatedData.services_of_card.length}):
            </Text>
            {serviceCardCreatedData.services_of_card.length > 1 && (
              <Tag
                color='geekblue'
                style={{
                  cursor: 'pointer',
                  fontSize: '11px',
                  padding: '1px 15px',
                  borderRadius: '12px',
                  margin: 0
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleServicesList(serviceCardCreatedData._id)
                }}
              >
                {expandedCardIds.has(serviceCardCreatedData._id) ? (
                  <Tooltip title='Thu gọn'>
                    <UpOutlined style={{ fontSize: '9px' }} />
                  </Tooltip>
                ) : (
                  <Tooltip title={`Xem thêm (${serviceCardCreatedData.services_of_card.length - 1})`}>
                    <DownOutlined style={{ fontSize: '9px' }} />
                  </Tooltip>
                )}
              </Tag>
            )}
          </Flex>

          <div style={{ width: '100%' }}>
            {/* Dịch vụ đầu tiên luôn hiển thị */}
            {serviceCardCreatedData.services_of_card.slice(0, 1).map((service, index) => {
              const usedCount = 0 // Giả định trường used (nếu không có, gán 0)
              const quantity = service.quantity || 1
              const isExhausted = usedCount >= quantity

              return (
                <div
                  key={`first-${index}`}
                  style={{
                    background: '#ffffff',
                    boxShadow: 'rgba(50, 50, 93, 0.01) 0px 6px 12px -2px, rgba(0, 0, 0, 0.2) 0px 3px 7px -3px',
                    borderRadius: '8px',
                    padding: '10px',
                    transition: 'all 0.3s ease',
                    marginBottom: serviceCardCreatedData.services_of_card.length > 1 ? '12px' : '0'
                  }}
                >
                  <Flex justify='space-between' align='center' style={{ marginBottom: '8px' }}>
                    <Tooltip title={service.service_details.name}>
                      <Text
                        style={{
                          fontWeight: 500,
                          fontSize: '12px',
                          color: '#262626',
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {service.service_details.name}
                      </Text>
                    </Tooltip>
                    <Text
                      style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: isExhausted ? '#ff4d4f' : '#1890ff'
                      }}
                    >
                      x{quantity}
                    </Text>
                  </Flex>

                  <Flex justify='space-between' align='center'>
                    <Text type='secondary' style={{ fontSize: '12px', color: '#1890ff' }}>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(service.service_details.price || 0)}
                    </Text>
                  </Flex>
                </div>
              )
            })}

            {/* Container cho các dịch vụ còn lại với hiệu ứng */}
            {serviceCardCreatedData.services_of_card.length > 1 && (
              <div
                style={{
                  maxHeight: expandedCardIds.has(serviceCardCreatedData._id)
                    ? `${(serviceCardCreatedData.services_of_card.length - 1) * 100}px`
                    : '0px',
                  opacity: expandedCardIds.has(serviceCardCreatedData._id) ? 1 : 0,
                  transition: 'max-height 0.5s ease, opacity 0.4s ease'
                }}
              >
                <Space direction='vertical' size={12} style={{ width: '100%', display: 'flex' }}>
                  {serviceCardCreatedData.services_of_card.slice(1).map((service, index) => {
                    const usedCount = 0 // Giả định trường used (nếu không có, gán 0)
                    const quantity = service.quantity || 1
                    const isExhausted = usedCount >= quantity

                    return (
                      <div
                        key={`extra-${index}`}
                        style={{
                          background: '#ffffff',
                          boxShadow: 'rgba(50, 50, 93, 0.01) 0px 6px 12px -2px, rgba(0, 0, 0, 0.2) 0px 3px 7px -3px',
                          borderRadius: '8px',
                          padding: '10px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Flex justify='space-between' align='center' style={{ marginBottom: '8px' }}>
                          <Tooltip title={service.service_details.name}>
                            <Text
                              style={{
                                fontWeight: 500,
                                fontSize: '12px',
                                color: '#262626',
                                maxWidth: '200px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {service.service_details.name}
                            </Text>
                          </Tooltip>
                          <Text
                            style={{
                              fontSize: '12px',
                              fontWeight: 500,
                              color: isExhausted ? '#ff4d4f' : '#1890ff'
                            }}
                          >
                            x{quantity}
                          </Text>
                        </Flex>

                        <Flex justify='space-between' align='center'>
                          <Text type='secondary' style={{ fontSize: '12px', color: '#1890ff' }}>
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(service.service_details.price || 0)}
                          </Text>
                        </Flex>
                      </div>
                    )
                  })}
                </Space>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '5px' }}>
        <Divider style={{ margin: '8px 0 12px', borderColor: '#f0f0f0' }} />

        <Flex justify='space-between' align='center'>
          <Text type='secondary' style={{ fontSize: '12px' }}>
            {dayjs(serviceCardCreatedData.created_at).format('DD/MM/YYYY HH:mm')}
          </Text>
        </Flex>
      </div>
    </Card>
  )
}

export default PreviewServiceCardCreated
