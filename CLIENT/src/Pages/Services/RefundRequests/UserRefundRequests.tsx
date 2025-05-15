import { Button, Card, Col, Row, Segmented, Typography } from 'antd'
import { Fragment } from 'react/jsx-runtime'
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { handleRefresh } from 'src/Utils/util.utils'
import { GiTakeMyMoney } from 'react-icons/gi'
import { RequestStatus } from 'src/Constants/enum'
import { useState } from 'react'

const { Title } = Typography

const statusColors = {
  [RequestStatus.PENDING]: '#faad14',
  [RequestStatus.APPROVED]: '#52c41a',
  [RequestStatus.REJECTED]: '#ff4d4f'
}

const statusIcons = {
  [RequestStatus.PENDING]: <ClockCircleOutlined />,
  [RequestStatus.APPROVED]: <CheckCircleOutlined />,
  [RequestStatus.REJECTED]: <CloseCircleOutlined />
}

const statusBgColors = {
  [RequestStatus.PENDING]: 'rgba(250, 173, 20, 0.1)',
  [RequestStatus.APPROVED]: 'rgba(82, 196, 26, 0.1)',
  [RequestStatus.REJECTED]: 'rgba(255, 77, 79, 0.1)'
}

const statusLabels = {
  [RequestStatus.PENDING]: 'Đang chờ',
  [RequestStatus.APPROVED]: 'Đã phê duyệt',
  [RequestStatus.REJECTED]: 'Từ chối'
}

const UserRefundRequest = () => {
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all')

  const handleStatusFilterChange = (value: string | number) => {
    setStatusFilter(value as RequestStatus | 'all')
  }

  return (
    <Fragment>
      <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
        <Card
          style={{
            marginBottom: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
          }}
        >
          <Row align='middle' justify='space-between'>
            <Col>
              <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                <GiTakeMyMoney style={{ marginRight: '12px', color: '#1890ff' }} />
                Yêu cầu hoàn tiền dịch vụ của tôi
              </Title>
            </Col>
            <Col>
              <Button
                type='primary'
                icon={<ReloadOutlined />}
                onClick={() => handleRefresh('requestsAdmin')}
                style={{
                  fontSize: '12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 2px 0 rgba(0, 0, 0, 0.045)'
                }}
              >
                Làm mới dữ liệu
              </Button>
            </Col>
          </Row>
        </Card>

        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FilterOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              <span>Danh sách yêu cầu</span>
            </div>
          }
          extra={
            <Segmented
              options={[
                {
                  label: (
                    <div style={{ padding: '0 4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AppstoreOutlined /> Tất cả
                      </div>
                    </div>
                  ),
                  value: 'all'
                },
                {
                  label: (
                    <div style={{ padding: '0 4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ClockCircleOutlined style={{ color: '#faad14' }} /> Đang chờ
                      </div>
                    </div>
                  ),
                  value: RequestStatus.PENDING
                },
                {
                  label: (
                    <div style={{ padding: '0 4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircleOutlined style={{ color: '#52c41a' }} /> Đã duyệt
                      </div>
                    </div>
                  ),
                  value: RequestStatus.APPROVED
                },
                {
                  label: (
                    <div style={{ padding: '0 4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> Từ chối
                      </div>
                    </div>
                  ),
                  value: RequestStatus.REJECTED
                }
              ]}
              value={statusFilter}
              onChange={handleStatusFilterChange}
            />
          }
          style={{
            borderRadius: '12px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
          }}
          bodyStyle={{ padding: '0' }}
        ></Card>
      </div>
    </Fragment>
  )
}

export default UserRefundRequest
