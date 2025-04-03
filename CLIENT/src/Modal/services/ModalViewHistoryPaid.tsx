import React from 'react'
import { Modal, Card, Descriptions, Tag, Typography, Space } from 'antd'
import { HistoryPaid } from 'src/Interfaces/services/services.interfaces' // Giả sử đây là interface của bạn

// Props interface cho component
interface ModalViewHistoryPaidProps {
  open: boolean // Thay visible bằng open để đồng bộ với AntD
  onCancel: () => void
  data: HistoryPaid[]
}

const { Title, Text } = Typography

const ModalViewHistoryPaid: React.FC<ModalViewHistoryPaidProps> = ({ open, onCancel, data }) => {
  if (!data || data.length === 0) return
  // Tính tổng số tiền thanh toán
  const totalPaid = data.reduce((sum, item) => sum + item.paid, 0)

  return (
    <Modal
      title={
        <Title level={4} style={{ textAlign: 'center', margin: 0 }}>
          Lịch sử thanh toán
        </Title>
      }
      open={open}
      onCancel={onCancel}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Text strong>Tổng thanh toán: </Text>
          <Text type='success' strong>
            {totalPaid.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </Text>
          {' ---- '}
          <Text strong>Còn nợ: </Text>
          <Text type='danger' strong>
            {data[data.length - 1].out_standing.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </Text>
        </div>
      }
      width={900}
      centered // Căn giữa modal
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }} // Giới hạn chiều cao và thêm scroll
    >
      <Space direction='vertical' style={{ width: '100%' }} size='middle'>
        {data.map((history, index) => (
          <Card
            key={index}
            title={`Giao dịch: ${history.code}`}
            hoverable
            style={{
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              background: '#fafafa'
            }}
            headStyle={{ background: '#e6f7ff', borderBottom: 'none' }}
          >
            <Descriptions column={2} bordered size='small' labelStyle={{ width: '30%' }}>
              <Descriptions.Item label='Số tiền thanh toán'>
                <Text strong style={{ color: '#52c41a' }}>
                  {history.paid.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label='Phương thức'>
                <Tag
                  color={history.method === 'Tiền Mặt' ? 'blue' : 'green'}
                  style={{ borderRadius: 12, padding: '0 8px' }}
                >
                  {history.method}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label='Ngày thanh toán'>
                <Text>
                  {new Date(history.date).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label='Người thực hiện'>
                <Text style={{ color: '#595959' }}>{history.user_details?.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label='Còn nợ'>
                <Text strong style={{ color: '#f5222d' }}>
                  {history.out_standing.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label='Ghi chú'>
                <Text type='secondary'>{history.descriptions || 'Không có'}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        ))}
      </Space>
    </Modal>
  )
}

export default ModalViewHistoryPaid
