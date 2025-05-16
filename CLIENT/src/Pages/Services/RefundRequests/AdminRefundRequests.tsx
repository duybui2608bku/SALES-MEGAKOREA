import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Dropdown,
  List,
  message,
  Modal,
  Row,
  Segmented,
  Space,
  Statistic,
  Table,
  TableColumnType,
  Tag,
  Typography
} from 'antd'
import {
  AppstoreOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  CommentOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  PieChartOutlined,
  ReloadOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Fragment } from 'react/jsx-runtime'
import { RefundEnum, RequestStatus } from 'src/Constants/enum'
import { handleRefresh, validateQuery } from 'src/Utils/util.utils'
import { GiTakeMyMoney } from 'react-icons/gi'
import StatCard from 'src/Components/StatsCard'
import { useEffect, useState } from 'react'
import {
  ApproveRefundRequestBody,
  RefundRequest,
  RejectRefundRequestBody
} from 'src/Interfaces/services/refund-request.interfaces'
import { useMutation, useQuery } from '@tanstack/react-query'
import refundRequestApi from 'src/Service/services/services.refundRequest.api'
import dayjs from 'dayjs'
import { renderRefundTag, renderStatusTag } from 'src/Utils/statusConfig'
import { MdOutlineKeyboardDoubleArrowDown, MdOutlineKeyboardDoubleArrowUp } from 'react-icons/md'
import ExpandableParagraph from 'src/Components/ExpandableParagraph'
import { queryClient } from 'src/main'
import createOptimisticUpdateHandler from 'src/Function/product/createOptimisticUpdateHandler'
import HttpStatusCode from 'src/Constants/httpCode'
import TextArea from 'antd/es/input/TextArea'

const { confirm } = Modal
const { Title, Text, Paragraph } = Typography
type ColumnsRefundRequestType = RefundRequest

const LIMIT = 8
const PAGE = 1
const STALETIME = 5 * 60 * 1000

const AdminRefundRequest = () => {
  const [allRefundRequestAdminData, setAllRefundRequestAdminData] = useState<RefundRequest[]>([])
  const [pagination, setPagination] = useState({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })
  const [stats, setStats] = useState<{
    total: number
    pending: number
    approved: number
    rejected: number
  }>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all')
  const [noteModalVisible, setNoteModalVisible] = useState<boolean>(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null)
  const [currentRequest, setCurrentRequest] = useState<RefundRequest | null>(null)
  const [adminNote, setAdminNote] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [showDetail, setShowDetail] = useState<boolean>(false)

  // Fetch data allRefundRequest API
  const { data: allRefundRequestAdminDataFetch, isLoading: loadingAllRefundRequest } = useQuery({
    queryKey: ['refundRequestsAdmin', statusFilter, pagination.page],
    queryFn: async () => {
      const body =
        statusFilter === 'all'
          ? {
              status: '',
              page: pagination.page,
              limit: pagination.limit
            }
          : {
              page: pagination.page,
              limit: pagination.limit,
              status: statusFilter
            }
      const response = await refundRequestApi.getAllRequestAdmin(body)
      return response
    },
    staleTime: STALETIME
  })

  useEffect(() => {
    if (allRefundRequestAdminDataFetch?.data.success) {
      const data = allRefundRequestAdminDataFetch.data.result
      setAllRefundRequestAdminData(data.requests)
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total
      })
    }
  }, [allRefundRequestAdminDataFetch])

  const goToNextPage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page
    }))
  }

  const handleTableChange = async (page: number) => {
    goToNextPage(page)
  }

  // Fetch data stats from API
  const { data: statsRequestAdminDataFetch, isLoading: loadingStats } = useQuery({
    queryKey: ['statsRequestAdmin'],
    queryFn: async () => {
      const response = await refundRequestApi.getRequestStatsAdmin()
      return response
    },
    staleTime: STALETIME
  })

  useEffect(() => {
    if (statsRequestAdminDataFetch?.data.success) {
      const data = statsRequestAdminDataFetch?.data.result
      setStats({
        approved: data.approved,
        rejected: data.rejected,
        pending: data.pending,
        total: data.total
      })
    }
  }, [statsRequestAdminDataFetch])

  const handleShowActionModal = (request: RefundRequest, action: 'approve' | 'reject') => {
    setCurrentRequestId(request._id)
    setCurrentRequest(request)
    setActionType(action)
    setAdminNote('')
    setNoteModalVisible(true)
  }

  const handleShowDetail = (request: RefundRequest) => {
    setCurrentRequest(request)
    setShowDetail(true)
  }

  const approveRequestMutation = useMutation({
    mutationFn: (payload: ApproveRefundRequestBody) => refundRequestApi.approveRequestAdmin(payload),
    onMutate: async () => {
      return createOptimisticUpdateHandler(queryClient, ['refundRequestsAdmin'])()
    },
    onSuccess: () => {
      message.success('Yêu cầu đã được phê duyệt thành công!')
      // queryClient.invalidateQueries({ queryKey: ['refundRequestsAdmin'] })
      validateQuery(['services-card-sold-customer', 'refundRequestsAdmin', 'refundRequestUser'])
    },
    onError: (error: any, _, context) => {
      queryClient.setQueryData(['services-card-sold-customer'], context?.previousData)
      const errorMsg =
        error.response?.status === HttpStatusCode.BadRequest
          ? 'Dữ liệu không hợp lệ!'
          : error.response?.status === HttpStatusCode.NotFound
            ? 'Thẻ dịch vụ không tồn tại!'
            : `Lỗi khi cập nhật thẻ dịch vụ: ${error.message}`
      message.error(errorMsg)
    }
  })

  const rejectRequestMutation = useMutation({
    mutationFn: (payload: RejectRefundRequestBody) => refundRequestApi.rejectRequestAdmin(payload),
    onMutate: async () => {
      return createOptimisticUpdateHandler(queryClient, ['refundRequestsAdmin'])()
    },
    onSuccess: () => {
      message.success('Yêu cầu đã bị từ chối!')
      queryClient.invalidateQueries({ queryKey: ['refundRequestsAdmin'] })
    },
    onError: (error: any, _, context) => {
      queryClient.setQueryData(['services-card-sold-customer'], context?.previousData)
      const errorMsg =
        error.response?.status === HttpStatusCode.BadRequest
          ? 'Dữ liệu không hợp lệ!'
          : error.response?.status === HttpStatusCode.NotFound
            ? 'Thẻ dịch vụ không tồn tại!'
            : `Lỗi khi cập nhật thẻ dịch vụ: ${error.message}`
      message.error(errorMsg)
    }
  })

  const handleSubmitAction = async () => {
    if (!currentRequestId || !actionType) return

    try {
      setSubmitting(true)

      const payload: RejectRefundRequestBody = {
        note: adminNote,
        request_id: currentRequestId
      }

      if (actionType === 'approve') {
        approveRequestMutation.mutate(payload)
      } else {
        rejectRequestMutation.mutate(payload)
        message.success('Yêu cầu đã bị từ chối')
      }

      setNoteModalVisible(false)
    } catch (err) {
      console.error(`Failed to ${actionType} request:`, err)
      const action = actionType === 'approve' ? 'phê duyệt' : 'từ chối'
      message.error(`Đã xảy ra lỗi khi ${action} yêu cầu. Vui lòng thử lại sau.`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmAction = (request: RefundRequest, action: 'approve' | 'reject') => {
    confirm({
      centered: true,
      title: action === 'approve' ? 'Phê duyệt yêu cầu này?' : 'Từ chối yêu cầu này?',
      icon: <ExclamationCircleOutlined />,
      content:
        action === 'approve'
          ? 'Bạn có chắc chắn muốn phê duyệt yêu cầu này không?'
          : 'Bạn có chắc chắn muốn từ chối yêu cầu này không?',
      okText: action === 'approve' ? 'Phê duyệt' : 'Từ chối',
      okType: action === 'approve' ? 'primary' : 'danger',
      cancelText: 'Hủy',
      onOk() {
        handleShowActionModal(request, action)
      }
    })
  }

  const columns: TableColumnType<ColumnsRefundRequestType>[] = [
    {
      title: 'Người dùng',
      dataIndex: ['user', 'name'],
      key: 'userName',
      width: 300,
      render: (_, record) => (
        <Space>
          <Avatar
            style={{
              background: `linear-gradient(120deg, #1677ff, #0958d9)`,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
          >
            {record.user?.name.toUpperCase() || <UserOutlined />}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.user?.name}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {record.user.email ? `Email: ${record.user.email}` : 'Email: Không có'}
            </div>
          </div>
        </Space>
      )
    },
    {
      title: 'Dịch vụ',
      dataIndex: ['service', 'name'],
      key: 'serviceName',
      width: 320,
      render: (_, record) => (
        <Space style={{ gap: '20px' }}>
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
          <span style={{ fontWeight: 500 }}>{`ID: ${record.services_card_sold_of_customer_id}`}</span>
        </Space>
      )
    },
    {
      title: 'Tiền khách thanh toán',
      key: 'current_price',
      dataIndex: 'current_price',
      width: 220,
      align: 'center',
      render: (current_price: number) => {
        return (
          <Text style={{ color: '#ff4d4f', fontSize: '15px' }} strong>
            {current_price.toLocaleString('vi-VN')} đ
          </Text>
        )
      }
    },
    {
      title: 'Yêu cầu hoàn tiền',
      key: 'requested_price',
      dataIndex: 'requested_price',
      width: 200,
      align: 'center',
      render: (requested_price: number) => {
        return (
          <Text style={{ color: '#FF9900', fontSize: '15px' }} strong>
            {requested_price.toLocaleString('vi-VN')} đ
          </Text>
        )
      }
    },
    {
      title: 'Phương thức hoàn tiền',
      key: 'refund_type',
      dataIndex: 'refund_type',
      width: 250,
      render: (refundType: RefundEnum) => renderRefundTag(refundType)
    },
    {
      title: 'Lý do yêu cầu',
      dataIndex: 'reason',
      key: 'reason',
      width: 220,
      render: (reason: string) => (
        <ExpandableParagraph
          text={reason}
          rows={2}
          lessText={<MdOutlineKeyboardDoubleArrowUp />}
          moreText={<MdOutlineKeyboardDoubleArrowDown />}
        />
      )
    },
    {
      title: 'Ghi chú Admin',
      dataIndex: 'admin_note',
      key: 'admin_note',
      width: 200,
      render: (note: string) => (
        <ExpandableParagraph
          text={note ? note : ''}
          rows={2}
          lessText={<MdOutlineKeyboardDoubleArrowUp />}
          moreText={<MdOutlineKeyboardDoubleArrowDown />}
        />
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      width: 220,
      render: (date: Date) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarOutlined style={{ color: '#8c8c8c', marginRight: '4px' }} />
            <span>{dayjs(date).format('DD/MM/YYYY')}</span>
            <div style={{ marginLeft: '16px', color: '#8c8c8c', fontSize: '12px' }}>{dayjs(date).format('HH:mm')}</div>
          </div>
        </div>
      ),
      sorter: (a: RefundRequest, b: RefundRequest) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix()
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      align: 'center',
      key: 'status',
      fixed: 'right',
      width: 180,
      render: (status: RequestStatus) => renderStatusTag(status)
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      fixed: 'right',
      width: 180,
      render: (_, record) => {
        const menuItems = [
          {
            key: 'detail',
            icon: <FileSearchOutlined style={{ color: '#1677ff' }} />,
            label: 'Chi tiết',
            onClick: () => handleShowDetail(record)
          }
        ]

        // Thêm các mục menu phụ thuộc vào điều kiện
        if (record.status === RequestStatus.PENDING) {
          menuItems.push(
            {
              key: 'approve',
              icon: <CheckOutlined style={{ color: '#52c41a' }} />,
              label: 'Phê duyệt',
              onClick: () => handleConfirmAction(record, 'approve')
            },
            {
              key: 'reject',
              icon: <CloseOutlined style={{ color: '#ff4d4f' }} />,
              label: 'Từ chối',
              onClick: () => handleConfirmAction(record, 'reject')
            }
          )
        }

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button style={{ borderRadius: '6px', fontSize: '11px', height: '28px' }}>
              Hành động <DownOutlined style={{ fontSize: '10px' }} />
            </Button>
          </Dropdown>
        )
      }
    }
  ]

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
          styles={{
            body: {
              padding: '20px 24px'
            }
          }}
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
            <StatCard title='Tổng số yêu cầu' value={stats.total} icon={<PieChartOutlined />} color='#1890ff' />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard title='Đang chờ xử lý' value={stats.pending} icon={<ClockCircleOutlined />} color='#faad14' />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard title='Đã phê duyệt' value={stats.approved} icon={<CheckCircleOutlined />} color='#52c41a' />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard title='Đã từ chối' value={stats.rejected} icon={<CloseCircleOutlined />} color='#ff4d4f' />
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
          styles={{
            body: {
              padding: '0'
            }
          }}
        >
          <Table
            sticky
            loading={loadingAllRefundRequest || loadingStats}
            dataSource={allRefundRequestAdminData}
            columns={columns}
            rowKey='_id'
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              onChange: handleTableChange,
              position: ['bottomCenter']
            }}
            style={{ borderRadius: '12px', width: '100%' }}
            scroll={{ x: '1200px' }}
          />
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
              type='primary'
              danger={actionType !== 'approve'}
              loading={submitting}
              onClick={handleSubmitAction}
              icon={actionType === 'approve' ? <CheckOutlined /> : <CloseOutlined />}
              style={{ borderRadius: '6px' }}
            >
              {actionType === 'approve' ? 'Phê duyệt' : 'Từ chối'}
            </Button>
          ]}
          centered
          styles={{
            header: { paddingBottom: 0, borderBottom: 'none' },
            body: {
              padding: '20px'
            }
          }}
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
                  <Text strong>{currentRequest.user?.name || `ID: ${currentRequest._id}`}</Text>
                </List.Item>
                <List.Item style={{ padding: '4px 0' }}>
                  <Text type='secondary'>Dịch vụ:</Text>
                  <Text strong>{`ID: ${currentRequest.services_card_sold_of_customer_id}`}</Text>
                </List.Item>
                <List.Item style={{ padding: '4px 0' }}>
                  <Text type='secondary'>Số tiền cần hoàn:</Text>
                  <Text>
                    <Text strong style={{ color: '#1890ff' }}>
                      {currentRequest.requested_price.toLocaleString('vi-VN')} đ
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
            currentRequest?.status === RequestStatus.PENDING && (
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
            body: { overflowY: 'auto' }
          }}
        >
          {currentRequest && (
            <div
              style={{
                height: '70vh',
                overflowY: 'scroll'
              }}
            >
              <Row gutter={[0, 16]}>
                <Col span={24}>
                  <Card
                    style={{
                      borderRadius: '12px',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
                    }}
                    styles={{
                      body: {
                        padding: '20px'
                      }
                    }}
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
                            {currentRequest.user?.name?.toUpperCase() || <UserOutlined />}
                          </Avatar>
                          <div>
                            <Text strong style={{ fontSize: '16px', display: 'block' }}>
                              {currentRequest.user?.name || `ID: ${currentRequest.user._id}`}
                            </Text>
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={16}>
                        <List size='small' bordered={false}>
                          <List.Item>
                            <Space align='baseline' style={{ width: '100%', justifyContent: 'space-between' }}>
                              <Text type='secondary'>Ngày tạo:</Text>
                              <Text>{dayjs(currentRequest.created_at).format('DD/MM/YYYY HH:mm')}</Text>
                            </Space>
                          </List.Item>
                          <List.Item>
                            <Space align='baseline' style={{ width: '100%', justifyContent: 'space-between' }}>
                              <Text type='secondary'>Số tiền cần hoàn:</Text>
                              <Text strong style={{ color: '#faad14', fontSize: '15px' }}>
                                {currentRequest.requested_price.toLocaleString('vi-VN')} đ
                              </Text>
                            </Space>
                          </List.Item>
                          <List.Item>
                            <Space align='baseline' style={{ width: '100%', justifyContent: 'space-between' }}>
                              <Text type='secondary'>Trạng thái:</Text>
                              {renderStatusTag(currentRequest.status)}
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
                    styles={{
                      body: {
                        padding: '20px'
                      }
                    }}
                  >
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Card style={{ backgroundColor: '#f9f9f9', borderRadius: '8px', border: 'none' }}>
                          <Statistic
                            title={<Text type='secondary'>Tiền khách thanh toán</Text>}
                            value={currentRequest.current_price.toLocaleString('vi-VN')}
                            suffix='đ'
                            valueStyle={{ color: '#595959', fontSize: '20px' }}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} md={12}>
                        <Card
                          style={{ backgroundColor: 'rgba(24, 144, 255, 0.05)', borderRadius: '8px', border: 'none' }}
                        >
                          <Statistic
                            title={<Text type='secondary'>Số tiền cần hoàn</Text>}
                            value={currentRequest.requested_price.toLocaleString('vi-VN')}
                            valueStyle={{ color: '#1890ff', fontSize: '20px', fontWeight: 600 }}
                            suffix='đ'
                          />
                        </Card>
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
                    styles={{
                      body: {
                        padding: '20px'
                      }
                    }}
                  >
                    <Paragraph style={{ backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '8px', margin: 0 }}>
                      {currentRequest.reason || 'Không có lý do cụ thể.'}
                    </Paragraph>
                  </Card>
                </Col>

                {currentRequest.admin_note && (
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
                      styles={{
                        body: {
                          padding: '20px'
                        }
                      }}
                      extra={
                        <Tag color={currentRequest.status === RequestStatus.APPROVED ? 'success' : 'error'}>
                          {currentRequest.status === RequestStatus.APPROVED ? 'Đã phê duyệt' : 'Đã từ chối'}
                        </Tag>
                      }
                    >
                      <Paragraph
                        style={{
                          backgroundColor:
                            currentRequest.status === RequestStatus.APPROVED
                              ? 'rgba(82, 196, 26, 0.05)'
                              : 'rgba(255, 77, 79, 0.05)',
                          padding: '16px',
                          borderRadius: '8px',
                          margin: 0,
                          borderLeft:
                            currentRequest.status === RequestStatus.APPROVED ? '4px solid #52c41a' : '4px solid #ff4d4f'
                        }}
                      >
                        {currentRequest.admin_note}
                      </Paragraph>
                    </Card>
                  </Col>
                )}
              </Row>
            </div>
          )}
        </Modal>

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
