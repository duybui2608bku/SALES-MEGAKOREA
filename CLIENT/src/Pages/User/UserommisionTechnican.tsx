import { useQuery } from '@tanstack/react-query'
import { Button, Card, Col, Row, Table, TableColumnType, Typography } from 'antd'
import { DollarOutlined, FilterOutlined, PercentageOutlined, ReloadOutlined, TeamOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import DatePickerComponent from 'src/Components/DatePicker'
import OptionsBranch from 'src/Components/OptionsBranch'
import OptionsGetUsersWithRole from 'src/Components/OptionsGetUsersWithRole'
import { RoleUser } from 'src/Constants/enum'
import commisionTechnicanApi from 'src/Service/commision/commision.technican.api'
import { CommisionTechnicanUserInterface } from 'src/Interfaces/commision/commisionTechnican.interface'
const { Text, Title } = Typography
import { FaUserDoctor } from 'react-icons/fa6'
import StatCard from 'src/Components/StatsCard'
import { handleRefresh } from 'src/Utils/util.utils'

type ColumnsCommisionTechnicanType = CommisionTechnicanUserInterface

// Interface cho summary data
interface SummaryData {
  totalPercentCommision: number
  totalFixedCommision: number
  totalCommision: number
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
    totalPercentCommision: 0,
    totalFixedCommision: 0,
    totalCommision: 0,
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
    return value
      .toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
      .replace('₫', 'đ')
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
      dataIndex: 'totalPercentCommision',
      key: 'totalPercentCommision',
      align: 'center',
      width: 200,
      sorter: (a: CommisionTechnicanUserInterface, b: CommisionTechnicanUserInterface) =>
        a.totalPercentCommision - b.totalPercentCommision,
      sortDirections: ['descend', 'ascend'],
      render: (totalPercentCommision) => (
        <Text style={{ color: '#fa8c16' }} strong>
          {totalPercentCommision.toLocaleString('vi-VN')} VNĐ
        </Text>
      )
    },
    {
      title: 'Tổng hoa hồng cố định',
      dataIndex: 'totalFixedCommision',
      key: 'totalFixedCommision',
      align: 'center',
      width: 230,
      sorter: (a: CommisionTechnicanUserInterface, b: CommisionTechnicanUserInterface) =>
        a.totalFixedCommision - b.totalFixedCommision,
      sortDirections: ['descend', 'ascend'],
      render: (totalFixedCommision) => (
        <Text style={{ color: '#A8A8FF' }} strong>
          {totalFixedCommision.toLocaleString('vi-VN')} VNĐ
        </Text>
      )
    },
    {
      title: 'Tổng hoa hồng',
      dataIndex: 'totalCommision',
      key: 'totalCommision',
      align: 'center',
      width: 200,
      sorter: (a: CommisionTechnicanUserInterface, b: CommisionTechnicanUserInterface) =>
        a.totalCommision - b.totalCommision,
      sortDirections: ['descend', 'ascend'],
      render: (totalCommision) => (
        <Text style={{ color: '#ff4d4f' }} strong>
          {totalCommision.toLocaleString('vi-VN')} VNĐ
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
                <FaUserDoctor style={{ marginRight: '12px', color: '#1890ff' }} />
                Hoa hồng kỹ thuật viên
              </Title>
            </Col>
            <Col>
              <Button
                type='primary'
                icon={<ReloadOutlined />}
                onClick={() => handleRefresh('commisionTechnican')}
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
            <StatCard
              title='Tổng hoa hồng'
              value={formatCurrency(summary.totalCommision)}
              icon={<DollarOutlined />}
              color='#1890ff'
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title='Hoa hồng %'
              value={formatCurrency(summary.totalPercentCommision)}
              icon={<PercentageOutlined />}
              color='#faad14'
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title='Hoa hồng cố định'
              value={formatCurrency(summary.totalFixedCommision)}
              icon={<DollarOutlined />}
              color='#52c41a'
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard title='Tổng kỹ thuật viên' value={summary.totalUser} icon={<TeamOutlined />} color='#ff4d4f' />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
          <Col xs={24} sm={12} md={4} lg={4}>
            <OptionsBranch onchange={(value) => console.log(value)} />
          </Col>
          <Col xs={24} sm={12} md={4} lg={4}>
            <OptionsGetUsersWithRole role={RoleUser.TECHNICIAN} search onchange={(value) => setSearchQuery(value)} />
          </Col>
          <Col xs={24} sm={12} md={4} lg={4}>
            <DatePickerComponent isRange={false} disableDate={true} onChange={(value) => setDateQuery(value)} />
          </Col>
        </Row>

        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FilterOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              <span>Danh sách hoa hồng</span>
            </div>
          }
          style={{
            borderRadius: '12px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
          }}
          bodyStyle={{ padding: '0' }}
        >
          <Table
            loading={isLoading}
            sticky
            style={{ width: '100%', borderRadius: '12px' }}
            scroll={{ x: '1400px' }}
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
        </Card>

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
export default UserCommisionTechnican
