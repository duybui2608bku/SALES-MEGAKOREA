import { Card, Col, Typography } from 'antd'
import React from 'react'

const { Text } = Typography

interface StatisticCardProps {
  title?: string
  value?: any
  icon?: any
  color?: any
  loading?: boolean
  colSpan?: number
}

const StatisticCard = (props: StatisticCardProps) => {
  const { title, value, icon, color = 0, loading = false, colSpan = 6 } = props

  const cardStyles = [
    // Blue - softer, more muted tone
    {
      background: '#40a9ff', // Màu xanh dương nhẹ hơn so với #1890ff
      color: 'white',
      borderRadius: '16px',
      boxShadow: 'inset 0 -3px 0 rgba(0, 0, 0, 0.05), 0 8px 16px rgba(64, 169, 255, 0.12)',
      transition: 'all 0.3s',
      overflow: 'hidden',
      position: 'relative',
      border: '1px solid rgba(255, 255, 255, 0.25)'
    },

    // Purple - softer, more muted tone
    {
      background: '#9254de', // Màu tím nhẹ hơn so với #722ed1
      color: 'white',
      borderRadius: '16px',
      boxShadow: 'inset 0 -3px 0 rgba(0, 0, 0, 0.05), 0 8px 16px rgba(146, 84, 222, 0.12)',
      transition: 'all 0.3s',
      overflow: 'hidden',
      position: 'relative',
      border: '1px solid rgba(255, 255, 255, 0.25)'
    },

    // Green - softer, more muted tone
    {
      background: '#73d13d', // Màu xanh lá nhẹ hơn so với #52c41a
      color: 'white',
      borderRadius: '16px',
      boxShadow: 'inset 0 -3px 0 rgba(0, 0, 0, 0.05), 0 8px 16px rgba(115, 209, 61, 0.12)',
      transition: 'all 0.3s',
      overflow: 'hidden',
      position: 'relative',
      border: '1px solid rgba(255, 255, 255, 0.25)'
    },

    // Orange - softer, more muted tone
    {
      background: '#ffa940', // Màu cam nhẹ hơn so với #fa8c16
      color: 'white',
      borderRadius: '16px',
      boxShadow: 'inset 0 -3px 0 rgba(0, 0, 0, 0.05), 0 8px 16px rgba(255, 169, 64, 0.12)',
      transition: 'all 0.3s',
      overflow: 'hidden',
      position: 'relative',
      border: '1px solid rgba(255, 255, 255, 0.25)'
    }
  ]

  // Xác định style dựa trên tham số color (chấp nhận index hoặc object style tùy chỉnh)
  const cardStyle = typeof color === 'number' ? cardStyles[color] : color

  return (
    <Col xs={24} sm={colSpan}>
      <Card
        loading={loading}
        style={cardStyle}
        hoverable
        styles={{
          body: {
            padding: '10px 24px'
          }
        }}
      >
        <Text
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '14px',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
          }}
        >
          {title}
        </Text>
        <div
          style={{
            fontSize: '22px',
            fontWeight: 'bold',
            margin: '8px 0',
            color: 'white',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
          }}
        >
          {value}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center'
          }}
        >
          {React.cloneElement(icon, { style: { fontSize: '33px', opacity: 0.8, ...icon.props.style } })}
        </div>
      </Card>
    </Col>
  )
}

export default StatisticCard
