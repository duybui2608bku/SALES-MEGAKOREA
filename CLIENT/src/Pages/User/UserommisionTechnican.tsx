import { useQuery } from '@tanstack/react-query'
import { Col, Row, Table, TableColumnType, Typography } from 'antd'
import { DollarOutlined, PercentageOutlined, TeamOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import DatePickerComponent from 'src/Components/DatePicker'
import OptionsBranch from 'src/Components/OptionsBranch'
import OptionsGetUsersWithRole from 'src/Components/OptionsGetUsersWithRole'
import Title from 'src/Components/Title'
import { RoleUser } from 'src/Constants/enum'
import commisionTechnicanApi from 'src/Service/commision/commision.technican.api'
import { CommisionTechnicanUserInterface } from 'src/Interfaces/commision/commisionTechnican.interface'
import StatisticCard from 'src/Components/StatisticCard'
const { Text } = Typography

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
            <StatisticCard
              color={0}
              loading={isLoading}
              title='Tổng hoa hồng'
              value={formatCurrency(summary.totalCommision)}
              icon={<DollarOutlined />}
              colSpan={6}
            />

            {/* Card 2: Hoa Hồng % */}
            <StatisticCard
              color={1}
              loading={isLoading}
              title='Hoa hồng %'
              value={formatCurrency(summary.totalPercentCommision)}
              icon={<PercentageOutlined />}
              colSpan={6}
            />

            {/* Card 3: Hoa Hồng Cố Định */}
            <StatisticCard
              color={2}
              loading={isLoading}
              title='Hoa hồng cố định'
              value={formatCurrency(summary.totalFixedCommision)}
              icon={<DollarOutlined />}
              colSpan={6}
            />

            {/* Card 4: Tổng kỹ thuật viên */}
            <StatisticCard
              color={3}
              loading={isLoading}
              title='Tổng kỹ thuật viên'
              value={summary.totalUser}
              icon={<TeamOutlined />}
              colSpan={6}
            />
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
