import React, { useMemo, useState } from 'react'
import { Modal, Card, Descriptions, Tag, Typography, Space, Flex } from 'antd'
import { HistoryPaid } from 'src/Interfaces/services/services.interfaces'
import { HiOutlinePrinter } from 'react-icons/hi2'
import InvoicePrintPreview from './InvoicePrintPreview'
import { orderBy } from 'lodash'

// Interface mới dựa trên dữ liệu mẫu

// Props interface cho component
interface ModalViewHistoryPaidProps {
  open: boolean
  onCancel: () => void
  data: HistoryPaid[]
}

const { Title, Text } = Typography

const ModalViewHistoryPaid: React.FC<ModalViewHistoryPaidProps> = ({ open, onCancel, data }) => {
  const [opentPrinter, setOpenPrinter] = useState(false)

  // Sắp xếp dữ liệu theo ngày thanh toán
  const sortedData = useMemo(() => {
    return orderBy(data, [(item) => new Date(item.date).getTime()], ['desc'])
  }, [data])

  if (!data || data.length === 0) return null // Trả về null thay vì undefined

  // Tính tổng số tiền thanh toán
  const totalPaid = sortedData.reduce((sum, item) => sum + item.paid, 0)

  // Lấy giá trị outstanding từ giao dịch mới nhất
  const latestOutstanding = sortedData.length > 0 ? sortedData[0].out_standing : 0

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
        <Flex style={{ justifyContent: 'space-between', padding: '0 16px' }}>
          <Flex>
            <HiOutlinePrinter onClick={() => setOpenPrinter(true)} size={25} cursor='pointer' />
          </Flex>
          <Flex gap={10}>
            <Text strong>Tổng thanh toán: </Text>
            <Text type='success' strong>
              {totalPaid.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Text>
            {' | '}
            <Text strong>Còn nợ: </Text>
            <Text type='danger' strong>
              {latestOutstanding.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Text>
          </Flex>
        </Flex>
      }
      width={900}
      centered
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
    >
      <Space direction='vertical' style={{ width: '100%' }} size='middle'>
        {sortedData.map((history, index) => (
          <Card
            key={history._id || index} // Ưu tiên sử dụng _id nếu có
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
                <Text style={{ color: '#595959' }}>{history.user_details?.name || 'Không xác định'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label='Còn nợ' span={2}>
                <Text strong style={{ color: '#f5222d' }}>
                  {history.out_standing.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label='Ghi chú' span={2}>
                <Text type='secondary'>{history.descriptions || 'Không có'}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        ))}
      </Space>
      <InvoicePrintPreview onCancel={() => setOpenPrinter(false)} data={sortedData as any} open={opentPrinter} />
    </Modal>
  )
}

export default ModalViewHistoryPaid
