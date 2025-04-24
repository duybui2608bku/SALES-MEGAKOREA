import { useEffect, useState } from 'react'
import { Card, Row, Col, Typography, Tag, Space, Divider } from 'antd'
import { DollarOutlined, TagOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { ServicesOfCardType } from 'src/Interfaces/services/services.interfaces'
const { Title, Text } = Typography

// Interface cho props
interface ServiceCardListProps {
  cards: ServicesOfCardType[]
  onServiceClick?: (service: string[], totalPrice: number) => void
  columnsGird?: number
  resetCard?: number
  customCss?: boolean
}

const ServiceCardList = ({
  cards,
  onServiceClick,
  columnsGird = 6,
  resetCard = 0,
  customCss = false
}: ServiceCardListProps) => {
  // State để theo dõi các card được chọn
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([])
  const [totalPriceCards, setTotalPriceCards] = useState(0)
  const [prevResetCard, setPrevResetCard] = useState<number>(resetCard ?? 0)

  // Giới hạn tối đa 10 thẻ dịch vụ
  const limitedCards = cards.slice(0, 10)

  // Xử lý khi nhấn vào card
  const handleCardClick = (cardId: string) => {
    setSelectedCardIds(
      (prev) =>
        prev.includes(cardId)
          ? prev.filter((id) => id !== cardId) // Bỏ chọn nếu đã chọn
          : [...prev, cardId] // Thêm vào danh sách chọn
    )
  }

  // Xử lý reset click card khi handle create card service thành công
  useEffect(() => {
    if (resetCard !== undefined && resetCard !== prevResetCard) {
      setSelectedCardIds([])
      setTotalPriceCards(0)
      onServiceClick?.([], 0)
      setPrevResetCard(resetCard)
    }
  }, [resetCard, onServiceClick, prevResetCard])

  // Xử lý việc cộng tổng tiền các card đã được chọn
  useEffect(() => {
    const total = cards.filter((card) => selectedCardIds.includes(card._id)).reduce((sum, card) => sum + card.price, 0)
    setTotalPriceCards(total)

    onServiceClick?.(selectedCardIds, total)
  }, [selectedCardIds, cards, onServiceClick])

  return (
    <div>
      <Row gutter={[24, 24]} justify={!customCss ? 'center' : 'start'}>
        {limitedCards.map((card) => (
          <Col xs={24} sm={12} md={columnsGird} lg={4.8} key={card._id}>
            <Card
              hoverable
              style={
                !customCss
                  ? {
                      boxSizing: 'border-box',
                      transition: 'all .3s ease',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: selectedCardIds.includes(card._id)
                        ? '0 8px 24px rgba(24, 144, 255, 0.4)'
                        : '0 6px 20px rgba(0, 0, 0, 0.12)',
                      border: selectedCardIds.includes(card._id) ? '2px solid #1890ff' : '2px solid #f9f9f9',
                      background: selectedCardIds.includes(card._id)
                        ? 'linear-gradient(145deg, #e6f7ff 0%, #f0faff 100%)'
                        : 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
                      height: '100%',
                      cursor: 'pointer'
                    }
                  : {
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: selectedCardIds.includes(card._id) ? '0 8px 24px rgba(24, 144, 255, 0.4)' : 'none',
                      border: selectedCardIds.includes(card._id) ? '1px solid #1890ff' : '1px solid lightgray',
                      background: selectedCardIds.includes(card._id)
                        ? 'linear-gradient(145deg, #e6f7ff 0%, #f0faff 100%)'
                        : 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
                      height: '100%'
                    }
              }
              onClick={() => handleCardClick(card._id)}
            >
              <Space direction='vertical' size='middle' style={{ width: '100%' }}>
                {/* Tiêu đề thẻ dịch vụ */}
                <Space align='center' style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }}>
                  <Title
                    level={!customCss ? 4 : 5}
                    style={
                      !customCss
                        ? {
                            margin: 0,
                            color: '#2d3436',
                            fontWeight: 600,
                            fontSize: 'clamp(14px, 4vw, 18px)',
                            lineHeight: '1.4',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2
                            // textOverflow: 'ellipsis'
                          }
                        : {
                            margin: 0,
                            color: '#2d3436',
                            fontWeight: 600,
                            lineHeight: '1.4'
                          }
                    }
                  >
                    {card.name}
                  </Title>
                  <Text type='secondary' style={!customCss ? { fontSize: '14px' } : { fontSize: '12px' }}>
                    #{card.code}
                  </Text>
                </Space>

                <Divider
                  style={
                    !customCss
                      ? { margin: '12px 0', borderColor: '#e8ecef' }
                      : { margin: '0px 0', borderColor: '#e8ecef' }
                  }
                />

                {/* Giá tổng */}
                <Space align='center'>
                  <DollarOutlined
                    style={!customCss ? { color: '#fa8c16', fontSize: '20px' } : { color: '#fa8c16', fontSize: '17px' }}
                  />
                  <Text
                    strong
                    style={!customCss ? { fontSize: '18px', color: '#2d3436' } : { fontSize: '15px', color: '#2d3436' }}
                  >
                    {(card.price / 1000000).toFixed(1)}M VNĐ
                  </Text>
                </Space>

                {/* Danh sách dịch vụ con */}
                <Space direction='vertical' size={8}>
                  <Text
                    strong
                    style={!customCss ? { fontSize: '14px', color: '#2d3436' } : { fontSize: '13px', color: '#2d3436' }}
                  >
                    Dịch vụ:
                  </Text>
                  {card.services_of_card.map((service, index) => (
                    <Space key={index} align='center' style={{ width: '100%' }}>
                      <Tag
                        color='cyan'
                        icon={<TagOutlined />}
                        style={
                          !customCss
                            ? {
                                fontSize: 'clamp(8px, 4vw, 12px)',
                                padding: '4px 10px',
                                borderRadius: '10px',
                                background: '#e6f7ff',
                                border: 'none',
                                cursor: 'pointer',
                                whiteSpace: 'normal',
                                wordBreak: 'break-word'
                              }
                            : {
                                fontSize: '10px',
                                padding: '4px 10px',
                                borderRadius: '10px',
                                background: '#e6f7ff',
                                border: 'none'
                              }
                        }
                        onClick={(e) => {
                          e.stopPropagation() // Ngăn sự kiện click card khi nhấn Tag
                        }}
                      >
                        {service.service_details.name}
                      </Tag>
                      <Text type='secondary' style={{ fontSize: '12px', wordBreak: 'unset' }}>
                        x{service.quantity}
                      </Text>
                    </Space>
                  ))}
                </Space>

                {/* Ngày tạo */}
                <Divider
                  style={
                    !customCss
                      ? { margin: '12px 0', borderColor: '#e8ecef' }
                      : { margin: '0px 0', borderColor: '#e8ecef' }
                  }
                />
                <Text type='secondary' style={!customCss ? { fontSize: '12px' } : { fontSize: '10px' }}>
                  Created: {dayjs(card.created_at).format('DD/MM/YYYY HH:mm')}
                </Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default ServiceCardList
