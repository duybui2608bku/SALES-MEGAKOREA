import { useQuery } from '@tanstack/react-query'
import { Card, Col, Row, Table, TableColumnType, Typography } from 'antd'
import { DollarOutlined, PercentageOutlined, TeamOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import DatePickerComponent from 'src/Components/DatePicker'
import OptionsBranch from 'src/Components/OptionsBranch'
import OptionsGetUsersWithRole from 'src/Components/OptionsGetUsersWithRole'
import Title from 'src/Components/Title'
import { RoleUser } from 'src/Constants/enum'
import { CommisionTechnicanUserInterface } from 'src/Interfaces/commison/commisionTechnican.interface'
import commisionTechnicanApi from 'src/Service/commision/commision.technican.api'
const { Text } = Typography

type ColumnsCommisionTechnicanType = CommisionTechnicanUserInterface

// Interface cho summary data
interface SummaryData {
  totalPercentCommission: number
  totalFixedCommission: number
  totalCommission: number
  totalUser: number
}

const LIMIT = 8
const PAGE = 1
const STALETIME = 5 * 60 * 1000

const UserCommisionTechnican = () => {
  const [pagination, setPagination] = useState({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })
  const [commisionTechnican, setCommisionTechnican] = useState<CommisionTechnicanUserInterface[]>([])
  const [summary, setSummary] = useState<SummaryData>({
    totalPercentCommission: 0,
    totalFixedCommission: 0,
    totalCommission: 0,
    totalUser: 0
  })
  const [dateQuery, setDateQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch data from API
  const { data: commisionTechnicanData, isLoading } = useQuery({
    queryKey: ['commisionTechnican', pagination.page, searchQuery, dateQuery],
    queryFn: async () => {
      const response = await commisionTechnicanApi.getAllCommisionTechnican({
        page: String(pagination.page),
        limit: String(pagination.limit),
        date: dateQuery,
        user_id: searchQuery
      })
      return response
    },
    staleTime: STALETIME
  })

  useEffect(() => {
    if (commisionTechnicanData) {
      const result = commisionTechnicanData?.data.result.data
      const summaryData = commisionTechnicanData?.data.result.summary

      setCommisionTechnican(result)
      setSummary(summaryData)
      setPagination({
        page: commisionTechnicanData.data.result.pagination.page || PAGE,
        limit: commisionTechnicanData.data.result.pagination.limit,
        total: commisionTechnicanData.data.result.pagination.total
      })
    }
  }, [commisionTechnicanData])

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value)
  }

  const goToNextPage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page
    }))
  }

  const handleTableChange = async (page: number) => {
    goToNextPage(page)
  }

  // Card styles với hiệu ứng hover
  const cardStyles = [
    {
      background: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
      color: 'white',
      borderRadius: '20px',
      boxShadow: '0 10px 20px rgba(24, 144, 255, 0.2)',
      transition: 'all 0.3s'
    },
    {
      background: 'linear-gradient(135deg, #722ed1 0%, #a855f7 100%)',
      color: 'white',
      borderRadius: '20px',
      boxShadow: '0 10px 20px rgba(114, 46, 209, 0.2)',
      transition: 'all 0.3s'
    },
    {
      background: 'linear-gradient(135deg, #52c41a 0%, #95de64 100%)',
      color: 'white',
      borderRadius: '20px',
      boxShadow: '0 10px 20px rgba(82, 196, 26, 0.2)',
      transition: 'all 0.3s'
    },
    {
      background: 'linear-gradient(135deg, #fa8c16 0%, #ffc53d 100%)',
      color: 'white',
      borderRadius: '20px',
      boxShadow: '0 10px 20px rgba(250, 140, 22, 0.2)',
      transition: 'all 0.3s'
    }
  ]

  const columns: TableColumnType<ColumnsCommisionTechnicanType>[] = [
    {
      title: 'Tên nhân viên',
      dataIndex: 'userName',
      key: 'userName',
      width: 240,
      fixed: 'left',
      render: (userName) => <span>{userName}</span>
    },
    {
      title: 'Chi nhánh',
      dataIndex: 'branchName',
      key: 'branchName',
      width: 150,
      render: (branchName) => <span>{branchName}</span>
    },
    {
      title: 'Tổng hoa hồng %',
      dataIndex: 'totalPercentCommission',
      key: 'totalPercentCommission',
      align: 'center',
      width: 200,
      sorter: (a: CommisionTechnicanUserInterface, b: CommisionTechnicanUserInterface) =>
        a.totalPercentCommission - b.totalPercentCommission,
      sortDirections: ['descend', 'ascend'],
      render: (totalPercentCommission) => (
        <Text style={{ color: '#fa8c16' }} strong>
          {totalPercentCommission.toLocaleString('vi-VN')} VNĐ
        </Text>
      )
    },
    {
      title: 'Tổng hoa hồng cố định',
      dataIndex: 'totalFixedCommission',
      key: 'totalFixedCommission',
      align: 'center',
      width: 230,
      sorter: (a: CommisionTechnicanUserInterface, b: CommisionTechnicanUserInterface) =>
        a.totalFixedCommission - b.totalFixedCommission,
      sortDirections: ['descend', 'ascend'],
      render: (totalFixedCommission) => (
        <Text style={{ color: '#A8A8FF' }} strong>
          {totalFixedCommission.toLocaleString('vi-VN')} VNĐ
        </Text>
      )
    },
    {
      title: 'Tổng hoa hồng',
      dataIndex: 'totalCommission',
      key: 'totalCommission',
      align: 'center',
      width: 200,
      sorter: (a: CommisionTechnicanUserInterface, b: CommisionTechnicanUserInterface) =>
        a.totalCommission - b.totalCommission,
      sortDirections: ['descend', 'ascend'],
      render: (totalCommission) => (
        <Text style={{ color: '#ff4d4f' }} strong>
          {totalCommission.toLocaleString('vi-VN')} VNĐ
        </Text>
      )
    },
    {
      title: 'Số lượng dịch vụ đã bán',
      dataIndex: 'count',
      key: 'count',
      width: 250,
      align: 'center',
      sorter: (a: CommisionTechnicanUserInterface, b: CommisionTechnicanUserInterface) => a.count - b.count,
      sortDirections: ['descend', 'ascend'],
      render: (count) => <span>{count}</span>
    }
  ]

  return (
    <Fragment>
      {/* Title Commision Technican */}
      <Row style={{ padding: '20px' }} gutter={[16, 16]}>
        <Col xs={24}>{Title({ title: 'Hoa hồng kỹ thuật viên', level: 2 })}</Col>

        <Col xs={24} sm={12} md={6} lg={6}>
          <OptionsBranch onchange={(value) => console.log(value)} />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <OptionsGetUsersWithRole role={RoleUser.TECHNICIAN} search onchange={(value) => setSearchQuery(value)} />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <DatePickerComponent isRange={false} disableDate={true} onChange={(value) => setDateQuery(value)} />
        </Col>

        {/* Thống kê Cards */}
        <Col style={{ marginTop: '15px' }} xs={24}>
          <Row gutter={16}>
            {/* Card 1: Tổng Hoa Hồng */}
            <Col xs={24} sm={6}>
              <Card loading={isLoading} style={cardStyles[0]} hoverable bodyStyle={{ padding: '24px' }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '15px' }}>Tổng Hoa Hồng</Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '12px 0', color: 'white' }}>
                  {formatCurrency(summary.totalCommission)}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                  }}
                >
                  <DollarOutlined style={{ fontSize: '35px', opacity: 0.8 }} />
                </div>
              </Card>
            </Col>

            {/* Card 2: Hoa Hồng % */}
            <Col xs={24} sm={6}>
              <Card loading={isLoading} style={cardStyles[1]} hoverable bodyStyle={{ padding: '24px' }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '15px' }}>Hoa Hồng %</Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '12px 0', color: 'white' }}>
                  {formatCurrency(summary.totalPercentCommission)}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                  }}
                >
                  <PercentageOutlined style={{ fontSize: '35px', opacity: 0.8 }} />
                </div>
              </Card>
            </Col>

            {/* Card 3: Hoa Hồng Cố Định */}
            <Col xs={24} sm={6}>
              <Card loading={isLoading} style={cardStyles[2]} hoverable bodyStyle={{ padding: '24px' }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '15px' }}>Hoa Hồng Cố Định</Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '12px 0', color: 'white' }}>
                  {formatCurrency(summary.totalFixedCommission)}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                  }}
                >
                  <DollarOutlined style={{ fontSize: '35px', opacity: 0.8 }} />
                </div>
              </Card>
            </Col>

            {/* Card 4: Tổng kỹ thuật viên */}
            <Col xs={24} sm={6}>
              <Card loading={isLoading} style={cardStyles[3]} hoverable bodyStyle={{ padding: '24px' }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '15px' }}>Tổng Kỹ Thuật Viên</Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '12px 0', color: 'white' }}>
                  {summary.totalUser}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                  }}
                >
                  <TeamOutlined style={{ fontSize: '35px', opacity: 0.8 }} />
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Table Commision Technican */}
      <Row gutter={16} style={{ padding: '20px' }}>
        <Col span={24}>
          <Table
            loading={isLoading}
            sticky
            style={{ width: '100%' }}
            scroll={{ x: '1400px' }}
            bordered
            columns={columns}
            dataSource={commisionTechnican}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              onChange: handleTableChange,
              position: ['bottomCenter']
            }}
          />
        </Col>
      </Row>
    </Fragment>
  )
}
export default UserCommisionTechnican
