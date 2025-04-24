import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
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
  MinusCircleOutlined,
  PlusOutlined,
  SyncOutlined,
  TagOutlined
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

enum StatusOpenModalServicesCard {
  VIEW,
  UPDATE,
  NONE
}

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
  open: StatusOpenModalServicesCard
  close: (value: StatusOpenModalServicesCard) => void
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

  // Set list Service card sold (thẻ dịch vụ đang dùng)
  useEffect(() => {
    if (servicesCardSoldOfCustomerData) {
      setListServicesCardSold(servicesCardSoldOfCustomerData.cards)
    }
  }, [servicesCardSoldOfCustomerData])

  // Func đóng Madal Update
  const handleCancelModal = () => {
    setResetServicesCardSelected((prev) => prev + 1)
    close(StatusOpenModalServicesCard.NONE)
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

  // Hàm xử lí việc UPDATE Service card sold of customer
  // "Hàm này dùng cho việc UPDATE các thẻ Service card được chọn (Selected)"
  const handleUpdateServicesCardSoldOfCustomer = () => {
    try {
      if (!servicesCardSoldOfCustomerData?._id) {
        message.error('Dữ liệu không hợp lệ: thiếu ID của thẻ dịch vụ.')
        return
      }

      const updateServicesCardSoldOfCustomerData = {
        _id: servicesCardSoldOfCustomerData._id,
        card_services_sold_id: serviceCardSelected
      }

      updateServicesCardSoldOfCustomer(updateServicesCardSoldOfCustomerData)
    } catch (error) {
      message.error('Lỗi trong quá trình thêm mới thẻ dịch vụ!')
    }
  }

  // Reset về tab mặc định mỗi khi mở tab lại (thẻ <Tab/> của AntD)
  useEffect(() => {
    if (open === StatusOpenModalServicesCard.UPDATE) {
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

    const user_id = profile._id
    const branch = getBranchList(value.branch || [])
    const serviceCard = { ...value, user_id, branch }
    const response = await createServiceCard(serviceCard)
    const newServiceCard = response.data.result[0]
    setNewServiceCardData(newServiceCard)
  }

  // Hàm xử lí việc UPDATE Service Card Sold Of Customer
  // "Hàm này dùng cho việc UPDATE MỘT thẻ được tạo riêng và UPDATE vào Service Card Sold Of Customer"
  const handleUpdateServiceCardSoldOfCutomerCreated = () => {
    try {
      if (!servicesCardSoldOfCustomerData?._id || !newServiceCardData?._id) {
        message.error('Dữ liệu không hợp lệ: thiếu ID của thẻ!')
        return
      }

      const updateServicesCardSoldOfCustomerCreatedData = {
        _id: servicesCardSoldOfCustomerData._id,
        card_services_sold_id: [newServiceCardData?._id]
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

  return (
    <Fragment>
      <Modal
        open={open === StatusOpenModalServicesCard.UPDATE}
        onCancel={handleCancelModal}
        centered
        okText={'Đóng'}
        footer={null}
        style={{ padding: 0 }}
        // Tính chiều rộng động của Modal (giới hạn tối đa là 1100p)
        // width={Math.min(listServicesCard.length * 260 + 48, 1300)}
        width={1300}
      >
        <Title className='center-div' level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
          Chỉnh sửa thẻ dịch vụ
        </Title>
        <Row style={{ margin: '20px 10px', justifyContent: 'space-between' }}>
          <Col span={9} style={{ borderRight: '1px solid lightgray' }}>
            <Tag
              icon={<SyncOutlined spin />}
              color='processing'
              style={{ marginBottom: '25px', fontSize: '16px', padding: '10px 15px' }}
            >
              Các thẻ dịch vụ đang dùng
            </Tag>
            <Col span={24} style={{ overflowY: 'scroll', overflowX: 'hidden', height: '55vh' }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 24,
                  justifyContent: listServicesCardSold.length <= 2 ? 'flex-start' : 'flex-start',
                  alignItems: 'stretch'
                }}
              >
                {listServicesCardSold.map((card) => (
                  <Card
                    key={card._id}
                    hoverable
                    style={{
                      width: '210px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid lightgray',
                      background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)'
                    }}
                  >
                    <div style={{ flexGrow: 1 }}>
                      <Space direction='vertical' size='middle' style={{ width: '100%' }}>
                        <Title level={5} style={{ margin: 0, color: '#2d3436', fontWeight: 600, lineHeight: '1.4' }}>
                          {card.name}
                        </Title>

                        <Divider style={{ margin: '0px 0', borderColor: '#e8ecef' }} />

                        <Space align='center'>
                          <DollarOutlined style={{ color: '#fa8c16', fontSize: '17px' }} />
                          <Text strong style={{ fontSize: '13px', color: '#2d3436' }}>
                            {card.services_of_card.reduce((total, s) => total + s.lineTotal, 0).toLocaleString('vi-VN')}{' '}
                            VNĐ
                          </Text>
                        </Space>

                        <Space direction='vertical' size={8}>
                          <Text strong style={{ fontSize: '11px', color: '#2d3436' }}>
                            Dịch vụ:
                          </Text>
                          {card.services_of_card.map((service, index) => (
                            <Space key={index} align='center' style={{ width: '100%' }}>
                              <Tag
                                color='cyan'
                                icon={<TagOutlined />}
                                style={{
                                  fontSize: '9px',
                                  padding: '4px 10px',
                                  borderRadius: '10px',
                                  background: '#e6f7ff',
                                  border: 'none'
                                }}
                              >
                                {service.name}
                              </Tag>
                              <Text type='secondary' style={{ fontSize: '9px' }}>
                                x{service.quantity}
                              </Text>
                            </Space>
                          ))}
                        </Space>

                        <Divider style={{ margin: '0px 0', borderColor: '#e8ecef' }} />
                        <Text type='secondary' style={{ fontSize: '9px' }}>
                          Ngày tạo: {dayjs(card.create_at).format('DD/MM/YYYY HH:mm')}
                        </Text>
                      </Space>
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
              style={{ width: '100%' }}
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
                      <Col span={24} style={{ overflowY: 'scroll', overflowX: 'hidden', height: '50vh' }}>
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
                            customCss={true}
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
                            okButtonProps={{ loading: isUpdatingServicesCard }}
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
                        style={{ marginTop: 20, overflowY: 'scroll', overflowX: 'hidden', height: '50vh' }}
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
                            <Col>
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
                            okButtonProps={{ loading: isCreatingServiceCard }}
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
