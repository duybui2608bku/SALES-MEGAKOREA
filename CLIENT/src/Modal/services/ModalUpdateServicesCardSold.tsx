import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Skeleton,
  Space,
  Tabs,
  Tag,
  Tooltip,
  Typography
} from 'antd'
import { Fragment, useContext, useEffect, useState } from 'react'
import {
  CreateServicesCardRequestBody,
  GetServicesCardSoldOfCustomer,
  ServicesOfCardType
} from 'src/Interfaces/services/services.interfaces'
const { Title, Text } = Typography
import {
  CheckCircleOutlined,
  DollarOutlined,
  DownOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  SyncOutlined,
  UpOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { GoPlusCircle } from 'react-icons/go'
import { AiOutlineForm } from 'react-icons/ai'
import { useMutation, useQuery } from '@tanstack/react-query'
import { servicesApi } from 'src/Service/services/services.api'
import ServiceCardList from 'src/Pages/Services/Components/ServiceCardList'
import DebouncedSearch from 'src/Components/DebouncedSearch'
import { queryClient } from 'src/main'
import { generateCode } from 'src/Utils/util.utils'
import OptionsBranch from 'src/Components/OptionsBranch'
import OptionsServices from 'src/Components/OptionsGetServices'
import createOptimisticUpdateHandler from 'src/Function/product/createOptimisticUpdateHandler'
import HttpStatusCode from 'src/Constants/httpCode'
import { AppContext } from 'src/Context/AppContext'
import useQueryBranch from 'src/hook/query/useQueryBranch'
import PreviewServiceCardCreated from 'src/Pages/Services/Components/PreviewServiceCardCreated'

const LIMIT = 20
const MAX_PREVIEW = 6
const PAGE = 1
const STALETIME = 5 * 60 * 1000

interface CardOfServicesCardSoldOfCustomer {
  _id: string
  price: number | null
  name: string
  services_of_card: {
    _id: string
    name: string
    lineTotal: number
    quantity?: number
  }[]
  create_at?: string
}

interface ModalUpdateServicesCardSoldProps {
  open: boolean
  close: (value: boolean) => void
  servicesCardSoldOfCustomerData?: GetServicesCardSoldOfCustomer | null
  refetchData: () => void
}

const SELECT_ALL_BRANCH = 'all'

const ModalUpdateServicesCardSold = (props: ModalUpdateServicesCardSoldProps) => {
  const { open, close, servicesCardSoldOfCustomerData, refetchData } = props
  const [listServicesCardSold, setListServicesCardSold] = useState<CardOfServicesCardSoldOfCustomer[]>([])
  const [listServicesCard, setListServicesCard] = useState<ServicesOfCardType[]>([])
  const [serviceCardSelected, setServiceCardSelected] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [resetValueSearchServiceCard, setResetValueSearchServiceCard] = useState(false)
  const [resetServicesCardSelected, setResetServicesCardSelected] = useState(0)
  const [totalPriceSelectedCards, setTotalPriceSelectedCards] = useState(0)
  const [form] = Form.useForm()
  const [activeTabKey, setActiveTabKey] = useState<string>('123')
  const { profile } = useContext(AppContext)
  const { branchList } = useQueryBranch()
  const [newServiceCardData, setNewServiceCardData] = useState<ServicesOfCardType>()
  const [expandedCardIds, setExpandedCardIds] = useState(new Set<string>())

  // Set list Service card sold (thẻ dịch vụ đang dùng)
  useEffect(() => {
    if (servicesCardSoldOfCustomerData) {
      setListServicesCardSold(servicesCardSoldOfCustomerData.cards)
    }
  }, [servicesCardSoldOfCustomerData])

  // Func đóng Madal Update
  const handleCancelModal = () => {
    setResetServicesCardSelected((prev) => prev + 1)
    close(false)
  }

  // Fetch data Services card
  const { data, isLoading } = useQuery({
    queryKey: ['services-card', searchQuery],
    queryFn: () => servicesApi.getServicesCard({ page: PAGE, limit: LIMIT, name: searchQuery }),
    staleTime: STALETIME
  })
  const checkData = data?.data.success

  // Set list Service card (tất cả thẻ dịch vụ từ API - trừ những Services card đã tồn tại trong Services card sold)
  useEffect(() => {
    if (data) {
      const mainListServicesCard = data.data.result.servicesCard
      const result = mainListServicesCard.filter(
        (servicesCard) => !listServicesCardSold.some((servicesCardSold) => servicesCardSold._id === servicesCard._id)
      )
      setListServicesCard(result.slice(0, MAX_PREVIEW))
    }
  }, [data, listServicesCardSold])

  const handleSelectServiceCard = (serviceCardIds: string[], totalPrice: number) => {
    setServiceCardSelected(serviceCardIds)
    setTotalPriceSelectedCards(totalPrice)
  }

  // Lấy giá trị từ DebounceSearch
  const handleSearch = (value: string) => {
    setSearchQuery(value)
  }

  const handleSoldServicesCard = () => {
    if (listServicesCard.length < 0) {
      message.error('Vui lòng chọn thẻ dịch vụ!')
      return
    }
  }

  // Update Service Card Sold Of Customers
  const { mutate: updateServicesCardSoldOfCustomer, isPending: isUpdatingServicesCard } = useMutation({
    mutationFn: servicesApi.updateServicesCardSoldOfCustomer,
    onSuccess: () => {
      message.success('Thêm mới thẻ dịch vụ thành công!')
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'services-card-sold-customer'
      })
      handleCancelModal()
      refetchData()
    },
    onError: (error: Error) => {
      message.error(`Lỗi khi thêm mới thẻ dịch vụ: ${error.message}`)
    }
  })

  // Create Sold Service Card
  const { mutateAsync: createSoldServicesCard, isPending: isCreatingSoldServicesCard } = useMutation({
    mutationFn: servicesApi.createSoldServicesCard,
    onSuccess: () => {
      message.success('Tạo thẻ dịch vụ đã bán thành công!')
    },
    onError: (error: Error) => {
      message.error(`Lỗi khi tạo thẻ dịch vụ đã bán: ${error.message}`)
    }
  })

  // Hàm xử lí việc UPDATE Service card sold of customer
  // "Hàm này dùng cho việc UPDATE các thẻ Service card được chọn (Selected)"
  const handleUpdateServicesCardSoldOfCustomer = async () => {
    try {
      if (!servicesCardSoldOfCustomerData?._id) {
        message.error('Dữ liệu không hợp lệ: thiếu ID của thẻ dịch vụ.')
        return
      }

      const responseSoldServicesCard = await createSoldServicesCard({ services_card_id: serviceCardSelected })
      const cardServicesSoldId = responseSoldServicesCard.data.result

      const updateServicesCardSoldOfCustomerData = {
        _id: servicesCardSoldOfCustomerData._id,
        card_services_sold_id: cardServicesSoldId
      }

      updateServicesCardSoldOfCustomer(updateServicesCardSoldOfCustomerData)
    } catch (error) {
      message.error('Lỗi trong quá trình thêm mới thẻ dịch vụ!')
    }
  }

  // Reset về tab mặc định mỗi khi mở tab lại (thẻ <Tab/> của AntD)
  useEffect(() => {
    if (open) {
      setActiveTabKey('123')
    }
  }, [open])

  // Hàm lấy về danh sách các Chi nhánh
  const getBranchList = (branch: string[]): string[] => {
    if (branch.includes(SELECT_ALL_BRANCH)) {
      return branchList.map((branch) => branch._id)
    }
    return branch
  }

  // Create Service Card
  const { mutateAsync: createServiceCard, isPending: isCreatingServiceCard } = useMutation({
    mutationFn: servicesApi.createServicesCard,
    onMutate: async () => {
      return createOptimisticUpdateHandler(queryClient, ['getAllServicesCard'])()
    },
    onSuccess: () => {
      message.success('Tạo thẻ dịch vụ thành công!')
      queryClient.invalidateQueries({ queryKey: ['getAllServicesCard'] })
      form.resetFields()
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(['getAllServicesCard'], context?.previousData)
      const errorMsg = error.message.includes(String(HttpStatusCode.BadRequest))
        ? 'Dữ liệu không hợp lệ!'
        : `Lỗi khi tạo thẻ dịch vụ: ${error.message}`
      message.error(errorMsg)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['getAllServicesCard'] })
    },
    retry: 2
  })

  // Hàm xử lý thêm mới thẻ dịch vụ
  const handleCreateServiceCard = async (value: CreateServicesCardRequestBody) => {
    if (!profile?._id) {
      message.error('Không thể tạo thẻ dịch vụ: User ID không hợp lệ!')
      return
    }

    // Check có thẻ dịch vụ không
    if (value.services_of_card === undefined || value.services_of_card.length === 0) {
      message.error('Không thể tạo thẻ dịch vụ: Không tồn tại dịch vụ trong thẻ dịch vụ!')
      return
    }

    // Check discount vs price
    const hasInvalidDiscount = value.services_of_card.some((sof) => {
      if (sof.discount > sof.price * sof.quantity) {
        message.error('Giảm giá phải nhỏ hơn hoặc bằng giá!')
        return true
      }
      return false
    })

    // Check trùng dịch vụ
    const serviceIds = new Set()
    const hasInvalidServiceCardIds = value.services_of_card.some((sof) => {
      const currentId = sof.services_id
      if (serviceIds.has(currentId)) {
        message.error('Không được chọn các dịch vụ trùng lặp!')
        return true
      }

      serviceIds.add(currentId)
      return false
    })

    if (hasInvalidDiscount || hasInvalidServiceCardIds) {
      return
    }

    try {
      const user_id = profile._id
      const branch = getBranchList(value.branch || [])
      const serviceCard = { ...value, user_id, branch }
      const response = await createServiceCard(serviceCard)
      const newServiceCard = response.data.result[0]
      setNewServiceCardData(newServiceCard)
    } catch {
      message.error(`Lỗi khi tạo thẻ dịch vụ!`)
    }
  }

  // Hàm xử lí việc UPDATE Service Card Sold Of Customer
  // "Hàm này dùng cho việc UPDATE MỘT thẻ được tạo riêng và UPDATE vào Service Card Sold Of Customer"
  const handleUpdateServiceCardSoldOfCutomerCreated = async () => {
    try {
      if (!servicesCardSoldOfCustomerData?._id || !newServiceCardData?._id) {
        message.error('Dữ liệu không hợp lệ: thiếu ID của thẻ!')
        return
      }

      const responseSoldServicesCard = await createSoldServicesCard({ services_card_id: [newServiceCardData._id] })
      const cardServicesSoldId = responseSoldServicesCard.data.result

      const updateServicesCardSoldOfCustomerCreatedData = {
        _id: servicesCardSoldOfCustomerData._id,
        card_services_sold_id: cardServicesSoldId
      }
      updateServicesCardSoldOfCustomer(updateServicesCardSoldOfCustomerCreatedData)
    } catch (error) {
      message.error('Lỗi trong quá trình thêm mới thẻ dịch vụ!')
    }
  }

  // Hàm xoá Service card vừa mới tạo
  const handleDeleteServiceCardCreated = () => {
    setNewServiceCardData(undefined)
  }

  // onFinish Form
  const onFinish = (value: CreateServicesCardRequestBody & { _id?: string }) => {
    try {
      const branch = getBranchList(value.branch || [])
      const serviceData = { ...value, branch }
      handleCreateServiceCard(serviceData)
    } catch (error) {
      message.error('Đã xảy ra lỗi không xác định!')
    }
  }

  // Xử lý Mở rộng/Thu gọn của service_of_card nếu số lượng service_of_card lớn hơn 2
  const toggleServicesList = (cardId: string) => {
    const newExpandedIds = new Set(expandedCardIds)
    if (newExpandedIds.has(cardId)) {
      newExpandedIds.delete(cardId)
    } else {
      newExpandedIds.add(cardId)
    }
    setExpandedCardIds(newExpandedIds)
  }

  return (
    <Fragment>
      <Modal
        open={open}
        onCancel={handleCancelModal}
        centered
        okText={'Đóng'}
        footer={null}
        style={{ padding: 0 }}
        width={1300}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
            Chỉnh sửa thẻ dịch vụ
          </Title>
          {servicesCardSoldOfCustomerData?.customers.name && (
            <Text type='secondary' style={{ fontSize: '15px', color: '#1890ff' }}>
              Khách hàng: {servicesCardSoldOfCustomerData.customers.name}
            </Text>
          )}
        </div>
        <Row style={{ margin: '20px 10px', justifyContent: 'space-between' }}>
          <Col span={9} style={{ borderRight: '1px solid lightgray' }}>
            <Tag
              icon={<SyncOutlined spin />}
              color='processing'
              style={{ marginBottom: '25px', fontSize: '16px', padding: '10px 15px' }}
            >
              Các thẻ dịch vụ đang dùng
            </Tag>
            <Col span={24} style={{ overflowY: 'scroll', overflowX: 'hidden', height: '62vh', paddingRight: '15px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  columnGap: 16,
                  rowGap: 20
                }}
              >
                {listServicesCardSold.map((card) => (
                  <Card
                    key={card._id}
                    hoverable
                    className='pulse-border-card'
                    style={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: 'rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease-in-out, border .2s ease-in-out',
                      backgroundColor: 'rgb(247, 250, 252)',
                      padding: '8px 5px',
                      border: 'none'
                    }}
                    bodyStyle={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}
                  >
                    <div style={{ flexGrow: 1 }}>
                      <Flex
                        justify='space-between'
                        align='center'
                        style={{ marginBottom: '12px', flexDirection: 'row' }}
                      >
                        <Title
                          level={4}
                          style={{
                            margin: 0,
                            color: '#262626',
                            fontWeight: 600,
                            maxWidth: '80%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '17px'
                          }}
                        >
                          <Tooltip title={card.name}>{card.name}</Tooltip>
                        </Title>
                        <Tag
                          color='#1890ff'
                          style={{
                            fontSize: '12px',
                            padding: '2px 8px',
                            borderRadius: '16px',
                            marginRight: 0
                          }}
                        >
                          <DollarOutlined style={{ marginRight: '4px' }} />
                          {card.services_of_card.reduce((total, s) => total + s.lineTotal, 0).toLocaleString('vi-VN')}
                        </Tag>
                      </Flex>

                      <Divider style={{ margin: '12px 0', borderColor: '#f0f0f0' }} />

                      <div className='services-list' style={{ marginBottom: '16px' }}>
                        <Flex justify='space-between' align='center' style={{ marginBottom: '12px' }}>
                          <Text strong style={{ fontSize: '14px', color: '#262626' }}>
                            Dịch vụ ({card.services_of_card.length}):
                          </Text>
                          {card.services_of_card.length > 1 && (
                            <Tag
                              color='geekblue'
                              style={{
                                cursor: 'pointer',
                                fontSize: '11px',
                                padding: '1px 15px',
                                borderRadius: '12px',
                                margin: 0
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleServicesList(card._id)
                              }}
                            >
                              {expandedCardIds.has(card._id) ? (
                                <Tooltip title='Thu gọn'>
                                  <UpOutlined style={{ fontSize: '9px' }} />
                                </Tooltip>
                              ) : (
                                <Tooltip title={`Xem thêm (${card.services_of_card.length - 1})`}>
                                  <DownOutlined style={{ fontSize: '9px' }} />
                                </Tooltip>
                              )}
                            </Tag>
                          )}
                        </Flex>

                        <div style={{ width: '100%' }}>
                          {/* Dịch vụ đầu tiên luôn hiển thị */}
                          {card.services_of_card.slice(0, 1).map((service, index) => {
                            const usedCount = 0 // Giả định trường used (nếu không có, gán 0)
                            const quantity = service.quantity || 1
                            const isExhausted = usedCount >= quantity

                            return (
                              <div
                                key={`first-${index}`}
                                style={{
                                  background: '#ffffff',
                                  boxShadow:
                                    'rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px',
                                  borderRadius: '8px',
                                  padding: '10px',
                                  transition: 'all 0.3s ease',
                                  marginBottom: card.services_of_card.length > 1 ? '12px' : '0'
                                }}
                              >
                                <Flex justify='space-between' align='center' style={{ marginBottom: '8px' }}>
                                  <Tooltip title={service.name}>
                                    <Text
                                      style={{
                                        fontWeight: 500,
                                        fontSize: '12px',
                                        color: '#262626',
                                        maxWidth: '200px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {service.name}
                                    </Text>
                                  </Tooltip>
                                  <Text
                                    style={{
                                      fontSize: '12px',
                                      fontWeight: 500,
                                      color: isExhausted ? '#ff4d4f' : '#1890ff'
                                    }}
                                  >
                                    x{quantity}
                                  </Text>
                                </Flex>

                                <Flex justify='space-between' align='center'>
                                  <Text type='secondary' style={{ fontSize: '12px', color: '#1890ff' }}>
                                    {new Intl.NumberFormat('vi-VN', {
                                      style: 'currency',
                                      currency: 'VND'
                                    }).format(service.lineTotal || 0)}
                                  </Text>
                                </Flex>
                              </div>
                            )
                          })}

                          {/* Container cho các dịch vụ còn lại với hiệu ứng */}
                          {card.services_of_card.length > 1 && (
                            <div
                              style={{
                                maxHeight: expandedCardIds.has(card._id)
                                  ? `${(card.services_of_card.length - 1) * 100}px`
                                  : '0px',
                                opacity: expandedCardIds.has(card._id) ? 1 : 0,
                                transition: 'max-height 0.5s ease, opacity 0.4s ease'
                              }}
                            >
                              <Space direction='vertical' size={12} style={{ width: '100%', display: 'flex' }}>
                                {card.services_of_card.slice(1).map((service, index) => {
                                  const usedCount = 0 // Giả định trường used (nếu không có, gán 0)
                                  const quantity = service.quantity || 1
                                  const isExhausted = usedCount >= quantity

                                  return (
                                    <div
                                      key={`extra-${index}`}
                                      style={{
                                        background: '#ffffff',
                                        boxShadow:
                                          'rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px',
                                        borderRadius: '8px',
                                        padding: '10px',
                                        transition: 'all 0.3s ease'
                                      }}
                                    >
                                      <Flex justify='space-between' align='center' style={{ marginBottom: '8px' }}>
                                        <Tooltip title={service.name}>
                                          <Text
                                            style={{
                                              fontWeight: 500,
                                              fontSize: '12px',
                                              color: '#262626',
                                              maxWidth: '200px',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap'
                                            }}
                                          >
                                            {service.name}
                                          </Text>
                                        </Tooltip>
                                        <Text
                                          style={{
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            color: isExhausted ? '#ff4d4f' : '#1890ff'
                                          }}
                                        >
                                          x{quantity}
                                        </Text>
                                      </Flex>

                                      <Flex justify='space-between' align='center'>
                                        <Text type='secondary' style={{ fontSize: '12px', color: '#1890ff' }}>
                                          {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                          }).format(service.lineTotal || 0)}
                                        </Text>
                                      </Flex>
                                    </div>
                                  )
                                })}
                              </Space>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '5px' }}>
                      <Divider style={{ margin: '8px 0 12px', borderColor: '#f0f0f0' }} />

                      <Flex justify='space-between' align='center'>
                        <Text type='secondary' style={{ fontSize: '12px' }}>
                          {dayjs(card.create_at).format('DD/MM/YYYY HH:mm')}
                        </Text>
                      </Flex>
                    </div>
                  </Card>
                ))}
              </div>
            </Col>
          </Col>
          <Col span={15} style={{ paddingLeft: '20px' }}>
            <Tabs
              activeKey={activeTabKey}
              onChange={(key) => setActiveTabKey(key)}
              style={{ width: '100%', height: '70vh' }}
              animated
              type='card'
              items={[
                // Tab các thẻ có sẳn
                {
                  icon: <GoPlusCircle />,
                  label: 'Các thẻ có sẳn',
                  key: '123',
                  children: (
                    <Fragment>
                      <Col
                        span={24}
                        style={{ marginTop: 20, overflowY: 'scroll', overflowX: 'hidden', height: '55vh' }}
                      >
                        <Col
                          span={24}
                          style={{
                            marginBottom: '10px'
                          }}
                        >
                          <DebouncedSearch
                            placeholder='Tìm thẻ dịch vụ'
                            debounceTime={1000}
                            onSearch={(value) => handleSearch(value)}
                            loading={isLoading}
                            resetValue={resetValueSearchServiceCard}
                          />
                        </Col>
                        <Col span={24} style={{ padding: '8px' }}>
                          {isLoading ? (
                            <Skeleton active />
                          ) : listServicesCard.length === 0 ? (
                            <Empty
                              image='https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg'
                              styles={{ image: { width: '100%', height: '100px', margin: '50px 0' } }}
                              description={
                                <Typography.Text>
                                  Dịch vụ bạn đang tìm kiếm đã tồn tại trong{' '}
                                  <Tag color='magenta'>Các thẻ dịch vụ đang dùng</Tag>
                                </Typography.Text>
                              }
                            >
                              <Button
                                type='primary'
                                onClick={() => {
                                  handleSearch('')
                                  setResetValueSearchServiceCard(true)
                                  setTimeout(() => setResetValueSearchServiceCard(false), 200)
                                }}
                              >
                                Quay về
                              </Button>
                            </Empty>
                          ) : checkData ? (
                            <ServiceCardList
                              columnsGird={8}
                              onServiceClick={handleSelectServiceCard}
                              cards={listServicesCard}
                              resetCard={resetServicesCardSelected}
                            />
                          ) : (
                            <Empty
                              image='https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg'
                              styles={{ image: { width: '100%', height: '100px', margin: '50px 0' } }}
                              description={<Typography.Text>No Data</Typography.Text>}
                            >
                              <Button
                                type='primary'
                                onClick={() => {
                                  handleSearch('')
                                  setResetValueSearchServiceCard(true)
                                  setTimeout(() => setResetValueSearchServiceCard(false), 200)
                                }}
                              >
                                Quay về
                              </Button>
                            </Empty>
                          )}
                        </Col>
                      </Col>
                      <Row justify={'end'} style={{ marginTop: '30px' }}>
                        {serviceCardSelected.length !== 0 && (
                          <Fragment>
                            <Tag
                              icon={<CheckCircleOutlined />}
                              color='success'
                              style={{ padding: '5px 10px 5px 10px' }}
                            >
                              Tổng thẻ dịch vụ: x{serviceCardSelected.length}
                            </Tag>
                            <Tag icon={<DollarOutlined />} color='magenta' style={{ padding: '5px 10px 5px 10px' }}>
                              {totalPriceSelectedCards.toLocaleString('vi-VN')} VNĐ
                            </Tag>
                          </Fragment>
                        )}
                        <Col>
                          <Popconfirm
                            okButtonProps={{ loading: isUpdatingServicesCard || isCreatingSoldServicesCard }}
                            onConfirm={() => handleUpdateServicesCardSoldOfCustomer()}
                            title={
                              <Typography>
                                Bạn có muốn thêm thẻ dịch vụ
                                <div>
                                  mới cho
                                  <Tag bordered={false} color='error'>
                                    {servicesCardSoldOfCustomerData?.customers.name}
                                  </Tag>
                                  không?
                                </div>
                              </Typography>
                            }
                            okText='Có'
                            cancelText='Không'
                          >
                            <Button
                              onClick={handleSoldServicesCard}
                              disabled={serviceCardSelected.length < 1}
                              title='Thêm thẻ dịch vụ mới'
                              type='primary'
                              style={{ width: 'auto' }}
                            >
                              Thêm mới
                            </Button>
                          </Popconfirm>
                        </Col>
                      </Row>
                    </Fragment>
                  )
                },
                // Tab form tạo thẻ dịch vụ mới
                {
                  icon: <AiOutlineForm />,
                  label: 'Form thêm thẻ mới',
                  key: '321',
                  children: (
                    <Row>
                      <Col span={24}>
                        <Typography.Title className='center-div' level={4}>
                          Tạo thẻ dịch vụ
                        </Typography.Title>
                      </Col>
                      <Col
                        span={24}
                        style={{ marginTop: 20, overflowY: 'scroll', overflowX: 'hidden', height: '55vh' }}
                      >
                        <Form
                          onFinish={onFinish}
                          autoComplete='off'
                          layout='vertical'
                          name='create-service'
                          form={form}
                        >
                          <Row gutter={16}>
                            <Col span={8}>
                              <Form.Item<CreateServicesCardRequestBody>
                                name='code'
                                label='Mã dịch vụ'
                                initialValue={generateCode()}
                                rules={[{ type: 'string', message: 'Mã dịch vụ phải là chuỗi!' }]}
                              >
                                <Input placeholder='Nhập mã dịch vụ' />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item<CreateServicesCardRequestBody>
                                name='name'
                                label='Tên thẻ dịch vụ'
                                rules={[
                                  { required: true, message: 'Tên không được để trống' },
                                  { type: 'string', message: 'Tên dịch vụ phải là chuỗi!' }
                                ]}
                              >
                                <Input placeholder='Nhập tên dịch vụ' />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item<CreateServicesCardRequestBody>
                                name='branch'
                                label='Chi nhánh'
                                // rules={[{ required: true, message: 'Vui lòng chọn chi nhánh!' }]}
                              >
                                <OptionsBranch
                                  placeholder={'Chọn chi nhánh'}
                                  mode={'multiple'}
                                  search
                                  onchange={(value) => form.setFieldsValue({ branch: value })}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Row gutter={16}>
                            <Col span={24}>
                              <Form.Item<CreateServicesCardRequestBody>
                                name='descriptions'
                                label='Mô tả'
                                rules={[{ type: 'string', message: 'Mô tả phải là chuỗi!' }]}
                              >
                                <Input.TextArea rows={2} placeholder='Nhập mô tả dịch vụ' />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Row gutter={16}>
                            <Col span={24}>
                              <Form.List name='services_of_card'>
                                {(fields, { add, remove }) => (
                                  <Fragment>
                                    <Typography.Title level={5}>Dịch vụ</Typography.Title>
                                    {fields.map(({ key, name, ...restField }) => (
                                      <Card
                                        style={{ marginBottom: 16 }}
                                        title={`Dịch vụ ${name + 1}`}
                                        size='small'
                                        extra={<MinusCircleOutlined onClick={() => remove(name)} />}
                                        hoverable
                                        key={key}
                                      >
                                        <Row gutter={16}>
                                          <Col span={12}>
                                            <Form.Item
                                              {...restField}
                                              name={[name, 'services_id']}
                                              label='Dịch vụ'
                                              rules={[{ required: true, message: 'Vui lòng nhập dịch vụ!' }]}
                                            >
                                              <OptionsServices
                                                placeholder='Chọn dịch vụ'
                                                search
                                                onchange={(value) =>
                                                  form.setFieldsValue({
                                                    services_of_card: {
                                                      [name]: {
                                                        services_id: value.split('-')[0],
                                                        price: Number(value.split('-')[1])
                                                      }
                                                    }
                                                  })
                                                }
                                              />
                                            </Form.Item>
                                          </Col>
                                          <Col span={6}>
                                            <Form.Item
                                              {...restField}
                                              name={[name, 'quantity']}
                                              label='Số lần'
                                              rules={[
                                                { required: true, message: 'Vui lòng nhập số lần !' },
                                                { type: 'number', min: 0, message: 'Số lần phải không âm!' }
                                              ]}
                                            >
                                              <InputNumber min={0} style={{ width: '100%' }} placeholder='Số lần' />
                                            </Form.Item>
                                          </Col>
                                          <Col span={6}>
                                            <Form.Item
                                              {...restField}
                                              name={[name, 'discount']}
                                              label='Giảm giá'
                                              // rules={[
                                              //   { required: true, message: 'Vui lòng nhập giảm giá!' },
                                              //   { type: 'number', min: 0, message: 'Giảm giá phải không âm!' }
                                              // ]}
                                            >
                                              <InputNumber
                                                suffix='đ'
                                                style={{ width: '100%' }}
                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={(value) =>
                                                  value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0
                                                }
                                                placeholder='Giảm giá'
                                              />
                                            </Form.Item>
                                          </Col>
                                        </Row>
                                      </Card>
                                    ))}
                                    <Form.Item>
                                      <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm dịch vụ
                                      </Button>
                                    </Form.Item>
                                  </Fragment>
                                )}
                              </Form.List>
                            </Col>
                          </Row>
                        </Form>
                        {newServiceCardData && (
                          <Row>
                            <Col span={24}>
                              <Typography.Title level={5}>Xem trước</Typography.Title>
                            </Col>
                            <Col style={{ padding: '8px' }}>
                              <PreviewServiceCardCreated
                                serviceCardCreatedData={newServiceCardData as ServicesOfCardType}
                              />
                            </Col>
                          </Row>
                        )}
                      </Col>
                      {!newServiceCardData ? (
                        <Row justify={'end'} style={{ width: '100%' }}>
                          <Popconfirm
                            okButtonProps={{ loading: isCreatingServiceCard || isCreatingSoldServicesCard }}
                            onConfirm={() => form.submit()}
                            okText='Tạo'
                            cancelText='Huỷ'
                            title={
                              <Typography>
                                Bạn có muốn tạo thẻ dịch vụ
                                <div>
                                  mới cho
                                  <Tag bordered={false} color='error'>
                                    {servicesCardSoldOfCustomerData?.customers.name}
                                  </Tag>
                                  không?
                                </div>
                              </Typography>
                            }
                          >
                            <Button style={{ width: '100px' }} type='primary'>
                              Tạo
                            </Button>
                          </Popconfirm>
                        </Row>
                      ) : (
                        <Row justify={'end'} style={{ width: '100%', gap: '15px' }}>
                          <Popconfirm
                            //  okButtonProps={{ loading: isCreatingServiceCard }}
                            onConfirm={() => handleDeleteServiceCardCreated()}
                            okText='Xoá'
                            cancelText='Huỷ'
                            title={
                              <Typography>
                                Bạn có muốn xoá thẻ dịch vụ
                                <div>
                                  <Tag bordered={false} color='error'>
                                    {newServiceCardData?.name}
                                  </Tag>
                                  mới tạo không?
                                </div>
                              </Typography>
                            }
                          >
                            <Button style={{ width: '100px' }} type='primary'>
                              Xoá thẻ
                            </Button>
                          </Popconfirm>
                          <Popconfirm
                            okButtonProps={{ loading: isUpdatingServicesCard }}
                            onConfirm={() => handleUpdateServiceCardSoldOfCutomerCreated()}
                            okText='Tạo'
                            cancelText='Huỷ'
                            title={
                              <Typography>
                                Bạn có muốn thêm thẻ dịch vụ
                                <div>
                                  mới tạo cho
                                  <Tag bordered={false} color='error'>
                                    {servicesCardSoldOfCustomerData?.customers.name}
                                  </Tag>
                                  không?
                                </div>
                              </Typography>
                            }
                          >
                            <Button style={{ width: '100px' }} type='primary'>
                              Thêm mới
                            </Button>
                          </Popconfirm>
                        </Row>
                      )}
                    </Row>
                  )
                }
              ]}
            />
          </Col>
        </Row>
      </Modal>
    </Fragment>
  )
}

export default ModalUpdateServicesCardSold
