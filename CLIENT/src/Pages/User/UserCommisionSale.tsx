import { useQuery } from '@tanstack/react-query'
import { Button, Card, Col, message, Row, Table, TableColumnType, Typography } from 'antd'
import { DollarOutlined, FilterOutlined, PercentageOutlined, ReloadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import DatePickerComponent from 'src/Components/DatePicker'
import OptionsBranch from 'src/Components/OptionsBranch'
import OptionsGetUsersWithRole from 'src/Components/OptionsGetUsersWithRole'
import { RoleUser } from 'src/Constants/enum'
import commisionSaleApi from 'src/Service/commision/commision.sale.api'
import { CommisionSaleUserInterface } from 'src/Interfaces/commision/commisionSale.interface'
const { Text, Title } = Typography
import { FaUserTie } from 'react-icons/fa6'
import StatCard from 'src/Components/StatsCard'
import { queryClient } from 'src/main'

type ColumnsCommisionSaleType = CommisionSaleUserInterface

// Interface cho summary data
interface SummaryData {
  totalCommision: number
  totalUser: number
}

const LIMIT = 8
const PAGE = 1
const STALETIME = 5 * 60 * 1000

const UserCommisionSale = () => {
  const [pagination, setPagination] = useState({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })
  const [commisionSale, setCommisionSale] = useState<CommisionSaleUserInterface[]>([])
  const [summary, setSummary] = useState<SummaryData>({
    totalCommision: 0,
    totalUser: 0
  })
  const [dateQuery, setDateQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch data from API
  const { data: commisionSaleData, isLoading } = useQuery({
    queryKey: ['commisionSale', pagination.page, searchQuery, dateQuery],
    queryFn: async () => {
      const response = await commisionSaleApi.getAllCommisionSale({
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
    if (commisionSaleData) {
      const result = commisionSaleData?.data.result.data
      const summaryData = commisionSaleData?.data.result.summary

      setCommisionSale(result)
      setSummary(summaryData)
      setPagination({
        page: commisionSaleData.data.result.pagination.page || PAGE,
        limit: commisionSaleData.data.result.pagination.limit,
        total: commisionSaleData.data.result.pagination.total
      })
    }
  }, [commisionSaleData])

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

  const handleRefresh = () => {
    message.loading('Đang tải lại dữ liệu...')
    queryClient.invalidateQueries({ queryKey: ['commisionTechnican'] })
    setTimeout(() => {
      message.success('Dữ liệu đã được làm mới!')
    }, 3000)
  }

  const columns: TableColumnType<ColumnsCommisionSaleType>[] = [
    {
      title: 'Tên nhân viên',
      dataIndex: 'userName',
      key: 'userName',
      width: 200,
      fixed: 'left',
      render: (userName) => <span>{userName}</span>
    },
    {
      title: 'Chi nhánh',
      dataIndex: 'branchName',
      key: 'branchName',
      width: 200,
      render: (branchName) => <span>{branchName}</span>
    },
    {
      title: 'Tổng hoa hồng',
      dataIndex: 'totalCommision',
      key: 'totalCommision',
      align: 'center',
      width: 200,
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
      width: 200,
      align: 'center',
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
                <FaUserTie style={{ marginRight: '12px', color: '#1890ff' }} />
                Hoa hồng nhân viên Sale
              </Title>
            </Col>
            <Col>
              <Button
                type='primary'
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
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

        <Row gutter={[16, 16]} style={{ marginBottom: '24px', width: '100%' }}>
          <Col span={16}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={12}>
                <StatCard
                  title='Tổng hoa hồng'
                  value={formatCurrency(summary.totalCommision)}
                  icon={<DollarOutlined />}
                  color='#1890ff'
                />
              </Col>
              <Col xs={24} sm={12} lg={12}>
                <StatCard
                  title='Tổng nhân viên Sale'
                  value={summary.totalUser}
                  icon={<PercentageOutlined />}
                  color='#faad14'
                />
              </Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row style={{ height: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
              <Col span={24}>
                <OptionsBranch onchange={(value) => console.log(value)} />
              </Col>
              <Col span={24}>
                <OptionsGetUsersWithRole role={RoleUser.SALE} search onchange={(value) => setSearchQuery(value)} />
              </Col>
              <Col span={24}>
                <DatePickerComponent isRange={false} disableDate={true} onChange={(value) => setDateQuery(value)} />
              </Col>
            </Row>
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
            scroll={{ x: '1200px' }}
            columns={columns}
            dataSource={commisionSale}
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
export default UserCommisionSale
