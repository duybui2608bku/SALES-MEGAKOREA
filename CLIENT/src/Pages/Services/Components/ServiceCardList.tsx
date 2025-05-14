import { useEffect, useState } from 'react'
import { Row, Col } from 'antd'
import { ServicesOfCardType } from 'src/Interfaces/services/services.interfaces'
import ServiceCard from 'src/Pages/Services/Components/ServiceCard'

// Interface cho props
interface ServiceCardListProps {
  cards: ServicesOfCardType[]
  onServiceClick?: (service: string[], totalPrice: number) => void
  columnsGird?: number
  resetCard?: number
}

const ServiceCardList = ({ cards, onServiceClick, columnsGird = 6, resetCard = 0 }: ServiceCardListProps) => {
  // State để theo dõi các card được chọn
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [totalPriceCards, setTotalPriceCards] = useState(0)
  const [prevResetCard, setPrevResetCard] = useState<number>(resetCard ?? 0)
  const [expandedCardIds, setExpandedCardIds] = useState(new Set<string>())

  // Giới hạn tối đa 10 thẻ dịch vụ
  const limitedCards = cards.slice(0, 6)

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
    <div>
      <Row gutter={[24, 24]} justify={'start'}>
        {limitedCards.map((card) => (
          <Col xs={24} sm={12} md={columnsGird} lg={4.8} key={card._id}>
            <ServiceCard
              card={card}
              selected={selectedCardIds.includes(card._id)}
              onCardClick={handleCardClick}
              toggleServicesList={toggleServicesList}
              expandedCardIds={expandedCardIds}
            />
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default ServiceCardList
