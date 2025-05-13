import React, { useState, useEffect } from 'react'

import { QuantityRequestAPI } from 'src/Service/services/quantity-request.api'
import { IQuantityRequest, QuantityRequestStatus } from 'src/Interfaces/services/quantity-request.interfaces'
import { Table, Card, Tag, Button, Space, Typography, Select, Row, Col, Empty, Spin, Alert } from 'antd'
import { useNavigate } from 'react-router-dom'
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import axiosInstanceMain from 'src/Service/axious.api'

const { Title } = Typography
const { Option } = Select

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

const UserRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<IQuantityRequest[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<QuantityRequestStatus | 'all'>('all')

  const navigate = useNavigate()
  const quantityRequestAPI = new QuantityRequestAPI(axiosInstanceMain)

  useEffect(() => {
    fetchRequests()
  }, [statusFilter])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await quantityRequestAPI.getUserRequests()
      console.log(data)
      setRequests(data.result.requests)
    } catch (err) {
      console.error('Failed to fetch user requests:', err)
      setError('Không thể tải danh sách yêu cầu. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceId',
      key: 'serviceId',
      render: (serviceId: string) => <span>ID: {serviceId}</span>
    },
    {
      title: 'Số lượng hiện tại',
      dataIndex: 'currentQuantity',
      key: 'currentQuantity'
    },
    {
      title: 'Số lượng yêu cầu',
      dataIndex: 'requestedQuantity',
      key: 'requestedQuantity'
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a: IQuantityRequest, b: IQuantityRequest) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix()
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: QuantityRequestStatus) => (
        <Tag color={statusColors[status]} icon={statusIcons[status]}>
          {statusLabels[status]}
        </Tag>
      )
    },
    {
      title: 'Ghi chú Admin',
      dataIndex: 'adminNote',
      key: 'adminNote',
      render: (note: string | undefined) => note || '-',
      ellipsis: true
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} justify='space-between' align='middle'>
        <Col>
          <Title level={3}>Yêu cầu tăng số lần dịch vụ của tôi</Title>
        </Col>
        <Col>
          <Space>
            <Select
              defaultValue='all'
              style={{ width: 150 }}
              onChange={(value) => setStatusFilter(value as QuantityRequestStatus | 'all')}
            >
              <Option value='all'>Tất cả</Option>
              <Option value={QuantityRequestStatus.PENDING}>Đang chờ</Option>
              <Option value={QuantityRequestStatus.APPROVED}>Đã phê duyệt</Option>
              <Option value={QuantityRequestStatus.REJECTED}>Từ chối</Option>
            </Select>
            <Button type='primary' onClick={() => navigate('/services')}>
              Quay lại dịch vụ
            </Button>
          </Space>
        </Col>
      </Row>

      <Card style={{ marginTop: '16px' }}>
        {error && <Alert message={error} type='error' style={{ marginBottom: 16 }} />}

        <Spin spinning={loading}>
          {requests.length > 0 ? (
            <Table dataSource={requests} columns={columns} rowKey='_id' pagination={{ pageSize: 10 }} />
          ) : (
            <Empty
              description={
                <span>
                  {statusFilter === 'all'
                    ? 'Bạn chưa có yêu cầu tăng số lần dịch vụ nào'
                    : `Không có yêu cầu nào ở trạng thái ${statusLabels[statusFilter as QuantityRequestStatus]}`}
                </span>
              }
            />
          )}
        </Spin>
      </Card>
    </div>
  )
}

export default UserRequestsPage
