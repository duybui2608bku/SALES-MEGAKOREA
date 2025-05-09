import { useQuery } from '@tanstack/react-query'
import {
  Badge,
  Button,
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
import { DownOutlined, PlusOutlined, ReloadOutlined, SyncOutlined, TagsOutlined } from '@ant-design/icons'
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
import { motion, AnimatePresence } from 'framer-motion'
import ModalViewServicesCardSold from 'src/Modal/services/ModalViewServicesCardSold'
import ModalUpdateServicesCardSold from 'src/Modal/services/ModalUpdateServicesCardSold'
import { GiReceiveMoney, GiTakeMyMoney, GiPayMoney } from 'react-icons/gi'
import ModalUpdatePaidOfServicesCard from 'src/Modal/services/ModalUpdatePaidOfServicesCard'
import { TbMoneybag } from 'react-icons/tb'
import ModalViewHistoryPaid from 'src/Modal/services/ModalViewHistoryPaid'
import { GetServicesCardSoldOfCustomerSearchType } from 'src/Constants/enum'
import ModalViewHistoryUsed from 'src/Modal/services/ModalViewHistoryUsed'
import { RiRefund2Fill, RiMoneyDollarCircleLine } from 'react-icons/ri'
import DatePickerComponent from 'src/Components/DatePicker'
import { queryClient } from 'src/main'
import { HiUserPlus } from 'react-icons/hi2'
import ModalCommissionDistribution from 'src/Modal/services/ModalCommissionDistribution'

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
  const [expandedServicesCard, setExpandedServicesCard] = useState<Record<string, boolean>>({})
  const [openModalServicesCardSold, setOpenModalServicesCardSold] = useState(StatusOpenModalServicesCard.NONE)
  const [openModalPayment, setOpenModalPayment] = useState(StatusOpenModalPayyment.NONE)
  const [servicesCardSoldOfCustomerData, setServicesCardSoldOfCustomerData] =
    useState<GetServicesCardSoldOfCustomer | null>(null)
  const [historyUsedData, setHistoryUsedData] = useState<HistoryUsed[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [datePickerQuery, setDatePickerQuery] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [openPopOver, setOpenPopOver] = useState(false)
  // const [openModalRefundMoney, setOpenModalRefundMoney] = useState(RefundEnum.NONE)

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

  const queryKey = ['services-card-sold-customer', pagination.page, searchQuery, datePickerQuery]
  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      const searchType = checkValueSearchQuery(searchQuery)
      const response = await servicesApi.GetServicesCardSoldOfCustomer({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        search_type: searchType,
        date: datePickerQuery
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

  const handleOpenChange = (newOpen: boolean) => {
    setOpenPopOver(newOpen)
  }

  const handleReloadPage = () => {
    queryClient.invalidateQueries({ queryKey: ['services-card-sold-customer'] })
    // window.location.reload()
  }

  // const handleRefundMoney = (refundType: RefundEnum) => {
  //   setOpenModalRefundMoney(refundType)
  // }

  const handleCommissionDistribution = (record: GetServicesCardSoldOfCustomer) => {
    handleOpenModalServicesCardSold(record, StatusOpenModalServicesCard.DISTRIBUTE_COMMISSION)
  }

  const columns: TableColumnType<ColumnsServicesCardSoldOfCustomerType>[] = [
    {
      title: 'TT',
      width: 25,
      key: 'paid',
      dataIndex: 'paid',
      align: 'center',
      fixed: 'left',
      render: (_, record) => {
        return (
          <Fragment>
            {(record.price ?? 0) - (record.price_paid ?? 0) !== 0 ? (
              <Tooltip title='Đang thanh toán'>
                <SyncOutlined spin style={{ color: '#1677ff', fontSize: '18px' }} />
              </Tooltip>
            ) : (
              <Tooltip title='Đã thanh toán hoàn tất!'>
                <FaCheckCircle color='#10B981' style={{ fontSize: '18px' }} />
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
      title: 'Hoa hồng',
      dataIndex: 'commision',
      key: 'commision',
      width: 50
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
                  {service_card.lineTotal.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
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
            <Space style={{ width: '100%', overflowX: 'hidden' }}>
              <AnimatePresence>
                <motion.div
                  key={isExpanded ? 'expanded' : 'collapsed'}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <Tree switcherIcon={<DownOutlined />} showLine treeData={visibleCards} />
                </motion.div>
              </AnimatePresence>
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

            <Popover
              trigger='click'
              onOpenChange={handleOpenChange}
              content={
                <Flex style={{ flexDirection: 'column', gap: '10px' }}>
                  <Row className='optionPayment' style={{ alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <Button
                      // onClick={() => handleRefundMoney(RefundEnum.FULL)}
                      icon={<GiTakeMyMoney style={{ color: '#FF9900' }} />}
                    />{' '}
                    Hoàn tiền 100%
                  </Row>
                  <Row className='optionPayment' style={{ alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <Button
                      // onClick={() => handleRefundMoney(RefundEnum.PARTIAL_FULL_TREATMENT)}
                      icon={<GiPayMoney style={{ color: '#FF9900' }} />}
                    />{' '}
                    Hoàn tiền theo số buổi
                  </Row>
                  <Row className='optionPayment' style={{ alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <Button
                      // onClick={() => handleRefundMoney(RefundEnum.PARTIAL_HALF_REATMENT)}
                      icon={<RiMoneyDollarCircleLine style={{ color: '#FF9900' }} />}
                    />{' '}
                    Hoàn tiền theo số tiền
                  </Row>
                </Flex>
              }
            >
              <Button title='Hoàn tiền' icon={<RiRefund2Fill color='#FF9900' />}></Button>
            </Popover>
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
          <DatePickerComponent isRange={false} disableDate={true} onChange={(value) => setDatePickerQuery(value)} />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <OptionsBranch mode='multiple' />
        </Col>
      </Row>

      {/* Talbe Service Card */}
      <Row gutter={16} style={{ padding: '20px' }}>
        <Col span={24}>
          <Table
            sticky
            style={{ width: '100%' }}
            scroll={{ x: '2000px' }}
            loading={isLoading}
            dataSource={servicesCardSoldOfCustomer}
            bordered
            columns={columns}
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
    </Fragment>
  )
}

export default SoldServicesCard
