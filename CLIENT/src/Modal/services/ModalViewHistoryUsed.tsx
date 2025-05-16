import { Card, Descriptions, Modal, Space, Typography } from 'antd'
import { HistoryUsed } from 'src/Interfaces/services/services.interfaces'

interface ModalViewHistoryUsedProps {
  open: boolean
  close: (value: boolean) => void
  historyUsedData?: HistoryUsed[]
}

const { Title, Text } = Typography

const ModalViewHistoryUsed = (props: ModalViewHistoryUsedProps) => {
  const { open, close, historyUsedData } = props

  const handleClose = () => {
    close(false)
  }

  return (
    <Modal
      title={
        <Title className='text-center' level={4}>
          Lịch sử sử dụng dịch vụ
        </Title>
      }
      open={open}
      onCancel={handleClose}
      centered
      footer={null}
      width={800}
    >
      <Space direction='vertical' style={{ width: '100%', maxHeight: '80vh', overflowY: 'auto' }} size='large'>
        {historyUsedData?.map((history, index) => (
          <Card
            key={index}
            title={history.name_service}
            style={{
              marginBottom: 16,
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              background: '#fafafa'
            }}
            styles={{
              header: {
                background: '#e6f7ff',
                borderBottom: 'none'
              }
            }}
          >
            <Space direction='vertical' style={{ width: '100%' }}>
              <Descriptions column={2} bordered size='small'>
                <Descriptions.Item label='Tên dịch vụ'>{history.name_service}</Descriptions.Item>
                <Descriptions.Item label='Khách hàng'>{history.user_name}</Descriptions.Item>
                <Descriptions.Item label='Số lần sử dụng'>{history.count}</Descriptions.Item>
                <Descriptions.Item label='Ngày sử dụng'>
                  {new Date(history.date).toLocaleDateString('vi-VN')}
                </Descriptions.Item>
                {history.descriptions && (
                  <Descriptions.Item label='Ghi chú' span={2}>
                    <Text type='secondary'>{history.descriptions}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Space>
          </Card>
        ))}
      </Space>
    </Modal>
  )
}

export default ModalViewHistoryUsed
