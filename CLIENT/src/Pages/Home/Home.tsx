import { Button, Card, Col, Row, Typography } from 'antd'
import { Fragment } from 'react/jsx-runtime'
import { DollarOutlined, PercentageOutlined, ReloadOutlined, TeamOutlined } from '@ant-design/icons'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  AreaChart,
  Area
} from 'recharts'
import { FcMoneyTransfer } from 'react-icons/fc'
import { AiOutlineDashboard } from 'react-icons/ai'
import { dataTestOutstandingStaff, dataTestRevenue, dataTestRevenueAtMonth } from 'src/Utils/util.utils'
import StatCard from 'src/Components/StatsCard'

const { Title } = Typography

// Mã màu gradient cho biểu đồ cột
const chartColors = [
  { start: '#1890ff', end: '#69c0ff' }, // Blue
  { start: '#13c2c2', end: '#87e8de' }, // Cyan
  { start: '#52c41a', end: '#95de64' }, // Green
  { start: '#faad14', end: '#ffd666' }, // Gold
  { start: '#fa541c', end: '#ff7a45' }, // Volcano
  { start: '#722ed1', end: '#b37feb' }, // Purple
  { start: '#eb2f96', end: '#ff85c0' }, // Magenta
  { start: '#f5222d', end: '#ff7875' }, // Red
  { start: '#a0d911', end: '#d3f261' }, // Lime
  { start: '#fadb14', end: '#fffb8f' } // Yellow
]

// Mã màu cho biểu đồ tròn
const COLORS = [
  { base: '#1890ff', light: '#69c0ff' }, // Blue
  { base: '#13c2c2', light: '#87e8de' }, // Cyan
  { base: '#52c41a', light: '#95de64' }, // Green
  { base: '#faad14', light: '#ffd666' }, // Gold
  { base: '#fa541c', light: '#ff7a45' }, // Volcano
  { base: '#722ed1', light: '#b37feb' }, // Purple
  { base: '#eb2f96', light: '#ff85c0' }, // Magenta
  { base: '#f5222d', light: '#ff7875' }, // Red
  { base: '#a0d911', light: '#d3f261' }, // Lime
  { base: '#fadb14', light: '#fffb8f' } // Yellow
]

// Các biến màu sắc theo phong cách Ant Design
const cardBg = '#ffffff'
const borderColor = '#f0f0f0'
const headerColor = 'rgba(0, 0, 0, 0.85)'
const subTextColor = 'rgba(0, 0, 0, 0.45)'
const textColor = 'rgba(0, 0, 0, 0.85)'

const Home = () => {
  // Xử lý dữ liệu - gộp nhóm theo tên người dùng
  // và sắp xếp theo thứ tự giảm dần
  const processedData: Record<string, { name: string; value: number; avatar: string }> = {}

  dataTestOutstandingStaff.forEach((item) => {
    const name = item.user.name
    if (!processedData[name]) {
      processedData[name] = {
        name: name,
        value: 0,
        avatar: item.user.avatar
      }
    }
    processedData[name].value += item.count
  })

  // Chuyển đổi sang mảng và sắp xếp giảm dần theo value
  const chartData = Object.values(processedData)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  // Cập nhật màu sắc cho dữ liệu
  const enhancedData = chartData.map((staff, index) => ({
    ...staff,
    color: chartColors[index % chartColors.length].start,
    gradientColor: chartColors[index % chartColors.length].end
  }))

  const handleRefresh = () => {
    window.location.reload()
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
          bodyStyle={{ padding: '20px 24px' }}
        >
          <Row align='middle' justify='space-between'>
            <Col>
              <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                <AiOutlineDashboard style={{ marginRight: '12px', color: '#1890ff' }} />
                Trang thống kê
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

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard title='Tổng hoa hồng' value={234982} icon={<DollarOutlined />} color='#1890ff' />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard title='Hoa hồng %' value={10000} icon={<PercentageOutlined />} color='#faad14' />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard title='Hoa hồng cố định' value={238473} icon={<DollarOutlined />} color='#52c41a' />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard title='Tổng kỹ thuật viên' value={213} icon={<TeamOutlined />} color='#ff4d4f' />
          </Col>
        </Row>

        <Row
          style={{
            width: '100%',
            margin: 0,
            display: 'grid',
            gridTemplateColumns: '1.3fr 1fr',
            columnGap: '16px'
          }}
        >
          <Col span={24} className='chartHome'>
            <div
              style={{
                width: '100%',
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: '10px',
                padding: '24px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div
                style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 500, margin: 0, color: headerColor }}>
                    Nhân Viên Xuất Sắc
                  </h3>
                  <p style={{ fontSize: '14px', margin: '4px 0 0 0', color: subTextColor }}>
                    Top 10 nhân viên có số điểm cao nhất
                  </p>
                </div>
                <div style={{ color: subTextColor, fontSize: '20px' }}>🏆</div>
              </div>

              <div style={{ height: '300px' }}>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={enhancedData} layout='vertical' margin={{ top: 20, bottom: 20 }} barSize={15}>
                    <defs>
                      {enhancedData.map((entry, index) => (
                        <linearGradient
                          key={`gradient-h-${index}`}
                          id={`colorBarH${index}`}
                          x1='0'
                          y1='0'
                          x2='1'
                          y2='0'
                        >
                          <stop offset='0%' stopColor={entry.color} stopOpacity={0.85} />
                          <stop offset='100%' stopColor={entry.gradientColor} stopOpacity={0.85} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke={'#f0f0f0'} horizontal={false} />
                    <XAxis
                      width={800}
                      type='number'
                      stroke={'#f0f0f0'}
                      tick={{ fill: subTextColor }}
                      tickLine={{ stroke: '#f0f0f0' }}
                      axisLine={{ stroke: '#f0f0f0' }}
                      domain={[0, 'dataMax + 100']}
                    />
                    <YAxis
                      tickMargin={5}
                      type='category'
                      dataKey='name'
                      width={150}
                      stroke={'#f0f0f0'}
                      tick={{
                        fontSize: 11,
                        fill: subTextColor,
                        textAnchor: 'end', // Đảm bảo text được căn phải
                        width: 250
                      }}
                      tickLine={{ stroke: '#f0f0f0' }}
                      axisLine={{ stroke: '#f0f0f0' }}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(0, 0, 0, 0.06)' }}
                      contentStyle={{
                        backgroundColor: cardBg,
                        borderColor: borderColor,
                        color: textColor,
                        borderRadius: '8px',
                        boxShadow:
                          '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
                        padding: '8px 12px',
                        fontSize: '13px'
                      }}
                      formatter={(value) => [`${value} điểm`, 'Điểm số']}
                      labelFormatter={(name) => `Nhân viên: ${name}`}
                    />
                    <Bar
                      dataKey='value'
                      radius={[0, 15, 15, 0]}
                      animationBegin={0}
                      animationDuration={1000}
                      animationEasing='ease-out'
                    >
                      {enhancedData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`url(#colorBarH${index})`}
                          style={{ filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))' }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Col>
          <Col span={24} className='chartHome'>
            <div
              style={{
                height: '423px',
                overflowY: 'hidden',
                width: '100%',
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: '10px',
                padding: '24px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div
                style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 500, margin: 0, color: headerColor }}>
                    Thống Kê Doanh Thu
                  </h3>
                  <p style={{ fontSize: '14px', margin: '4px 0 0 0', color: subTextColor }}>
                    Biểu đồ doanh thu theo ngày
                  </p>
                </div>
                <div style={{ color: subTextColor, fontSize: '20px' }}>
                  <FcMoneyTransfer />
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  height: '320px'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%'
                  }}
                >
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <defs>
                        {COLORS.map((entry, index) => (
                          <linearGradient
                            key={`gradient-${index}`}
                            id={`colorDonut${index}`}
                            x1='0'
                            y1='0'
                            x2='0'
                            y2='1'
                          >
                            <stop offset='0%' stopColor={entry.base} stopOpacity={0.9} />
                            <stop offset='100%' stopColor={entry.light} stopOpacity={0.7} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={dataTestRevenue}
                        cx='50%'
                        cy='40%'
                        innerRadius={70}
                        outerRadius={110}
                        fill='#8884d8'
                        paddingAngle={2}
                        dataKey='value'
                        nameKey='name'
                      >
                        {dataTestRevenue.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`url(#colorDonut${index})`}
                            stroke={'#FFFFFF'}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E5E7EB',
                          color: '#000000',
                          borderRadius: '8px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value, name) => [`${value.toLocaleString('vi-VN')} đ`, `${name}`]}
                      />
                      <Legend
                        layout='vertical'
                        verticalAlign='middle'
                        align='right'
                        wrapperStyle={{ paddingLeft: '20px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <Row style={{ width: '100%', marginTop: '24px' }}>
          <Col span={24}>
            <div
              style={{
                width: '100%',
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: '10px',
                padding: '24px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div
                style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 500, margin: 0, color: headerColor }}>
                    Thống Kê Doanh Thu Theo Tháng
                  </h3>
                  <p style={{ fontSize: '14px', margin: '4px 0 0 0', color: subTextColor }}>Biểu đồ doanh thu</p>
                </div>
                <div style={{ color: subTextColor, fontSize: '20px' }}>
                  <FcMoneyTransfer />
                </div>
              </div>

              <div style={{ height: '300px' }}>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart
                    width={500}
                    height={400}
                    data={dataTestRevenueAtMonth}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 20,
                      bottom: 0
                    }}
                  >
                    <defs>
                      <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#722ed1' stopOpacity={0.8} />
                        <stop offset='95%' stopColor='#b37feb' stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id='colorDebt' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#13c2c2' stopOpacity={0.8} />
                        <stop offset='95%' stopColor='#87e8de' stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                    <XAxis
                      dataKey='month'
                      stroke='#f0f0f0'
                      tick={{ fill: 'rgba(0, 0, 0, 0.45)', fontSize: 12 }}
                      tickLine={{ stroke: '#f0f0f0' }}
                      axisLine={{ stroke: '#f0f0f0' }}
                    />
                    <YAxis
                      stroke='#f0f0f0'
                      tick={{ fill: 'rgba(0, 0, 0, 0.45)', fontSize: 12 }}
                      tickLine={{ stroke: '#f0f0f0' }}
                      axisLine={{ stroke: '#f0f0f0' }}
                      tickFormatter={(value) => value.toLocaleString('vi-VN')}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E5E7EB',
                        color: '#000000',
                        borderRadius: '8px',
                        boxShadow:
                          '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
                        padding: '8px 12px',
                        fontSize: '13px'
                      }}
                      formatter={(value, name) => [`${value.toLocaleString('vi-VN')} đ`, `${name}`]}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Area
                      type='monotone'
                      dataKey='revenue'
                      name='Doanh thu'
                      stroke='#722ed1'
                      strokeWidth={2}
                      fill='url(#colorRevenue)'
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#722ed1' }}
                      animationBegin={0}
                      animationDuration={1500}
                      animationEasing='ease-out'
                    />
                    <Area
                      type='monotone'
                      dataKey='debt'
                      name='Công nợ'
                      stroke='#13c2c2'
                      strokeWidth={2}
                      fill='url(#colorDebt)'
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#13c2c2' }}
                      animationBegin={300}
                      animationDuration={1500}
                      animationEasing='ease-out'
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Col>
        </Row>

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

export default Home
