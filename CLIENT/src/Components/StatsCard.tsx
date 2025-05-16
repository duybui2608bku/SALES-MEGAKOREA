import { Card } from 'antd'

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
  subTitle?: string
}

const StatCard = (props: StatCardProps) => {
  const { title, value, icon, color, subTitle } = props

  return (
    <Card
      hoverable
      className='stat-card'
      styles={{
        body: {
          padding: '24px',
          borderBottom: `4px solid ${color}`
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
        <div>
          <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '13px', marginBottom: '8px' }}>{title}</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{value}</div>
          {subTitle && (
            <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '12px', marginTop: '4px' }}>{subTitle}</div>
          )}
        </div>
        <div
          style={{
            backgroundColor: `${color}20`,
            color: color,
            borderRadius: '12px',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '25px'
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  )
}

export default StatCard
