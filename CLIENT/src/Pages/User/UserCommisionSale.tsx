import { useQuery } from '@tanstack/react-query'
import { Col, Row, Table, TableColumnType, Typography } from 'antd'
import { DollarOutlined, TeamOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import DatePickerComponent from 'src/Components/DatePicker'
import OptionsBranch from 'src/Components/OptionsBranch'
import OptionsGetUsersWithRole from 'src/Components/OptionsGetUsersWithRole'
import Title from 'src/Components/Title'
import { RoleUser } from 'src/Constants/enum'
import commisionSaleApi from 'src/Service/commision/commision.sale.api'
import { CommisionSaleUserInterface } from 'src/Interfaces/commision/commisionSale.interface'
import StatisticCard from 'src/Components/StatisticCard'
const { Text } = Typography

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
      {/* Title Commision Technican */}
      <Row style={{ padding: '20px' }} gutter={[16, 16]}>
        <Col xs={24}>{Title({ title: 'Hoa hồng nhân viên Sale', level: 2 })}</Col>

        <Row style={{ width: '100%' }} gutter={[16, 16]}>
          {/* Thống kê Cards */}
          <Col span={16}>
            <Row gutter={16}>
              {/* Card 1: Tổng Hoa Hồng */}
              <StatisticCard
                color={0}
                loading={isLoading}
                title='Tổng hoa hồng'
                value={formatCurrency(summary.totalCommision)}
                icon={<DollarOutlined />}
                colSpan={12}
              />

              {/* Card 2: Tổng user */}
              <StatisticCard
                color={1}
                loading={isLoading}
                title='Tổng nhân viên'
                value={summary.totalUser}
                icon={<TeamOutlined />}
                colSpan={12}
              />
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
      </Row>

      {/* Table Commision Technican */}
      <Row gutter={16} style={{ padding: '20px' }}>
        <Col span={24}>
          <Table
            loading={isLoading}
            sticky
            style={{ width: '100%' }}
            scroll={{ x: '1200px' }}
            bordered
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
        </Col>
      </Row>
    </Fragment>
  )
}
export default UserCommisionSale
