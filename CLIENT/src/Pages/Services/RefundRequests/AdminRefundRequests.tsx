import { Button, Card, Col, Row, Segmented, Typography } from 'antd'
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DashboardOutlined,
  FilterOutlined,
  PieChartOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { Fragment } from 'react/jsx-runtime'
import { RequestStatus } from 'src/Constants/enum'
import { handleRefresh } from 'src/Utils/util.utils'
import { GiTakeMyMoney } from 'react-icons/gi'
import StatCard from 'src/Components/StatsCard'
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

const AdminRefundRequest = () => {
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
          bodyStyle={{ padding: '20px 24px' }}
        >
          <Row align='middle' justify='space-between'>
            <Col>
              <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                <GiTakeMyMoney style={{ marginRight: '12px', color: '#1890ff' }} />
                Quản lý yêu cầu hoàn tiền dịch vụ
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

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard title='Tổng số yêu cầu' value={102031} icon={<PieChartOutlined />} color='#1890ff' />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard title='Đang chờ xử lý' value={21} icon={<ClockCircleOutlined />} color='#faad14' />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard title='Đã phê duyệt' value={243} icon={<CheckCircleOutlined />} color='#52c41a' />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard title='Đã từ chối' value={423} icon={<CloseCircleOutlined />} color='#ff4d4f' />
          </Col>
        </Row>

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

        <style>{`
        .stat-card {
          border-radius: 12px;
          transition: all 0.3s;
          overflow: hidden;
        }
        .stat-card:hover {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
          transform: translateY(-4px);
        }
        .ant-table {
          border-radius: 12px;
          overflow: hidden;
        }
        .ant-table-thead > tr > th {
          background-color: #fafafa;
        }
        .ant-table-tbody > tr > td {
          padding: 12px 16px;
        }
        .ant-table-row:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .ant-progress-text {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.65);
        }
        .ant-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .ant-modal-content {
          border-radius: 12px;
          overflow: hidden;
        }
        .ant-list-item {
          padding: 10px 0;
          display: flex;
          justify-content: space-between;
        }
        .ant-segmented {
          background-color: #f5f5f5;
          padding: 2px;
          border-radius: 8px;
        }
        .ant-segmented-item-selected {
          background-color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .ant-segmented-item {
          border-radius: 6px !important;
          transition: all 0.3s;
        }
        .ant-card-head {
          border-bottom: 1px solid #f0f0f0;
        }
        .ant-card-head-title {
          padding: 16px 0;
        }
        .ant-card-extra {
          padding: 16px 0;
        }
        .ant-table-pagination {
          margin: 16px;
        }
      `}</style>
      </div>
    </Fragment>
  )
}

export default AdminRefundRequest
