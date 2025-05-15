import { useQuery } from '@tanstack/react-query'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  FilterOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import { Avatar, Button, Card, Col, Image, Row, Segmented, Space, Table, TableColumnType, Typography } from 'antd'
import dayjs from 'dayjs'
import { Fragment, useEffect, useState } from 'react'
import { RequestStatus } from 'src/Constants/enum'
import { IQuantityRequest } from 'src/Interfaces/services/quantity-request.interfaces'
import quantityRequestApi from 'src/Service/services/services.quantityRequest.api'
import { handleRefresh } from 'src/Utils/util.utils'
import ExpandableParagraph from 'src/Components/ExpandableParagraph'
import { MdOutlineKeyboardDoubleArrowDown, MdOutlineKeyboardDoubleArrowUp } from 'react-icons/md'
import { renderStatusTag } from 'src/Utils/statusConfig'
const { Text, Title } = Typography

type ColumnsQuantityRequestType = IQuantityRequest

const LIMIT = 8
const PAGE = 1
const STALETIME = 5 * 60 * 1000

const UserQuantityRequest = () => {
  const [requestsData, setRequestsData] = useState<IQuantityRequest[]>([])
  const [pagination, setPagination] = useState({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all')

  // Fetch data from API
  const { data: requestsDataFetch, isLoading } = useQuery({
    queryKey: ['requestsUser', pagination.page, statusFilter],
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
      const response = await quantityRequestApi.getAllUserRequest(query)
      return response
    },
    staleTime: STALETIME
  })

  useEffect(() => {
    if (requestsDataFetch) {
      setRequestsData(requestsDataFetch.data.result.requests)
      setPagination({
        page: requestsDataFetch.data.result.page || PAGE,
        limit: requestsDataFetch.data.result.limit,
        total: requestsDataFetch.data.result.total
      })
    }
  }, [requestsDataFetch, pagination])

  const goToNextPage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page
    }))
  }

  const handleTableChange = async (page: number) => {
    goToNextPage(page)
  }

  const columns: TableColumnType<ColumnsQuantityRequestType>[] = [
    {
      title: 'Dịch vụ',
      dataIndex: 'service-name',
      key: 'service-name',
      fixed: 'left',
      width: 200,
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
          <span style={{ fontWeight: 500 }}>{record.service.map((sv) => sv.name)}</span>
        </Space>
      )
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      width: 250,
      align: 'center',
      render: (_, record) => {
        return (
          <Space
            direction='vertical'
            size={0}
            style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'start',
                justifyContent: 'flex-start',
                flexDirection: 'column'
              }}
            >
              <Text style={{ fontSize: '13px' }}>Số lượng ban đầu: {record.currentQuantity}</Text>

              <Text style={{ fontSize: '13px', fontWeight: 'bold', color: '#1890ff' }}>
                Số lượng yêu cầu: {record.requestedQuantity}
              </Text>
            </div>
          </Space>
        )
      }
    },
    {
      title: 'Lý do yêu cầu',
      dataIndex: 'reason',
      key: 'reason',
      width: 220,
      render: (reason: string) => (
        <ExpandableParagraph
          text={reason}
          rows={1}
          lessText={<MdOutlineKeyboardDoubleArrowUp />}
          moreText={<MdOutlineKeyboardDoubleArrowDown />}
        />
      )
    },
    {
      title: 'Ghi chú Admin',
      dataIndex: 'adminNote',
      key: 'adminNote',
      width: 200,
      render: (note: string) => (
        <ExpandableParagraph
          text={note ? note : 'Không có'}
          rows={1}
          lessText={<MdOutlineKeyboardDoubleArrowUp />}
          moreText={<MdOutlineKeyboardDoubleArrowDown />}
        />
      )
    },
    {
      title: 'Hình ảnh chứng minh',
      dataIndex: 'media',
      key: 'media',
      width: 200,
      align: 'center',
      render: (media) => (
        <Image
          preview={{ src: media }}
          style={{ objectFit: 'cover', borderRadius: '8px' }}
          width={'40px'}
          height={'40px'}
          src={media}
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
      sorter: (a: IQuantityRequest, b: IQuantityRequest) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix()
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      align: 'center',
      key: 'status',
      fixed: 'right',
      width: 200,
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
                <DashboardOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
                Yêu cầu tăng số lần dịch vụ của tôi
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
        >
          <Table
            sticky
            loading={isLoading}
            dataSource={requestsData}
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

export default UserQuantityRequest
