import { Avatar, Button, Card, Col, Row, Segmented, Space, Table, TableColumnType, Typography } from 'antd'
import { Fragment } from 'react/jsx-runtime'
import {
  AppstoreOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  UserOutlined
} from '@ant-design/icons'
import { handleRefresh } from 'src/Utils/util.utils'
import { GiTakeMyMoney } from 'react-icons/gi'
import { RefundEnum, RequestStatus } from 'src/Constants/enum'
import { useEffect, useState } from 'react'
import { RefundRequest } from 'src/Interfaces/services/refund-request.interfaces'
import { useQuery } from '@tanstack/react-query'
import refundRequestApi from 'src/Service/services/services.refundRequest.api'
import ExpandableParagraph from 'src/Components/ExpandableParagraph'
import { MdOutlineKeyboardDoubleArrowDown, MdOutlineKeyboardDoubleArrowUp } from 'react-icons/md'
import dayjs from 'dayjs'
import { renderRefundTag, renderStatusTag } from 'src/Utils/statusConfig'

const { Title, Text } = Typography
type ColumnsRefundRequestType = RefundRequest

const LIMIT = 8
const PAGE = 1
const STALETIME = 5 * 60 * 1000
const UserRefundRequest = () => {
  const [refundRequestData, setRefundRequestData] = useState<RefundRequest[]>([])
  const [pagination, setPagination] = useState({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all')

  // Fetch data from API
  const { data: refundRequestDataFetch, isLoading } = useQuery({
    queryKey: ['refundRequestUser', pagination.page, statusFilter],
    queryFn: async () => {
      const query =
        statusFilter !== 'all'
          ? {
              page: pagination.page,
              limit: pagination.limit,
              status: statusFilter
            }
          : {
              status: '',
              page: pagination.page,
              limit: pagination.limit
            }
      const response = await refundRequestApi.getAllUserRequest(query)
      return response
    },
    staleTime: STALETIME
  })

  useEffect(() => {
    if (refundRequestDataFetch) {
      setRefundRequestData(refundRequestDataFetch.data.result.requests)
      setPagination({
        page: refundRequestDataFetch.data.result.page,
        limit: refundRequestDataFetch.data.result.limit,
        total: refundRequestDataFetch.data.result.total
      })
    }
  }, [refundRequestDataFetch, pagination])

  const goToNextPage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page
    }))
  }

  const handleTableChange = async (page: number) => {
    goToNextPage(page)
  }

  const columns: TableColumnType<ColumnsRefundRequestType>[] = [
    {
      title: 'Người dùng',
      dataIndex: ['user', 'name'],
      key: 'userName',
      width: 250,
      fixed: 'left',
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
              {record.branch ? `Chi nhánh: ${record.branch.name}` : 'Chi nhánh: Không có'}
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
      width: 230,
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
                onClick={() => handleRefresh('refundRequestUser')}
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
          styles={{
            body: {
              padding: '0'
            }
          }}
        >
          <Table
            sticky
            loading={isLoading}
            dataSource={refundRequestData}
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
      </div>
    </Fragment>
  )
}

export default UserRefundRequest
