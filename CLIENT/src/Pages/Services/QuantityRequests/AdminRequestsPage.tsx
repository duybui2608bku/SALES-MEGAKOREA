import React, { useState, useEffect } from 'react'

import { QuantityRequestAPI } from 'src/Service/services/quantity-request.api'
import {
  IQuantityRequestWithDetails,
  QuantityRequestStatus,
  IUpdateQuantityRequestStatusPayload
} from 'src/Interfaces/services/quantity-request.interfaces'
import {
  Table,
  Card,
  Tag,
  Button,
  Space,
  Typography,
  Select,
  Row,
  Col,
  Empty,
  Spin,
  Alert,
  Modal,
  Input,
  Statistic,
  Tooltip,
  Avatar,
  Badge,
  Divider,
  PageHeader,
  Progress,
  List
} from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  PieChartOutlined,
  UserOutlined,
  AppstoreOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  FilterOutlined,
  TeamOutlined,
  ReloadOutlined,
  CalendarOutlined,
  FileSearchOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import axiosInstanceMain from 'src/Service/axious.api'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input
const { confirm } = Modal

const statusColors = {
  [QuantityRequestStatus.PENDING]: 'gold',
  [QuantityRequestStatus.APPROVED]: 'green',
  [QuantityRequestStatus.REJECTED]: 'red'
}

const statusIcons = {
  [QuantityRequestStatus.PENDING]: <ClockCircleOutlined />,
  [QuantityRequestStatus.APPROVED]: <CheckCircleOutlined />,
  [QuantityRequestStatus.REJECTED]: <CloseCircleOutlined />
}

const statusLabels = {
  [QuantityRequestStatus.PENDING]: 'Đang chờ',
  [QuantityRequestStatus.APPROVED]: 'Đã phê duyệt',
  [QuantityRequestStatus.REJECTED]: 'Từ chối'
}

const AdminRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<IQuantityRequestWithDetails[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<QuantityRequestStatus | 'all'>('all')
  const [stats, setStats] = useState<{
    total: number
    pending: number
    approved: number
    rejected: number
  }>({ total: 0, pending: 0, approved: 0, rejected: 0 })

  const [noteModalVisible, setNoteModalVisible] = useState<boolean>(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null)
  const [currentRequest, setCurrentRequest] = useState<IQuantityRequestWithDetails | null>(null)
  const [adminNote, setAdminNote] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [showDetail, setShowDetail] = useState<boolean>(false)

  const quantityRequestAPI = new QuantityRequestAPI(axiosInstanceMain)

  useEffect(() => {
    fetchRequests()
    fetchStats()
  }, [statusFilter])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await quantityRequestAPI.getAllRequests()

      setRequests(data.result)
    } catch (err) {
      console.error('Failed to fetch requests:', err)
      setError('Không thể tải danh sách yêu cầu. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await quantityRequestAPI.getRequestStats()
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const handleShowActionModal = (request: IQuantityRequestWithDetails, action: 'approve' | 'reject') => {
    setCurrentRequestId(request._id)
    setCurrentRequest(request)
    setActionType(action)
    setAdminNote('')
    setNoteModalVisible(true)
  }

  const handleShowDetail = (request: IQuantityRequestWithDetails) => {
    setCurrentRequest(request)
    setShowDetail(true)
  }

  const handleSubmitAction = async () => {
    if (!currentRequestId || !actionType) return

    try {
      setSubmitting(true)

      const payload: IUpdateQuantityRequestStatusPayload = {
        note: adminNote
      }

      if (actionType === 'approve') {
        await quantityRequestAPI.approveRequest(currentRequestId, payload)
      } else {
        await quantityRequestAPI.rejectRequest(currentRequestId, payload)
      }

      setNoteModalVisible(false)
      fetchRequests()
      fetchStats()
    } catch (err) {
      console.error(`Failed to ${actionType} request:`, err)
      const action = actionType === 'approve' ? 'phê duyệt' : 'từ chối'
      Modal.error({
        title: `Lỗi khi ${action} yêu cầu`,
        content: `Đã xảy ra lỗi khi ${action} yêu cầu. Vui lòng thử lại sau.`
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRefresh = () => {
    fetchRequests()
    fetchStats()
  }

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: ['user', 'name'],
      key: 'userName',
      render: (text: string, record: IQuantityRequestWithDetails) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <span>{record.user?.name || `ID: ${record.userId}`}</span>
        </Space>
      )
    },
    {
      title: 'Dịch vụ',
      dataIndex: ['service', 'name'],
      key: 'serviceName',
      render: (text: string, record: IQuantityRequestWithDetails) => (
        <Space>
          <Avatar icon={<AppstoreOutlined />} style={{ backgroundColor: '#52c41a' }} size='small' />
          <span>{record.service?.name || `ID: ${record.serviceId}`}</span>
        </Space>
      )
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      render: (text: string, record: IQuantityRequestWithDetails) => (
        <Space direction='vertical' size={0} style={{ width: '100%' }}>
          <Text>
            Hiện tại: <Text strong>{record.currentQuantity}</Text>
          </Text>
          <Text>
            Yêu cầu:{' '}
            <Text strong style={{ color: '#1890ff' }}>
              {record.requestedQuantity}
            </Text>
          </Text>
          <Progress
            percent={Math.round((record.currentQuantity / record.requestedQuantity) * 100)}
            size='small'
            status='active'
            format={() => `${record.currentQuantity}/${record.requestedQuantity}`}
          />
        </Space>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => (
        <Space>
          <CalendarOutlined />
          {dayjs(date).format('DD/MM/YYYY HH:mm')}
        </Space>
      ),
      sorter: (a: IQuantityRequestWithDetails, b: IQuantityRequestWithDetails) =>
        dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix()
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: QuantityRequestStatus) => (
        <Tag color={statusColors[status]} icon={statusIcons[status]}>
          {statusLabels[status]}
        </Tag>
      ),
      filters: [
        { text: 'Đang chờ', value: QuantityRequestStatus.PENDING },
        { text: 'Đã phê duyệt', value: QuantityRequestStatus.APPROVED },
        { text: 'Từ chối', value: QuantityRequestStatus.REJECTED }
      ],
      onFilter: (value: string, record: IQuantityRequestWithDetails) => record.status === value
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record: IQuantityRequestWithDetails) => (
        <Space size='small'>
          <Button type='dashed' icon={<FileSearchOutlined />} size='small' onClick={() => handleShowDetail(record)}>
            Chi tiết
          </Button>

          {record.status === QuantityRequestStatus.PENDING && (
            <>
              <Button
                type='primary'
                icon={<CheckOutlined />}
                size='small'
                onClick={() => handleShowActionModal(record, 'approve')}
              >
                Phê duyệt
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                size='small'
                onClick={() => handleShowActionModal(record, 'reject')}
              >
                Từ chối
              </Button>
            </>
          )}

          {record.status !== QuantityRequestStatus.PENDING && (
            <Badge status={record.status === QuantityRequestStatus.APPROVED ? 'success' : 'error'} text='Đã xử lý' />
          )}
        </Space>
      )
    }
  ]

  const renderStatCard = (title: string, value: number, icon: React.ReactNode, color: string) => (
    <Card hoverable className='stat-card'>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px', marginBottom: '8px' }}>{title}</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{value}</div>
        </div>
        <div
          style={{
            backgroundColor: `${color}20`,
            color: color,
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  )

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card style={{ marginBottom: '24px', borderRadius: '8px' }} bodyStyle={{ padding: '16px 24px' }}>
        <Row align='middle' justify='space-between'>
          <Col>
            <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
              <TeamOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
              Quản lý yêu cầu tăng số lần dịch vụ
            </Title>
          </Col>
          <Col>
            <Button type='primary' icon={<ReloadOutlined />} onClick={handleRefresh}>
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>{renderStatCard('Tổng số yêu cầu', stats.total, <PieChartOutlined />, '#1890ff')}</Col>
        <Col span={6}>{renderStatCard('Đang chờ xử lý', stats.pending, <ClockCircleOutlined />, '#faad14')}</Col>
        <Col span={6}>{renderStatCard('Đã phê duyệt', stats.approved, <CheckCircleOutlined />, '#52c41a')}</Col>
        <Col span={6}>{renderStatCard('Đã từ chối', stats.rejected, <CloseCircleOutlined />, '#ff4d4f')}</Col>
      </Row>

      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FilterOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            <span>Danh sách yêu cầu</span>
          </div>
        }
        extra={
          <Select
            defaultValue='all'
            style={{ width: 180 }}
            onChange={(value) => setStatusFilter(value as QuantityRequestStatus | 'all')}
            dropdownStyle={{ borderRadius: '6px' }}
          >
            <Option value='all'>Tất cả yêu cầu</Option>
            <Option value={QuantityRequestStatus.PENDING}>
              <ClockCircleOutlined style={{ color: '#faad14' }} /> Đang chờ
            </Option>
            <Option value={QuantityRequestStatus.APPROVED}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} /> Đã phê duyệt
            </Option>
            <Option value={QuantityRequestStatus.REJECTED}>
              <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> Từ chối
            </Option>
          </Select>
        }
        style={{ borderRadius: '8px' }}
        bodyStyle={{ padding: '0' }}
      >
        {error && <Alert message={error} type='error' style={{ margin: '16px' }} />}

        <Spin spinning={loading}>
          {requests?.length > 0 ? (
            <Table
              dataSource={requests}
              columns={columns}
              rowKey='_id'
              pagination={{
                pageSize: 10,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} yêu cầu`
              }}
              style={{ borderRadius: '8px' }}
            />
          ) : (
            <Empty
              style={{ padding: '40px 0' }}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span>
                  {statusFilter === 'all'
                    ? 'Không có yêu cầu tăng số lần dịch vụ nào'
                    : `Không có yêu cầu nào ở trạng thái ${statusLabels[statusFilter as QuantityRequestStatus]}`}
                </span>
              }
            />
          )}
        </Spin>
      </Card>

      {/* Modal phê duyệt/từ chối yêu cầu */}
      <Modal
        title={
          <div
            style={{ display: 'flex', alignItems: 'center', color: actionType === 'approve' ? '#52c41a' : '#ff4d4f' }}
          >
            {actionType === 'approve' ? (
              <CheckCircleOutlined style={{ marginRight: '8px' }} />
            ) : (
              <CloseCircleOutlined style={{ marginRight: '8px' }} />
            )}
            {actionType === 'approve' ? 'Phê duyệt yêu cầu' : 'Từ chối yêu cầu'}
          </div>
        }
        open={noteModalVisible}
        onCancel={() => setNoteModalVisible(false)}
        width={500}
        footer={[
          <Button key='cancel' onClick={() => setNoteModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key='submit'
            type={actionType === 'approve' ? 'primary' : 'danger'}
            loading={submitting}
            onClick={handleSubmitAction}
            icon={actionType === 'approve' ? <CheckOutlined /> : <CloseOutlined />}
          >
            {actionType === 'approve' ? 'Phê duyệt' : 'Từ chối'}
          </Button>
        ]}
        bodyStyle={{ padding: '20px' }}
      >
        {currentRequest && (
          <div style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <List size='small'>
              <List.Item>
                <Text type='secondary'>Người dùng:</Text>
                <Text strong>{currentRequest.user?.name || `ID: ${currentRequest.userId}`}</Text>
              </List.Item>
              <List.Item>
                <Text type='secondary'>Dịch vụ:</Text>
                <Text strong>{currentRequest.service?.name || `ID: ${currentRequest.serviceId}`}</Text>
              </List.Item>
              <List.Item>
                <Text type='secondary'>Số lượng:</Text>
                <Text>
                  {currentRequest.currentQuantity} →{' '}
                  <Text strong style={{ color: '#1890ff' }}>
                    {currentRequest.requestedQuantity}
                  </Text>
                </Text>
              </List.Item>
              <List.Item>
                <Text type='secondary'>Lý do:</Text>
                <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'xem thêm' }} style={{ margin: 0 }}>
                  {currentRequest.reason}
                </Paragraph>
              </List.Item>
            </List>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <Alert
            type={actionType === 'approve' ? 'success' : 'warning'}
            message={
              actionType === 'approve'
                ? 'Bạn có chắc chắn muốn phê duyệt yêu cầu này?'
                : 'Bạn có chắc chắn muốn từ chối yêu cầu này?'
            }
            showIcon
          />
        </div>

        <div>
          <Text>Ghi chú (tùy chọn):</Text>
          <TextArea
            rows={4}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder='Nhập ghi chú cho người dùng...'
            maxLength={500}
            showCount
            style={{ borderRadius: '8px', marginTop: '8px' }}
          />
        </div>
      </Modal>

      {/* Modal xem chi tiết yêu cầu */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <InfoCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Chi tiết yêu cầu
          </div>
        }
        open={showDetail}
        onCancel={() => setShowDetail(false)}
        width={600}
        footer={[
          <Button key='close' type='primary' onClick={() => setShowDetail(false)}>
            Đóng
          </Button>,
          currentRequest?.status === QuantityRequestStatus.PENDING && (
            <>
              <Button
                key='approve'
                type='primary'
                icon={<CheckOutlined />}
                onClick={() => {
                  setShowDetail(false)
                  if (currentRequest) handleShowActionModal(currentRequest, 'approve')
                }}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Phê duyệt
              </Button>
              <Button
                key='reject'
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  setShowDetail(false)
                  if (currentRequest) handleShowActionModal(currentRequest, 'reject')
                }}
              >
                Từ chối
              </Button>
            </>
          )
        ].filter(Boolean)}
      >
        {currentRequest && (
          <div>
            <Row gutter={[0, 16]}>
              <Col span={24}>
                <Card style={{ borderRadius: '8px' }} bodyStyle={{ padding: '16px' }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <div style={{ textAlign: 'center', padding: '16px' }}>
                        <Avatar
                          size={64}
                          icon={<UserOutlined />}
                          style={{ backgroundColor: '#1890ff', marginBottom: '8px' }}
                        />
                        <div>
                          <Text strong style={{ fontSize: '16px' }}>
                            {currentRequest.user?.name || `ID: ${currentRequest.userId}`}
                          </Text>
                        </div>
                      </div>
                    </Col>
                    <Col span={16}>
                      <List size='small' bordered={false}>
                        <List.Item>
                          <Text type='secondary' style={{ marginRight: '8px' }}>
                            Dịch vụ:
                          </Text>
                          <Text strong>{currentRequest.service?.name || `ID: ${currentRequest.serviceId}`}</Text>
                        </List.Item>
                        <List.Item>
                          <Text type='secondary' style={{ marginRight: '8px' }}>
                            Ngày tạo:
                          </Text>
                          <Text>{dayjs(currentRequest.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                        </List.Item>
                        <List.Item>
                          <Text type='secondary' style={{ marginRight: '8px' }}>
                            Trạng thái:
                          </Text>
                          <Tag color={statusColors[currentRequest.status]} icon={statusIcons[currentRequest.status]}>
                            {statusLabels[currentRequest.status]}
                          </Tag>
                        </List.Item>
                      </List>
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col span={24}>
                <Card
                  title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <PieChartOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                      Thông tin số lượng
                    </div>
                  }
                  style={{ borderRadius: '8px' }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic title='Số lượng hiện tại' value={currentRequest.currentQuantity} suffix='lần' />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title='Số lượng yêu cầu'
                        value={currentRequest.requestedQuantity}
                        valueStyle={{ color: '#1890ff' }}
                        suffix='lần'
                      />
                    </Col>
                    <Col span={24} style={{ marginTop: '16px' }}>
                      <Progress
                        percent={Math.round((currentRequest.currentQuantity / currentRequest.requestedQuantity) * 100)}
                        status='active'
                        format={() => `${currentRequest.currentQuantity}/${currentRequest.requestedQuantity}`}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col span={24}>
                <Card
                  title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FileTextOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                      Lý do yêu cầu
                    </div>
                  }
                  style={{ borderRadius: '8px' }}
                >
                  <Paragraph>{currentRequest.reason}</Paragraph>
                </Card>
              </Col>

              {currentRequest.adminNote && (
                <Col span={24}>
                  <Card
                    title={
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <InfoCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        Ghi chú của quản trị viên
                      </div>
                    }
                    style={{ borderRadius: '8px' }}
                  >
                    <Paragraph>{currentRequest.adminNote}</Paragraph>
                  </Card>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>

      <style jsx global>{`
        .stat-card {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
          transition: all 0.3s;
        }
        .stat-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }
        .ant-table {
          border-radius: 8px;
        }
        .ant-card-head {
          border-bottom: 1px solid #f0f0f0;
        }
        .ant-table-thead > tr > th {
          background-color: #fafafa;
        }
        .ant-progress-text {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.65);
        }
        .ant-btn {
          border-radius: 6px;
        }
        .ant-modal-content {
          border-radius: 8px;
          overflow: hidden;
        }
        .ant-modal-header {
          padding: 16px 24px;
        }
        .ant-list-item {
          padding: 8px 0;
          display: flex;
          justify-content: space-between;
        }
      `}</style>
    </div>
  )
}

export default AdminRequestsPage
