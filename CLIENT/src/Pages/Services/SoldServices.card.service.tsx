import { useQuery } from '@tanstack/react-query'
import {
  Badge,
  Button,
  Card,
  Col,
  Flex,
  message,
  Popover,
  Row,
  Space,
  Table,
  TableColumnType,
  Tag,
  Tooltip,
  Tree,
  Typography
} from 'antd'
import {
  DollarOutlined,
  DownOutlined,
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
  SyncOutlined,
  TagsOutlined,
  TeamOutlined
} from '@ant-design/icons'
import { IoPrintSharp } from 'react-icons/io5'
import { IoIosAddCircleOutline } from 'react-icons/io'
import { FaRegEye, FaCheckCircle } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import DebouncedSearch from 'src/Components/DebouncedSearch'
import OptionsBranch from 'src/Components/OptionsBranch'
const { Title } = Typography
import { GetServicesCardSoldOfCustomer, HistoryUsed } from 'src/Interfaces/services/services.interfaces'
import { servicesApi } from 'src/Service/services/services.api'
import { useNavigate } from 'react-router'
import { pathRoutersService } from 'src/Constants/path'
import ModalViewServicesCardSold from 'src/Modal/services/ModalViewServicesCardSold'
import ModalUpdateServicesCardSold from 'src/Modal/services/ModalUpdateServicesCardSold'
import { GiReceiveMoney, GiTakeMyMoney } from 'react-icons/gi'
import ModalUpdatePaidOfServicesCard from 'src/Modal/services/ModalUpdatePaidOfServicesCard'
import { TbCreditCardRefund, TbMoneybag, TbCardsFilled } from 'react-icons/tb'
import ModalViewHistoryPaid from 'src/Modal/services/ModalViewHistoryPaid'
import { GetServicesCardSoldOfCustomerSearchType } from 'src/Constants/enum'
import ModalViewHistoryUsed from 'src/Modal/services/ModalViewHistoryUsed'
import { RiRefund2Fill } from 'react-icons/ri'
import DatePickerComponent from 'src/Components/DatePicker'
import { queryClient } from 'src/main'
import { HiUserPlus } from 'react-icons/hi2'
import ModalCommissionDistribution from 'src/Modal/services/ModalCommissionDistribution'
import ModalRefund from 'src/Modal/services/ModalRefund'
import { BsCardText } from 'react-icons/bs'
import HiddenColumns from 'src/Components/HiddenColumns'
import StatCard from 'src/Components/StatsCard'

const { Text, Paragraph } = Typography

const LIMIT = 7
const PAGE = 1
const STALETIME = 5 * 60 * 1000

enum StatusOpenModalServicesCard {
  VIEW,
  UPDATE,
  VIEW_HISTORY,
  DISTRIBUTE_COMMISSION,
  NONE
}

enum StatusOpenModalPayyment {
  NONE,
  VIEW_HISTORY,
  UPDATE
}

type ColumnsServicesCardSoldOfCustomerType = GetServicesCardSoldOfCustomer

const SoldServicesCard = () => {
  const navigate = useNavigate()
  const [servicesCardSoldOfCustomer, setServicesCardSoldOfCustomer] = useState<GetServicesCardSoldOfCustomer[]>([])
  const [pagination, setPagination] = useState({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })
  const [statistical, setStatistical] = useState({
    total: 0,
    customersCount: 0,
    revenue: 0,
    debt: 0
  })

  const columns: TableColumnType<ColumnsServicesCardSoldOfCustomerType>[] = [
    {
      title: 'TT',
      width: 25,
      key: 'status',
      dataIndex: 'status',
      align: 'center',
      fixed: 'left',
      render: (_, record) => {
        return (
          <Fragment>
            {record.refund && record.refund.type !== 0 ? (
              <Tooltip title='Đã hoàn tiền'>
                <TbCreditCardRefund cursor='pointer' style={{ color: '#FF9900', fontSize: '18px' }} />
              </Tooltip>
            ) : (record.price ?? 0) - (record.price_paid ?? 0) !== 0 ? (
              <Tooltip title='Đang thanh toán'>
                <SyncOutlined spin style={{ color: '#1677ff', fontSize: '18px', cursor: 'pointer' }} />
              </Tooltip>
            ) : (
              <Tooltip title='Đã thanh toán hoàn tất!'>
                <FaCheckCircle color='#10B981' style={{ fontSize: '18px', cursor: 'pointer' }} />
              </Tooltip>
            )}
          </Fragment>
        )
      }
    },
    {
      title: 'Mã thẻ / Ngày tạo',
      dataIndex: 'code/created_at',
      key: 'code/created_at',
      width: 80,
      render: (_, record) => {
        return (
          <Space direction='vertical' size={2}>
            <Text strong style={{ fontSize: '15px' }}>
              {record.code} |{' '}
              <Text type='secondary' style={{ fontSize: '12px' }}>
                {new Date(record.created_at).toLocaleDateString('vi-VN')}
              </Text>
            </Text>
            <Text style={{ fontWeight: 'bold', color: 'purple', fontSize: '13px' }}>{record.userInfo.name}</Text>
          </Space>
        )
      }
    },
    {
      title: 'Khách hàng / SĐT',
      dataIndex: 'customers',
      key: 'customers',
      width: 110,
      fixed: 'left',
      render: (_, record) => {
        return (
          <Space direction='vertical' size={2}>
            <Text strong style={{ fontSize: '15px' }}>
              {record.customers?.name} |{' '}
              <Text type='secondary' style={{ fontSize: '12px' }}>
                {record.customers?.sex}
              </Text>
            </Text>

            <Paragraph copyable style={{ fontSize: '13px', color: '#1677ff', margin: 0, padding: 0 }}>
              {record.customers?.phone}
            </Paragraph>
          </Space>
        )
      }
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'cards',
      key: 'cards',
      width: 180,
      render: (_, record) => {
        const isExpanded = expandedServicesCard[record._id] || false
        const treeFullData = record.cards.map((card) => ({
          title: (
            <Tag icon={<TagsOutlined />} style={{ fontSize: '13px' }} color='purple' bordered={false}>
              {card.name}
            </Tag>
          ),
          key: card._id,
          children: card.services_of_card.map((service_card) => ({
            key: `${card._id}-${service_card._id}`,
            title: (
              <Text>
                {service_card.name} |{' '}
                <Tag bordered={false} color='magenta'>
                  {service_card.lineTotal
                    ? service_card.lineTotal.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                    : ''}
                </Tag>
              </Text>
            )
          }))
        }))

        // Nếu không mở rộng -> chỉ lấy 3 thẻ đầu và 1 thẻ "Xem thêm"
        const visibleCards = isExpanded
          ? [
              ...treeFullData,
              {
                key: `${record._id}-heheeee`,
                title: (
                  <Tag
                    color='geekblue'
                    onClick={() => setExpandedServicesCard({ ...expandedServicesCard, [record._id]: false })}
                  >
                    Thu gọn
                  </Tag>
                ),
                children: []
              }
            ]
          : [
              ...treeFullData.slice(0, 3),
              ...(treeFullData.length > 3
                ? [
                    {
                      key: `${record._id}-heheeee`,
                      title: (
                        <Tag
                          color='geekblue'
                          onClick={() => setExpandedServicesCard({ ...expandedServicesCard, [record._id]: true })}
                        >
                          Xem thêm
                        </Tag>
                      ),
                      children: []
                    }
                  ]
                : [])
            ]

        return (
          <Flex align='center' justify='space-between'>
            <Space style={{ width: '100%', overflow: 'hidden' }}>
              <Tree switcherIcon={<DownOutlined />} showLine treeData={visibleCards} />
            </Space>
            <Space>
              <Tooltip title='Xem chi tiết'>
                <Button
                  onClick={() => handleOpenModalServicesCardSold(record, StatusOpenModalServicesCard.VIEW)}
                  icon={<FaRegEye style={{ color: '#6366F1' }} />}
                />
              </Tooltip>
              <Tooltip title='Thêm thẻ dịch vụ'>
                <Button
                  onClick={() => handleOpenModalServicesCardSold(record, StatusOpenModalServicesCard.UPDATE)}
                  icon={<IoIosAddCircleOutline style={{ color: '#10B981' }} />}
                />
              </Tooltip>
            </Space>
          </Flex>
        )
      }
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      width: 70,
      render: (price: number) => {
        return (
          <Text style={{ color: '#000', fontSize: '15px' }} strong>
            {price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </Text>
        )
      }
    },
    {
      title: 'Công nợ',
      dataIndex: 'price_paid',
      key: 'price_paid',
      align: 'center',
      width: 70,
      render: (_, record) => {
        return (
          <Text style={{ color: '#ff4d4f', fontSize: '15px' }} strong>
            {!record.price || !record.price_paid
              ? ''
              : (record.price - record.price_paid).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </Text>
        )
      }
    },
    {
      title: 'L.sử dùng thẻ',
      key: 'history_used',
      dataIndex: 'history_used',
      align: 'center',
      width: 60,
      render: (history_used: HistoryUsed[]) => {
        return (
          <Flex justify='center' gap='12px' align='center'>
            <Tooltip title='Xem chi tiết'>
              <Badge count={history_used.length || 0} style={{ fontSize: '11px' }} color='#A6D7C4'>
                <Button
                  onClick={() =>
                    history_used.length === 0
                      ? message.warning('Chưa có lịch sử dùng thẻ!')
                      : handleOpenModalViewHistoryUsed(history_used)
                  }
                  icon={<FaRegEye style={{ color: '#6366F1' }} />}
                />
              </Badge>
            </Tooltip>
          </Flex>
        )
      }
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paid',
      key: 'paid',
      width: 75,
      align: 'center',
      render: (_, record) => {
        return (
          <Flex justify='center' gap={15}>
            {(record.price ?? 0) - (record.price_paid ?? 0) === 0 ? (
              <Tooltip title='Đã thanh toán hoàn tất!'>
                <Button disabled icon={<FaCheckCircle color='#10B981' />} />
              </Tooltip>
            ) : (
              <Button
                onClick={() => handleOpenModalPayment(record, StatusOpenModalPayyment.UPDATE)}
                title='Thanh toán'
                icon={<GiReceiveMoney color='#10B981' />}
              ></Button>
            )}

            <Badge count={record.history_paid.length || 0} style={{ fontSize: '10px' }} color='#A6D7C4'>
              <Button
                title='Lịch sử thanh toán'
                disabled={record.history_paid.length === 0}
                onClick={() => handleOpenModalPayment(record, StatusOpenModalPayyment.VIEW_HISTORY)}
                icon={<TbMoneybag />}
              ></Button>
            </Badge>

            {record.refund && record.refund.type !== 0 ? (
              <Popover
                trigger='hover'
                content={
                  <div style={{ padding: '8px' }}>
                    <Text strong>Thông tin hoàn tiền:</Text>
                    <div style={{ marginTop: '8px' }}>
                      <Text>Số tiền: </Text>
                      <Text type='warning'>
                        {record.refund.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </Text>
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <Text>Ngày hoàn: </Text>
                      <Text>
                        {record.refund.date ? new Date(record.refund.date).toLocaleDateString('vi-VN') : 'N/A'}
                      </Text>
                    </div>
                  </div>
                }
              >
                <Button title='Đã hoàn tiền' icon={<TbCreditCardRefund style={{ color: '#FF9900' }} />} />
              </Popover>
            ) : (
              <Button
                onClick={() => record && handleRefundMoney(record)}
                title='Hoàn tiền'
                icon={<RiRefund2Fill color='#FF9900' />}
              />
            )}
          </Flex>
        )
      }
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      fixed: 'right',
      width: 60,
      align: 'center',
      render: (_, record) => {
        return (
          <Flex justify='center' gap={10}>
            <Button
              icon={<HiUserPlus color='#3B82F6' />}
              onClick={() => handleCommissionDistribution(record)}
              title='Chia doanh số'
            />
            <Button icon={<IoPrintSharp color='#4B5563' />}></Button>
          </Flex>
        )
      }
    }
  ]
  const [expandedServicesCard, setExpandedServicesCard] = useState<Record<string, boolean>>({})
  const [openModalServicesCardSold, setOpenModalServicesCardSold] = useState(StatusOpenModalServicesCard.NONE)
  const [openModalPayment, setOpenModalPayment] = useState(StatusOpenModalPayyment.NONE)
  const [servicesCardSoldOfCustomerData, setServicesCardSoldOfCustomerData] =
    useState<GetServicesCardSoldOfCustomer | null>(null)
  const [historyUsedData, setHistoryUsedData] = useState<HistoryUsed[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [datePickerQuery, setDatePickerQuery] = useState('')
  const [openModalRefund, setOpenModalRefund] = useState(false)
  const [branchQuery, setBranchQuery] = useState<string[]>([])
  const [newColumns, setNewColumns] = useState([])
  // Hàm check searchQuery là Number hay là String
  const checkValueSearchQuery = (value: string) => {
    if (!value || value.length === 0) return

    const firstChar = value.charAt(0)

    // Check kí tự đầu tiên là chữ
    if (/[a-zA-Z]/.test(firstChar)) {
      return GetServicesCardSoldOfCustomerSearchType.NAME_CUSTOMER
    }

    // Check kí tự đầu tiên là số
    if (/[0-9]/.test(firstChar)) {
      return GetServicesCardSoldOfCustomerSearchType.PHONE__CUSTOMER
    }

    return
  }

  const queryKey = ['services-card-sold-customer', pagination.page, searchQuery, datePickerQuery, branchQuery]
  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      const searchType = checkValueSearchQuery(searchQuery)
      const date =
        datePickerQuery.split(' & ')[0] === datePickerQuery.split(' & ')[1]
          ? datePickerQuery.split(' & ')[0]
          : datePickerQuery
      const response = await servicesApi.GetServicesCardSoldOfCustomer({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        search_type: searchType,
        date: date,
        branch: branchQuery
      })
      return response
    },
    staleTime: STALETIME
  })

  useEffect(() => {
    if (data) {
      const result = data.data.result.servicesCardSold
      setServicesCardSoldOfCustomer(result)
      setPagination({
        page: data.data.result.page || PAGE,
        limit: data.data.result.limit,
        total: data.data.result.total
      })
      setStatistical({
        total: data.data.result.total,
        customersCount: data.data.result.customersCount,
        revenue: data.data.result.revenue,
        debt: data.data.result.debt
      })
    }
  }, [data])

  const goToNextPage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page
    }))
  }

  const handleTableChange = async (page: number) => {
    goToNextPage(page)
  }

  const handleOpenModalServicesCardSold = (
    servicesCardSoldOfCustomerData: GetServicesCardSoldOfCustomer,
    statusOpenModalServicesCard: StatusOpenModalServicesCard
  ) => {
    setOpenModalServicesCardSold(statusOpenModalServicesCard)
    setServicesCardSoldOfCustomerData(servicesCardSoldOfCustomerData)
  }

  const handleOpenModalViewHistoryUsed = (historyUsedData: HistoryUsed[]) => {
    setHistoryUsedData(historyUsedData)
    setOpenModalServicesCardSold(StatusOpenModalServicesCard.VIEW_HISTORY)
  }

  const handleOpenModalPayment = (
    servicesCardSoldOfCustomerData: GetServicesCardSoldOfCustomer,
    statusOpenModalPayment: StatusOpenModalPayyment
  ) => {
    setOpenModalPayment(statusOpenModalPayment)
    setServicesCardSoldOfCustomerData(servicesCardSoldOfCustomerData)
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setPagination((prev) => ({ ...prev, page: PAGE, total: 1 }))
  }

  const handleReloadPage = async () => {
    await message.loading('Đang tải dữ liệu...', 3)
    message.success('Tải dữ liệu thành công !')
    queryClient.invalidateQueries({ queryKey: ['services-card-sold-customer'] })
  }

  const handleRefundMoney = (record: GetServicesCardSoldOfCustomer) => {
    setServicesCardSoldOfCustomerData(record)
    setOpenModalRefund(true)
  }

  const handleCommissionDistribution = (record: GetServicesCardSoldOfCustomer) => {
    handleOpenModalServicesCardSold(record, StatusOpenModalServicesCard.DISTRIBUTE_COMMISSION)
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
                <TbCardsFilled style={{ marginRight: '12px', color: '#1890ff' }} />
                Quản lý danh sách thẻ dịch vụ đã bán
              </Title>
            </Col>
            <Col>
              <Button
                type='primary'
                icon={<ReloadOutlined />}
                onClick={handleReloadPage}
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
            <StatCard title='Tổng số thẻ' value={statistical.total} icon={<BsCardText />} color='#1890ff' />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title='Tổng số khách hàng'
              value={statistical.customersCount}
              icon={<TeamOutlined />}
              color='#faad14'
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title='Doanh thu'
              value={statistical.revenue
                .toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })
                .replace('₫', 'đ')}
              icon={<DollarOutlined />}
              color='#52c41a'
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title='Công nợ'
              value={statistical.debt
                .toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })
                .replace('₫', 'đ')}
              icon={<GiTakeMyMoney />}
              color='#ff4d4f'
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Button
              onClick={() => navigate(pathRoutersService.sellCardService)}
              block
              icon={<PlusOutlined />}
              type='primary'
            >
              Bán thẻ
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <DebouncedSearch placeholder='Tìm kiếm thẻ dịch vụ' onSearch={(value) => handleSearch(value)} />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <DatePickerComponent isRange disableDate={true} onChange={(value) => setDatePickerQuery(value)} />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <OptionsBranch onchange={(value) => setBranchQuery(value)} mode='multiple' />
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <HiddenColumns
              STORAGE_KEY='soldServiceCard_table_columns'
              tableColumns={columns}
              style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifySelf: 'flex-end' }}
              onNewColums={(value) => setNewColumns(value)}
            />
          </Col>
        </Row>

        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FilterOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              <span>Danh sách thẻ dịch vụ đã bán</span>
            </div>
          }
          style={{
            borderRadius: '12px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
          }}
          bodyStyle={{ padding: '0' }}
        >
          <Table
            sticky
            style={{ width: '100%', borderRadius: '12px' }}
            scroll={{ x: '2000px' }}
            loading={isLoading}
            dataSource={servicesCardSoldOfCustomer}
            columns={newColumns}
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

      <ModalViewServicesCardSold
        open={openModalServicesCardSold === StatusOpenModalServicesCard.VIEW}
        close={() => setOpenModalServicesCardSold(StatusOpenModalServicesCard.NONE)}
        servicesCardSoldOfCustomerData={servicesCardSoldOfCustomerData as GetServicesCardSoldOfCustomer | null}
        queryKey={queryKey}
        refetchData={refetch}
      />
      <ModalUpdateServicesCardSold
        open={openModalServicesCardSold === StatusOpenModalServicesCard.UPDATE}
        close={() => setOpenModalServicesCardSold(StatusOpenModalServicesCard.NONE)}
        servicesCardSoldOfCustomerData={servicesCardSoldOfCustomerData as GetServicesCardSoldOfCustomer | null}
        refetchData={refetch}
      />
      <ModalViewHistoryUsed
        open={openModalServicesCardSold === StatusOpenModalServicesCard.VIEW_HISTORY}
        close={() => setOpenModalServicesCardSold(StatusOpenModalServicesCard.NONE)}
        historyUsedData={historyUsedData}
      />
      <ModalUpdatePaidOfServicesCard
        open={openModalPayment === StatusOpenModalPayyment.UPDATE}
        onClose={() => setOpenModalPayment(StatusOpenModalPayyment.NONE)}
        servicesCardSoldOfCustomerData={servicesCardSoldOfCustomerData as GetServicesCardSoldOfCustomer | null}
      />
      <ModalViewHistoryPaid
        open={openModalPayment === StatusOpenModalPayyment.VIEW_HISTORY}
        onCancel={() => setOpenModalPayment(StatusOpenModalPayyment.NONE)}
        data={servicesCardSoldOfCustomerData?.history_paid || []}
      />
      <ModalCommissionDistribution
        open={openModalServicesCardSold === StatusOpenModalServicesCard.DISTRIBUTE_COMMISSION}
        onClose={() => setOpenModalServicesCardSold(StatusOpenModalServicesCard.NONE)}
        serviceCardData={servicesCardSoldOfCustomerData}
      />
      <ModalRefund
        open={openModalRefund}
        onClose={() => setOpenModalRefund(false)}
        servicesCardData={servicesCardSoldOfCustomerData}
      />
    </Fragment>
  )
}

export default SoldServicesCard
