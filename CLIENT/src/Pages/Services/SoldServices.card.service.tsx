import { useQuery } from '@tanstack/react-query'
import {
  Badge,
  Button,
  Checkbox,
  Col,
  Flex,
  message,
  Popover,
  Row,
  Select,
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
import Title from 'src/Components/Title'
import { GetServicesCardSoldOfCustomer, HistoryUsed } from 'src/Interfaces/services/services.interfaces'
import { servicesApi } from 'src/Service/services/services.api'
import { useNavigate } from 'react-router'
import { pathRoutersService } from 'src/Constants/path'
import ModalViewServicesCardSold from 'src/Modal/services/ModalViewServicesCardSold'
import ModalUpdateServicesCardSold from 'src/Modal/services/ModalUpdateServicesCardSold'
import { GiReceiveMoney, GiTakeMyMoney } from 'react-icons/gi'
import ModalUpdatePaidOfServicesCard from 'src/Modal/services/ModalUpdatePaidOfServicesCard'
import { TbCreditCardRefund, TbMoneybag } from 'react-icons/tb'
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
import StatisticCard from 'src/Components/StatisticCard'

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

const STORAGE_KEY = 'soldServices_table_columns'
// Hàm đọc trạng thái cột từ localStorage
const getStoredColumns = () => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY)
    return storedData ? JSON.parse(storedData) : null
  } catch (error) {
    console.error('Lỗi khi đọc từ localStorage: ', error)
    return null
  }
}

// Hàm lưu trạng thái cột vào localStorage
const saveColumnsToStorage = (columns: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns))
  } catch (error) {
    console.error('Lỗi khi lưu vào localStorage: ', error)
  }
}

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

  // Handle check options for hidden columns
  const defaultColumns = columns.map((item) => item.key).filter(Boolean)
  const storedColumns = getStoredColumns()
  const validStoredColumns = storedColumns
    ? storedColumns.filter((col: any) => defaultColumns.includes(col))
    : defaultColumns
  const [checkedList, setCheckedList] = useState(validStoredColumns)
  const options = columns
    .filter((column) => column.key && column.title)
    .map(({ key, title }) => ({
      label: title,
      value: key
    }))

  const handleColumnsChange = (value: string[]) => {
    setCheckedList(value)
    saveColumnsToStorage(value)
  }

  const handleSelectAll = (e: any) => {
    const allValues = options.map((opt) => opt.value as string)
    const newValues = e.target.checked ? allValues : []
    setCheckedList(newValues)
    saveColumnsToStorage(newValues)
  }

  const newColumns = columns.map((item) => ({
    ...item,
    hidden: !checkedList.includes(item.key as string)
  }))

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

  const customRender = (props: any) => {
    const { label, closable, onClose } = props

    // Hiển thị bình thường cho các trường hợp khác
    return (
      <Tag color='blue' closable={closable} onClose={onClose} style={{ marginRight: 5 }}>
        {label} cột đã được chọn
      </Tag>
    )
  }

  return (
    <Fragment>
      {/* Title Service Card */}
      <Row style={{ padding: '20px' }} gutter={[16, 16]}>
        <Col xs={24}>{Title({ title: 'Thẻ dịch vụ đã bán', level: 2 })}</Col>
        <Col md={1} lg={1}>
          <Button onClick={handleReloadPage} icon={<ReloadOutlined />} />
        </Col>
        <Col xs={24} sm={12} md={5} lg={5}>
          <Button
            onClick={() => navigate(pathRoutersService.sellCardService)}
            block
            icon={<PlusOutlined />}
            type='primary'
          >
            Bán thẻ
          </Button>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <DebouncedSearch placeholder='Tìm kiếm thẻ dịch vụ' onSearch={(value) => handleSearch(value)} />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <DatePickerComponent isRange disableDate={true} onChange={(value) => setDatePickerQuery(value)} />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <OptionsBranch onchange={(value) => setBranchQuery(value)} mode='multiple' />
        </Col>

        {/* Thống kê Cards */}
        <Col style={{ marginTop: '8px' }} xs={24}>
          <Row gutter={16}>
            {/* Card 1: Tổng thẻ */}
            <StatisticCard
              color={0}
              loading={isLoading}
              title='Tổng thẻ'
              value={statistical.total}
              icon={<BsCardText />}
              colSpan={6}
            />

            {/* Card 2: Tổng khách hàng*/}
            <StatisticCard
              color={1}
              loading={isLoading}
              title='Tổng khách hàng'
              value={statistical.customersCount}
              icon={<TeamOutlined />}
              colSpan={6}
            />

            {/* Card 3: Doanh thu */}
            <StatisticCard
              color={2}
              loading={isLoading}
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
              colSpan={6}
            />

            {/* Card 4: Công nợ*/}
            <StatisticCard
              color={3}
              loading={isLoading}
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
              colSpan={6}
            />
          </Row>
        </Col>
      </Row>

      <Row style={{ padding: '0 20px', width: '100%', justifyContent: 'flex-end' }}>
        <Col xs={12}>
          <Space
            direction='vertical'
            style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}
          >
            <Text strong style={{ marginRight: '5px' }}>
              Chọn các cột hiển thị:{' '}
            </Text>
            <Tooltip title='Chọn tất cả'>
              <Checkbox
                checked={checkedList.length === options.length}
                indeterminate={checkedList.length > 0 && checkedList.length < options.length}
                onChange={handleSelectAll}
              />
            </Tooltip>

            <Select
              mode='multiple'
              style={{ width: '230px' }}
              placeholder={checkedList.length > 0 ? `Đã chọn ${checkedList.length} mục` : 'Chọn các cột hiển thị'}
              value={checkedList}
              onChange={handleColumnsChange}
              options={options}
              allowClear
              maxTagCount={0}
              dropdownRender={(menu) => (
                <div>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #e8e8e8' }}>
                    <Text>
                      Cột hiển thị: {checkedList.length}/{options.length}
                    </Text>
                  </div>
                  {menu}
                </div>
              )}
              tagRender={customRender}
            />
          </Space>
        </Col>
      </Row>

      {/* Talbe Service Card */}
      <Row gutter={16} style={{ padding: '10px 20px' }}>
        <Col span={24}>
          <Table
            sticky
            style={{ width: '100%' }}
            scroll={{ x: '2000px' }}
            loading={isLoading}
            dataSource={servicesCardSoldOfCustomer}
            bordered
            columns={newColumns}
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
