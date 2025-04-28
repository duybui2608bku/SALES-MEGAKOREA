import { Button, Card, Divider, Flex, Modal, Popconfirm, Space, Tag, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { GetServicesCardSoldOfCustomer } from 'src/Interfaces/services/services.interfaces'
const { Title, Text } = Typography
import { DollarOutlined, TagOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { IoPrintOutline } from 'react-icons/io5'
import { RiErrorWarningLine } from 'react-icons/ri'
import { GrSubtractCircle } from 'react-icons/gr'

enum StatusOpenModalServicesCard {
  VIEW,
  UPDATE,
  NONE
}

interface ModalViewServicesCardProps {
  open: StatusOpenModalServicesCard
  close: (value: StatusOpenModalServicesCard) => void
  servicesCardSoldOfCustomerData?: GetServicesCardSoldOfCustomer | null
}

interface CardOfServicesCardSoldOfCustomer {
  _id: string
  price: number | null
  name: string
  services_of_card: {
    _id: string
    name: string
    lineTotal: number
    quantity?: number
  }[]
  create_at?: string
}

const ModalViewServicesCardSold = (props: ModalViewServicesCardProps) => {
  const { open, close, servicesCardSoldOfCustomerData } = props
  const [listServicesCard, setListServicesCard] = useState<CardOfServicesCardSoldOfCustomer[]>([])

  useEffect(() => {
    if (servicesCardSoldOfCustomerData) {
      setListServicesCard(servicesCardSoldOfCustomerData.cards)
    }
  }, [servicesCardSoldOfCustomerData])

  // Func đóng Modal view
  const handleCancelModal = () => {
    close(StatusOpenModalServicesCard.NONE)
  }

  return (
    <Modal
      open={open === StatusOpenModalServicesCard.VIEW}
      onCancel={handleCancelModal}
      centered
      okText={'Đóng'}
      footer={null}
      style={{ padding: 0 }}
      // Tính chiều rộng động của Modal (giới hạn tối đa là 1100p)
      width={Math.min(listServicesCard.length * 260 + 48, 1100)}
    >
      <Title className='center-div' level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
        Thẻ dịch vụ đã bán
      </Title>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          justifyContent: listServicesCard.length <= 4 ? 'center' : 'flex-start',
          alignItems: 'stretch',
          height: listServicesCard.length <= 4 ? 'auto' : '660px',
          overflowY: 'scroll',
          overflowX: 'hidden'
        }}
      >
        {listServicesCard.map((card) => (
          <Card
            key={card._id}
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
                  {card.name}
                </Title>

                <Divider style={{ margin: '2px 0', borderColor: '#e8ecef' }} />

                <Space align='center'>
                  <DollarOutlined style={{ color: '#fa8c16', fontSize: '17px' }} />
                  <Text strong style={{ fontSize: '15px', color: '#2d3436' }}>
                    {card.services_of_card.reduce((total, s) => total + s.lineTotal, 0).toLocaleString('vi-VN')} VNĐ
                  </Text>
                </Space>

                <Space direction='vertical' size={8}>
                  <Text strong style={{ fontSize: '12px', color: '#2d3436' }}>
                    Dịch vụ:
                  </Text>
                  {card.services_of_card.map((service, index) => (
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
                        {service.name}
                      </Tag>
                      <Text type='secondary' style={{ fontSize: '10px' }}>
                        x{service.quantity}
                      </Text>
                    </Space>
                  ))}
                </Space>

                <Divider style={{ margin: '2px 0', borderColor: '#e8ecef' }} />
                <Text type='secondary' style={{ fontSize: '10px' }}>
                  Ngày tạo: {dayjs(card.create_at).format('DD/MM/YYYY HH:mm')}
                </Text>
              </Space>
            </div>
            <Flex justify='space-around' style={{ marginTop: 12 }}>
              <Button
                style={{ width: '40px', height: '40px' }}
                icon={<IoPrintOutline style={{ color: '#3B82F6', fontSize: '18px' }} />}
              />
              <Button
                style={{ width: '40px', height: '40px' }}
                icon={<RiErrorWarningLine style={{ color: '#F59E0B', fontSize: '18px' }} />}
              />
              <Popconfirm title='Xác nhận sử dụng dịch vụ'>
                <Button
                  style={{ width: '40px', height: '40px' }}
                  icon={<GrSubtractCircle style={{ color: '#10B981', fontSize: '18px' }} />}
                />
              </Popconfirm>
            </Flex>
          </Card>
        ))}
      </div>
    </Modal>
  )
}

export default ModalViewServicesCardSold
