import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
  PercentageOutlined,
  DollarCircleOutlined,
  ScissorOutlined
} from '@ant-design/icons'
import { Tag } from 'antd'
import { RefundEnum, RequestStatus } from 'src/Constants/enum'

// Cấu hình cho RequestStatus
export const statusConfig = {
  colors: {
    [RequestStatus.PENDING]: '#faad14',
    [RequestStatus.APPROVED]: '#52c41a',
    [RequestStatus.REJECTED]: '#ff4d4f'
  },

  icons: {
    [RequestStatus.PENDING]: <ClockCircleOutlined />,
    [RequestStatus.APPROVED]: <CheckCircleOutlined />,
    [RequestStatus.REJECTED]: <CloseCircleOutlined />
  },

  bgColors: {
    [RequestStatus.PENDING]: 'rgba(250, 173, 20, 0.1)',
    [RequestStatus.APPROVED]: 'rgba(82, 196, 26, 0.1)',
    [RequestStatus.REJECTED]: 'rgba(255, 77, 79, 0.1)'
  },

  labels: {
    [RequestStatus.PENDING]: 'Đang chờ',
    [RequestStatus.APPROVED]: 'Đã phê duyệt',
    [RequestStatus.REJECTED]: 'Từ chối'
  }
}

// Cấu hình cho RefundEnum
export const refundConfig = {
  labels: {
    [RefundEnum.NONE]: 'Không hoàn tiền',
    [RefundEnum.PARTIAL_FULL_TREATMENT]: 'Theo liệu trình đầy đủ',
    [RefundEnum.PARTIAL_HALF_REATMENT]: 'Theo số tiền',
    [RefundEnum.FULL]: 'Hoàn tiền 100%',
    [RefundEnum.PENDING]: 'Đang xử lý'
  },

  colors: {
    [RefundEnum.NONE]: '#d9d9d9',
    [RefundEnum.PARTIAL_FULL_TREATMENT]: '#fa8c16',
    [RefundEnum.PARTIAL_HALF_REATMENT]: '#722ed1',
    [RefundEnum.FULL]: '#1890ff',
    [RefundEnum.PENDING]: '#faad14'
  },

  icons: {
    [RefundEnum.NONE]: <MinusCircleOutlined />,
    [RefundEnum.PARTIAL_FULL_TREATMENT]: <ScissorOutlined />,
    [RefundEnum.PARTIAL_HALF_REATMENT]: <DollarCircleOutlined />,
    [RefundEnum.FULL]: <PercentageOutlined />,
    [RefundEnum.PENDING]: <ClockCircleOutlined />
  },

  bgColors: {
    [RefundEnum.NONE]: 'rgba(217, 217, 217, 0.1)',
    [RefundEnum.PARTIAL_FULL_TREATMENT]: 'rgba(250, 140, 22, 0.1)',
    [RefundEnum.PARTIAL_HALF_REATMENT]: 'rgba(114, 46, 209, 0.1)',
    [RefundEnum.FULL]: 'rgba(24, 144, 255, 0.1)',
    [RefundEnum.PENDING]: 'rgba(250, 173, 20, 0.1)'
  }
}

// Tạo một hàm tiện ích để render các thẻ Tag với cấu hình tương ứng
export const renderStatusTag = (status: RequestStatus) => (
  <Tag
    icon={statusConfig.icons[status]}
    style={{
      color: statusConfig.colors[status],
      backgroundColor: statusConfig.bgColors[status],
      border: 'none',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 500
    }}
  >
    {statusConfig.labels[status]}
  </Tag>
)

export const renderRefundTag = (refundType: RefundEnum) => (
  <Tag
    icon={refundConfig.icons[refundType]}
    style={{
      color: refundConfig.colors[refundType],
      backgroundColor: refundConfig.bgColors[refundType],
      border: 'none',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 500
    }}
  >
    {refundConfig.labels[refundType]}
  </Tag>
)
