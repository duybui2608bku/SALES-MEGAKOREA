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
  Avatar,
  Badge,
  Progress,
  List,
  Tooltip,
  message,
  Segmented
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
  FileSearchOutlined,
  ArrowUpOutlined,
  ArrowRightOutlined,
  CommentOutlined,
  ExclamationCircleOutlined,
  DashboardOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import axiosInstanceMain from 'src/Service/axious.api'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input
const { confirm } = Modal

const statusColors = {
  [QuantityRequestStatus.PENDING]: '#faad14',
  [QuantityRequestStatus.APPROVED]: '#52c41a',
  [QuantityRequestStatus.REJECTED]: '#ff4d4f'
}

const statusBgColors = {
  [QuantityRequestStatus.PENDING]: 'rgba(250, 173, 20, 0.1)',
  [QuantityRequestStatus.APPROVED]: 'rgba(82, 196, 26, 0.1)',
  [QuantityRequestStatus.REJECTED]: 'rgba(255, 77, 79, 0.1)'
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
  const [messageApi, contextHolder] = message.useMessage()

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

      // Lọc dữ liệu theo trạng thái nếu filter khác 'all'
      const filteredData =
        statusFilter === 'all' ? data.result : data.result.filter((req) => req.status === statusFilter)

      setRequests(filteredData)
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
        note: adminNote,
        requestId: currentRequestId
      }

      if (actionType === 'approve') {
        await quantityRequestAPI.approveRequest(payload)
        messageApi.success('Yêu cầu đã được phê duyệt thành công')
      } else {
        await quantityRequestAPI.rejectRequest(currentRequestId, payload)
        messageApi.success('Yêu cầu đã bị từ chối')
      }

      setNoteModalVisible(false)
      fetchRequests()
      fetchStats()
    } catch (err) {
      console.error(`Failed to ${actionType} request:`, err)
      const action = actionType === 'approve' ? 'phê duyệt' : 'từ chối'
      messageApi.error(`Đã xảy ra lỗi khi ${action} yêu cầu. Vui lòng thử lại sau.`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmAction = (request: IQuantityRequestWithDetails, action: 'approve' | 'reject') => {
    confirm({
      title: action === 'approve' ? 'Phê duyệt yêu cầu này?' : 'Từ chối yêu cầu này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có thể thêm ghi chú khi sử dụng nút chi tiết',
      okText: action === 'approve' ? 'Phê duyệt' : 'Từ chối',
      okType: action === 'approve' ? 'primary' : 'danger',
      cancelText: 'Hủy',
      onOk() {
        handleShowActionModal(request, action)
      }
    })
  }

  const handleRefresh = () => {
    messageApi.loading('Đang tải lại dữ liệu...')
    fetchRequests()
    fetchStats()
    setTimeout(() => {
      messageApi.success('Dữ liệu đã được làm mới')
    }, 1000)
  }

  const handleStatusFilterChange = (value: string | number) => {
    setStatusFilter(value as QuantityRequestStatus | 'all')
  }

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: ['user', 'name'],
      key: 'userName',
      render: (text: string, record: IQuantityRequestWithDetails) => (
        <Space>
          <Avatar
            style={{
              background: `linear-gradient(120deg, #1677ff, #0958d9)`,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
          >
            {record.user?.name?.[0]?.toUpperCase() || <UserOutlined />}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.user?.name || `ID: ${record.userId}`}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.user?.email || 'Chưa có email'}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Dịch vụ',
      dataIndex: ['service', 'name'],
      key: 'serviceName',
      render: (text: string, record: IQuantityRequestWithDetails) => (
        <Space>
          <Avatar
            size='small'
            style={{
              backgroundColor: 'rgba(82, 196, 26, 0.2)',
              color: '#52c41a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AppstoreOutlined style={{ fontSize: '12px' }} />
          </Avatar>
          <span style={{ fontWeight: 500 }}>{record.service?.name || `ID: ${record.serviceId}`}</span>
        </Space>
      )
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      render: (text: string, record: IQuantityRequestWithDetails) => {
        const increase = record.requestedQuantity - record.currentQuantity
        const percent = Math.round((record.currentQuantity / record.requestedQuantity) * 100)

        return (
          <Space direction='vertical' size={0} style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <Text style={{ fontSize: '13px' }}>{record.currentQuantity}</Text>
              <ArrowRightOutlined style={{ margin: '0 4px', color: '#1890ff', fontSize: '12px' }} />
              <Text style={{ fontSize: '13px', fontWeight: 'bold', color: '#1890ff' }}>{record.requestedQuantity}</Text>
              <Tooltip title='Số lượng tăng thêm'>
                <Tag color='blue' style={{ marginLeft: '8px', fontSize: '12px' }}>
                  <ArrowUpOutlined /> {increase}
                </Tag>
              </Tooltip>
            </div>
            {/* <Progress
              percent={percent}
              size='small'
              status='active'
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068'
              }}
              style={{ marginBottom: 0 }}
            /> */}
          </Space>
        )
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CalendarOutlined style={{ color: '#8c8c8c', marginRight: '4px' }} />
            <span>{dayjs(date).format('DD/MM/YYYY')}</span>
          </div>
          <div style={{ marginLeft: '16px', color: '#8c8c8c', fontSize: '12px' }}>{dayjs(date).format('HH:mm')}</div>
        </div>
      ),
      sorter: (a: IQuantityRequestWithDetails, b: IQuantityRequestWithDetails) =>
        dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix()
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: QuantityRequestStatus) => (
        <Tag
          icon={statusIcons[status]}
          style={{
            color: statusColors[status],
            backgroundColor: statusBgColors[status],
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            fontWeight: 500
          }}
        >
          {statusLabels[status]}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record: IQuantityRequestWithDetails) => (
        <Space size='small'>
          <Button
            type='primary'
            ghost
            icon={<FileSearchOutlined />}
            size='middle'
            style={{ borderRadius: '6px' }}
            onClick={() => handleShowDetail(record)}
          >
            Chi tiết
          </Button>

          {record.status === QuantityRequestStatus.PENDING && (
            <>
              <Button
                type='primary'
                icon={<CheckOutlined />}
                size='middle'
                style={{
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                  borderRadius: '6px'
                }}
                onClick={() => handleConfirmAction(record, 'approve')}
              >
                Phê duyệt
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                size='middle'
                style={{ borderRadius: '6px' }}
                onClick={() => handleConfirmAction(record, 'reject')}
              >
                Từ chối
              </Button>
            </>
          )}

          {record.status !== QuantityRequestStatus.PENDING && (
            <Tooltip
              title={record.adminNote ? `Ghi chú: ${record.adminNote}` : 'Không có ghi chú'}
              placement='topRight'
            >
              <Button
                type='dashed'
                size='middle'
                icon={<CommentOutlined />}
                style={{
                  color: record.status === QuantityRequestStatus.APPROVED ? '#52c41a' : '#ff4d4f',
                  borderColor: record.status === QuantityRequestStatus.APPROVED ? '#52c41a' : '#ff4d4f',
                  borderRadius: '6px'
                }}
              >
                Đã xử lý
              </Button>
            </Tooltip>
          )}
        </Space>
      )
    }
  ]

  const renderStatCard = (title: string, value: number, icon: React.ReactNode, color: string, subTitle?: string) => (
    <Card hoverable className='stat-card' bodyStyle={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px', marginBottom: '8px' }}>{title}</div>
          <div style={{ fontSize: '30px', fontWeight: 'bold' }}>{value}</div>
          {subTitle && (
            <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '12px', marginTop: '4px' }}>{subTitle}</div>
          )}
        </div>
        <div
          style={{
            backgroundColor: `${color}20`,
            color: color,
            borderRadius: '12px',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            boxShadow: `0 4px 12px ${color}30`
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  )

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {contextHolder}

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
            <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
              <DashboardOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
              Quản lý yêu cầu tăng số lần dịch vụ
            </Title>
          </Col>
          <Col>
            <Button
              type='primary'
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              style={{
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
          {renderStatCard(
            'Tổng số yêu cầu',
            stats.total,
            <PieChartOutlined />,
            '#1890ff',
            'Tất cả các yêu cầu trong hệ thống'
          )}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderStatCard(
            'Đang chờ xử lý',
            stats.pending,
            <ClockCircleOutlined />,
            '#faad14',
            'Yêu cầu cần được xử lý'
          )}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderStatCard(
            'Đã phê duyệt',
            stats.approved,
            <CheckCircleOutlined />,
            '#52c41a',
            'Yêu cầu đã được chấp nhận'
          )}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderStatCard(
            'Đã từ chối',
            stats.rejected,
            <CloseCircleOutlined />,
            '#ff4d4f',
            'Yêu cầu không được chấp nhận'
          )}
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
                value: QuantityRequestStatus.PENDING
              },
              {
                label: (
                  <div style={{ padding: '0 4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} /> Đã duyệt
                    </div>
                  </div>
                ),
                value: QuantityRequestStatus.APPROVED
              },
              {
                label: (
                  <div style={{ padding: '0 4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> Từ chối
                    </div>
                  </div>
                ),
                value: QuantityRequestStatus.REJECTED
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
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} yêu cầu`,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50']
              }}
              style={{ borderRadius: '12px' }}
            />
          ) : (
            <Empty
              style={{ padding: '80px 0' }}
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
            style={{
              display: 'flex',
              alignItems: 'center',
              color: actionType === 'approve' ? '#52c41a' : '#ff4d4f',
              padding: '8px 0'
            }}
          >
            {actionType === 'approve' ? (
              <CheckCircleOutlined style={{ marginRight: '8px', fontSize: '20px' }} />
            ) : (
              <CloseCircleOutlined style={{ marginRight: '8px', fontSize: '20px' }} />
            )}
            {actionType === 'approve' ? 'Phê duyệt yêu cầu' : 'Từ chối yêu cầu'}
          </div>
        }
        open={noteModalVisible}
        onCancel={() => setNoteModalVisible(false)}
        width={500}
        footer={[
          <Button key='cancel' onClick={() => setNoteModalVisible(false)} style={{ borderRadius: '6px' }}>
            Hủy
          </Button>,
          <Button
            key='submit'
            type={actionType === 'approve' ? 'primary' : 'danger'}
            loading={submitting}
            onClick={handleSubmitAction}
            icon={actionType === 'approve' ? <CheckOutlined /> : <CloseOutlined />}
            style={{ borderRadius: '6px' }}
          >
            {actionType === 'approve' ? 'Phê duyệt' : 'Từ chối'}
          </Button>
        ]}
        bodyStyle={{ padding: '20px' }}
        centered
        styles={{ header: { paddingBottom: 0, borderBottom: 'none' } }}
      >
        {currentRequest && (
          <div
            style={{
              backgroundColor: '#f9f9f9',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '16px',
              border: '1px solid #f0f0f0'
            }}
          >
            <List size='small' split={false}>
              <List.Item style={{ padding: '4px 0' }}>
                <Text type='secondary'>Người dùng:</Text>
                <Text strong>{currentRequest.user?.name || `ID: ${currentRequest.userId}`}</Text>
              </List.Item>
              <List.Item style={{ padding: '4px 0' }}>
                <Text type='secondary'>Dịch vụ:</Text>
                <Text strong>{currentRequest.service?.name || `ID: ${currentRequest.serviceId}`}</Text>
              </List.Item>
              <List.Item style={{ padding: '4px 0' }}>
                <Text type='secondary'>Số lượng:</Text>
                <Text>
                  <Text style={{ color: '#8c8c8c' }}>{currentRequest.currentQuantity}</Text>
                  <ArrowRightOutlined style={{ margin: '0 4px', color: '#1890ff', fontSize: '12px' }} />
                  <Text strong style={{ color: '#1890ff' }}>
                    {currentRequest.requestedQuantity}
                  </Text>
                </Text>
              </List.Item>
              <List.Item style={{ padding: '4px 0' }}>
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
            style={{ borderRadius: '8px' }}
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 0'
            }}
          >
            <InfoCircleOutlined style={{ marginRight: '8px', color: '#1890ff', fontSize: '20px' }} />
            Chi tiết yêu cầu
          </div>
        }
        open={showDetail}
        onCancel={() => setShowDetail(false)}
        width={700}
        footer={[
          <Button key='close' type='default' onClick={() => setShowDetail(false)} style={{ borderRadius: '6px' }}>
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
                style={{
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                  borderRadius: '6px'
                }}
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
                style={{ borderRadius: '6px' }}
              >
                Từ chối
              </Button>
            </>
          )
        ].filter(Boolean)}
        centered
        styles={{
          header: { paddingBottom: 0, borderBottom: 'none' },
          body: { maxHeight: '80vh', overflowY: 'auto' }
        }}
      >
        {currentRequest && (
          <div>
            <Row gutter={[0, 16]}>
              <Col span={24}>
                <Card
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <Row gutter={16} align='middle'>
                    <Col xs={24} sm={8}>
                      <div style={{ textAlign: 'center', padding: '16px' }}>
                        <Avatar
                          size={80}
                          style={{
                            background: `linear-gradient(120deg, #1677ff, #0958d9)`,
                            marginBottom: '16px',
                            fontSize: '32px',
                            boxShadow: '0 4px 16px rgba(24, 144, 255, 0.2)'
                          }}
                        >
                          {currentRequest.user?.name?.[0]?.toUpperCase() || <UserOutlined />}
                        </Avatar>
                        <div>
                          <Text strong style={{ fontSize: '16px', display: 'block' }}>
                            {currentRequest.user?.name || `ID: ${currentRequest.userId}`}
                          </Text>
                          {currentRequest.user?.email && (
                            <Text type='secondary' style={{ fontSize: '14px' }}>
                              {currentRequest.user.email}
                            </Text>
                          )}
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={16}>
                      <List size='small' bordered={false}>
                        <List.Item>
                          <Space align='baseline' style={{ width: '100%', justifyContent: 'space-between' }}>
                            <Text type='secondary'>Dịch vụ:</Text>
                            <Space>
                              <Avatar
                                size='small'
                                style={{
                                  backgroundColor: 'rgba(82, 196, 26, 0.2)',
                                  color: '#52c41a'
                                }}
                              >
                                <AppstoreOutlined style={{ fontSize: '12px' }} />
                              </Avatar>
                              <Text strong>{currentRequest.service?.name || `ID: ${currentRequest.serviceId}`}</Text>
                            </Space>
                          </Space>
                        </List.Item>
                        <List.Item>
                          <Space align='baseline' style={{ width: '100%', justifyContent: 'space-between' }}>
                            <Text type='secondary'>Ngày tạo:</Text>
                            <Text>{dayjs(currentRequest.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                          </Space>
                        </List.Item>
                        <List.Item>
                          <Space align='baseline' style={{ width: '100%', justifyContent: 'space-between' }}>
                            <Text type='secondary'>Trạng thái:</Text>
                            <Tag
                              color={statusColors[currentRequest.status]}
                              icon={statusIcons[currentRequest.status]}
                              style={{
                                backgroundColor: statusBgColors[currentRequest.status],
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontWeight: 500
                              }}
                            >
                              {statusLabels[currentRequest.status]}
                            </Tag>
                          </Space>
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
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Card bordered={false} style={{ backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                        <Statistic
                          title={<Text type='secondary'>Số lượng hiện tại</Text>}
                          value={currentRequest.currentQuantity}
                          suffix='lần'
                          valueStyle={{ color: '#595959', fontSize: '28px' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} md={12}>
                      <Card
                        bordered={false}
                        style={{ backgroundColor: 'rgba(24, 144, 255, 0.05)', borderRadius: '8px' }}
                      >
                        <Statistic
                          title={<Text type='secondary'>Số lượng yêu cầu</Text>}
                          value={currentRequest.requestedQuantity}
                          valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 600 }}
                          suffix='lần'
                        />
                      </Card>
                    </Col>
                    <Col span={24} style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <Text>Tăng so với hiện tại:</Text>
                        <Text strong style={{ color: '#1890ff' }}>
                          {currentRequest.requestedQuantity - currentRequest.currentQuantity} lần
                        </Text>
                      </div>
                      <Progress
                        percent={Math.round((currentRequest.currentQuantity / currentRequest.requestedQuantity) * 100)}
                        status='active'
                        format={(percent) => `${percent}%`}
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068'
                        }}
                      />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginTop: '4px',
                          fontSize: '13px',
                          color: '#8c8c8c'
                        }}
                      >
                        <span>{currentRequest.currentQuantity} lần</span>
                        <span>{currentRequest.requestedQuantity} lần</span>
                      </div>
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
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <Paragraph style={{ backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '8px', margin: 0 }}>
                    {currentRequest.reason || 'Không có lý do cụ thể.'}
                  </Paragraph>
                </Card>
              </Col>

              {currentRequest.adminNote && (
                <Col span={24}>
                  <Card
                    title={
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <CommentOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        Ghi chú của quản trị viên
                      </div>
                    }
                    style={{
                      borderRadius: '12px',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
                    }}
                    bodyStyle={{ padding: '20px' }}
                    extra={
                      <Tag color={currentRequest.status === QuantityRequestStatus.APPROVED ? 'success' : 'error'}>
                        {currentRequest.status === QuantityRequestStatus.APPROVED ? 'Đã phê duyệt' : 'Đã từ chối'}
                      </Tag>
                    }
                  >
                    <Paragraph
                      style={{
                        backgroundColor:
                          currentRequest.status === QuantityRequestStatus.APPROVED
                            ? 'rgba(82, 196, 26, 0.05)'
                            : 'rgba(255, 77, 79, 0.05)',
                        padding: '16px',
                        borderRadius: '8px',
                        margin: 0,
                        borderLeft:
                          currentRequest.status === QuantityRequestStatus.APPROVED
                            ? '4px solid #52c41a'
                            : '4px solid #ff4d4f'
                      }}
                    >
                      {currentRequest.adminNote}
                    </Paragraph>
                  </Card>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>

      <style jsx global>{`
        .stat-card {
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
  )
}

export default AdminRequestsPage
