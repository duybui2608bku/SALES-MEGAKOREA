import { useQuery } from '@tanstack/react-query'
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { Col, Image, Row, Select, Space, Table, TableColumnType, Tag, Tooltip, Typography } from 'antd'
import dayjs from 'dayjs'
import { Fragment, useEffect, useState } from 'react'
import Title from 'src/Components/Title'
import { QuantityRequestStatus } from 'src/Constants/enum'
import { IQuantityRequest } from 'src/Interfaces/services/quantity-request.interfaces'
import quantityRequestApi from 'src/Service/services/services.quantityRequest.api'
const { Text } = Typography

type ColumnsQuantityRequestType = IQuantityRequest

const LIMIT = 8
const PAGE = 1
const STALETIME = 5 * 60 * 1000

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

const UserRequest = () => {
  const [requestsData, setRequestsData] = useState<IQuantityRequest[]>([])
  const [pagination, setPagination] = useState({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })
  const [statusFilter, setStatusFilter] = useState<QuantityRequestStatus | 'all'>('all')

  // Fetch data from API
  const { data: requestsDataFetch, isLoading } = useQuery({
    queryKey: ['requestsUser', pagination.page, statusFilter],
    queryFn: async () => {
      const response = await quantityRequestApi.getAllUserRequest({})
      return response
    },
    staleTime: STALETIME
  })

  useEffect(() => {
    if (requestsDataFetch) {
      // const result = requestsDataFetch
      setRequestsData(requestsDataFetch.data.result.requests)
      setPagination({
        page: requestsDataFetch.data.result.page || PAGE,
        limit: requestsDataFetch.data.result.limit,
        total: requestsDataFetch.data.result.total
      })
    }
  }, [requestsDataFetch, pagination])

  const columns: TableColumnType<ColumnsQuantityRequestType>[] = [
    {
      title: 'Dịch vụ',
      dataIndex: 'service-name',
      key: 'service-name',
      fixed: 'left',
      width: 150,
      render: (_, record) => <Text>{record.service.map((sv) => sv.name)}</Text>
    },
    {
      title: 'Số lượng hiện tại',
      align: 'center',
      dataIndex: 'currentQuantity',
      key: 'currentQuantity',
      width: 180
    },
    {
      title: 'Số lượng yêu cầu',
      align: 'center',
      dataIndex: 'requestedQuantity',
      key: 'requestedQuantity',
      width: 180
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      width: 200,
      render: (note: string | undefined) => (
        <Tooltip title={note}>
          <Text>{note || 'Không có'}</Text>
        </Tooltip>
      ),
      ellipsis: true
    },
    {
      title: 'Ghi chú Admin',
      dataIndex: 'adminNote',
      key: 'adminNote',
      width: 200,
      render: (note: string | undefined) => (
        <Tooltip title={note}>
          <Text>{note || 'Không có'}</Text>
        </Tooltip>
      ),
      ellipsis: true
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      width: 180,
      render: (date: Date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a: IQuantityRequest, b: IQuantityRequest) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix()
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'media',
      key: 'media',
      width: 200,
      align: 'center',
      render: (media) => (
        <Image
          preview={{ src: media }}
          style={{ objectFit: 'cover', borderRadius: '8px' }}
          width={'60px'}
          height={'60px'}
          src={media}
        />
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      align: 'center',
      key: 'status',
      fixed: 'right',
      width: 200,
      render: (status: QuantityRequestStatus) => (
        <Tag color={statusColors[status]} icon={statusIcons[status]}>
          {statusLabels[status]}
        </Tag>
      )
    }
  ]

  return (
    <Fragment>
      {/* Title Quantity User */}
      <Row style={{ padding: '20px' }} gutter={[16, 16]}>
        <Col xs={24}>{Title({ title: 'Yêu cầu tăng số lần dịch vụ của tôi', level: 2 })}</Col>
      </Row>

      <Row style={{ justifyContent: 'flex-end', padding: '0 20px' }}>
        <Space>
          <Select
            defaultValue='all'
            style={{ width: 150 }}
            onChange={(value) => setStatusFilter(value as QuantityRequestStatus | 'all')}
          >
            <Select.Option value='all'>Tất cả</Select.Option>
            <Select.Option value={QuantityRequestStatus.PENDING}>Đang chờ</Select.Option>
            <Select.Option value={QuantityRequestStatus.APPROVED}>Đã phê duyệt</Select.Option>
            <Select.Option value={QuantityRequestStatus.REJECTED}>Từ chối</Select.Option>
          </Select>
        </Space>
      </Row>

      <Row gutter={16} style={{ padding: '20px' }}>
        <Col span={24}>
          <Table
            scroll={{ x: '1200px' }}
            loading={isLoading}
            sticky
            style={{ width: '100%' }}
            bordered
            dataSource={requestsData}
            columns={columns}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              position: ['bottomCenter']
            }}
          />
        </Col>
      </Row>
    </Fragment>
  )
}

export default UserRequest
