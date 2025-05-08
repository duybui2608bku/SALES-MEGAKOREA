import { Button, Col, Empty, message, Popconfirm, Row, Skeleton, Tag, Typography } from 'antd'
import { CheckCircleOutlined, DollarOutlined } from '@ant-design/icons'
import { useContext, useEffect, useState } from 'react'
import { GoPlus } from 'react-icons/go'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Fragment } from 'react/jsx-runtime'
import Title from 'src/Components/Title'
import { BranchType } from 'src/Interfaces/branch/branch.interface'
import { Customer } from 'src/Interfaces/customers/customers.interfaces'
import CustomerSingleCard from './Components/CustomerSingleCard'
import { ServicesOfCardType } from 'src/Interfaces/services/services.interfaces'
import ServiceCardList from './Components/ServiceCardList'
import { customerApi } from 'src/Service/customers/customer.api'
import { BranchDataHardCode } from 'src/Utils/util.utils'
import { AppContext } from 'src/Context/AppContext'
import SelectSearchCustomers from 'src/Components/SelectSearchCustomers'
import { servicesApi } from 'src/Service/services/services.api'
import DebouncedSearch from 'src/Components/DebouncedSearch'
import { queryClient } from 'src/main'

// const { Search } = Input

const LIMIT = 6
const PAGE = 1
const STALETIME = 5 * 60 * 1000

const SoldServicesCardService = () => {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const { profile } = useContext(AppContext)
  const [listServicesCard, setListServicesCard] = useState<ServicesOfCardType[]>([])
  const [serviceCardSelected, setServiceCardSelected] = useState<string[]>([])
  const [totalServiceCardSelected, setTotalServicesCardSelected] = useState<number>(0)
  const [resetServiceCard, setResetServiceCard] = useState(0)
  const [resetValueSearchCustomer, setResetValueSearchCustomer] = useState(false)
  const [resetValueSearchServiceCard, setResetValueSearchServiceCard] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleChangeCustomer = (value: Customer) => {
    setCustomer(value)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['services-card', searchQuery],
    queryFn: () => servicesApi.getServicesCard({ page: PAGE, limit: LIMIT, name: searchQuery }),
    staleTime: STALETIME
  })
  const checkData = data?.data.success

  useEffect(() => {
    if (data) {
      const result = data.data.result.servicesCard
      setListServicesCard(result)
    }
  }, [data])

  const handleSoldServicesCard = () => {
    if (listServicesCard.length < 0 || customer === null) {
      message.error('Vui lòng chọn khách hàng và thẻ dịch vụ')
      return
    }
  }

  const handleSelectServiceCard = (serviceCardIds: string[], total: number) => {
    setServiceCardSelected(serviceCardIds)
    setTotalServicesCardSelected(total)
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
  }

  // Create Customer
  const { mutateAsync: createCustomerService, isPending: isCreatingCustomer } = useMutation({
    mutationFn: customerApi.createCustomer,
    onSuccess: () => {
      // message.success('Tạo khách hàng thành công!')
    },
    onError: (error: Error) => {
      message.error(`Lỗi khi tạo khách hàng: ${error.message}`)
    }
  })

  // Create Sold Services Card
  const { mutateAsync: cretateSoldServicesCard, isPending: isCreatingSoldServiesCard } = useMutation({
    mutationFn: servicesApi.createSoldServicesCard,
    onSuccess: () => {
      message.success('Tạo thẻ dịch vụ đã bán thành công!')
    },
    onError: (error: Error) => {
      message.error(`Lỗi khi tạo thẻ dịch vụ đã bán: ${error.message}`)
    }
  })

  // Create Service Card Sold Of Customer
  const { mutate: createServiceCardSoldOfCustomer, isPending: isCreatingServiceCard } = useMutation({
    mutationFn: servicesApi.createServicesCardSoldOfCustomer,
    onSuccess: () => {
      message.success('Bán thẻ dịch vụ thành công!')
      // Reset click service card
      setResetServiceCard((prev) => prev + 1)
      // Reset value search customer
      setResetValueSearchCustomer(true)
      setTimeout(() => setResetValueSearchCustomer(false), 200)
      queryClient.invalidateQueries({ queryKey: ['services-card-sold-customer'] })
    },
    onError: (error: Error) => {
      message.error(`Lỗi khi tạo thẻ dịch vụ: ${error.message}`)
    }
  })

  const handleCreateServiceCardSoldOfCustomer = async () => {
    // Format createCustomer cho RequestBody
    const convertBranchToId = (name: string | undefined) => {
      const branch = BranchDataHardCode.find((branch) => branch.name === name)
      return branch?._id
    }

    const branchId = convertBranchToId(customer?.branch)
    const createCustomer = {
      branch: branchId,
      date: customer?.date,
      source: customer?.source,
      name: customer?.name,
      phone: customer?.phone,
      address: customer?.address,
      sex: customer?.sex
    }

    const responseCustomerService = await createCustomerService(createCustomer)
    const customerId = String(responseCustomerService.data.result)

    const responseSoldServicesCard = await cretateSoldServicesCard({ services_card_id: serviceCardSelected })
    const cardServicesSoldId = responseSoldServicesCard.data.result

    const userId = String(profile?._id)
    const userBranchId = Array.isArray(profile?.branch)
      ? profile.branch.map((b: BranchType) => b._id)
      : [profile?.branch._id]

    try {
      const createServiceCard = {
        customer_id: customerId,
        card_services_sold_id: cardServicesSoldId,
        user_id: userId,
        branch: userBranchId.filter((branchId) => branchId !== undefined) as string[]
      }

      createServiceCardSoldOfCustomer(createServiceCard)
    } catch (error) {
      message.error('Lỗi trong quá trình tạo Service card sold of customer!')
    }
  }

  return (
    <Fragment>
      <Row
        gutter={[16, 16]}
        style={{
          padding: 20,
          position: 'relative'
        }}
      >
        <Col span={24}>
          <Row>
            <Col span={24}>
              {Title({
                title: 'Thẻ dịch vụ đã bán',
                level: 2
              })}
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }} gutter={[16, 16]}>
            <Col span={24}>
              <Title title='Thông tin khách hàng' level={4} justify='left' />
            </Col>
            <Col xs={24} md={12}>
              <SelectSearchCustomers
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onHandleChange={handleChangeCustomer as any}
                resetSearchValue={resetValueSearchCustomer}
                style={{ width: '100%' }}
                placeholder='Tìm khách hàng bằng số điện thoại'
              />
            </Col>
            <Col xs={24} md={12}>
              <Button type='primary' style={{ width: '100%' }} icon={<GoPlus size={20} />} title='Tạo khách hàng mới'>
                Tạo Khách Hàng Mới
              </Button>
            </Col>
          </Row>
          <Row gutter={[32, 32]} style={{ marginTop: 30 }}>
            <Col span={8} style={{ marginTop: 30, height: '600px' }}>
              {customer ? (
                <CustomerSingleCard data={customer} />
              ) : (
                <Empty
                  style={{
                    margin: 'auto',
                    paddingTop: 200,
                    height: '100%',
                    border: '1px solid #e8ecef',
                    borderRadius: 16
                  }}
                  description='Chưa có khách hàng nào được chọn'
                />
              )}
            </Col>
            <Col span={16}>
              <Row gutter={[16, 16]} style={{ marginTop: 30 }}>
                <Col
                  span={24}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Title title='Chọn gói combo liệu trình' level={4} justify='left' />
                  {serviceCardSelected.length !== 0 && (
                    <Fragment>
                      <Tag icon={<CheckCircleOutlined />} color='success' style={{ padding: '5px 10px 5px 10px' }}>
                        Tổng thẻ dịch vụ: x{serviceCardSelected.length}
                      </Tag>
                      <Tag icon={<DollarOutlined />} color='magenta' style={{ padding: '5px 10px 5px 10px' }}>
                        {totalServiceCardSelected.toLocaleString('vi-VN')} VNĐ
                      </Tag>
                    </Fragment>
                  )}
                  <Popconfirm
                    okButtonProps={{
                      loading: isCreatingCustomer || isCreatingServiceCard || isCreatingSoldServiesCard
                    }}
                    onConfirm={() => handleCreateServiceCardSoldOfCustomer()}
                    title={
                      <Typography>
                        Bạn có muốn tạo liệu trình cho
                        <div>
                          <Tag bordered={false} color='error'>
                            {customer?.name}
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
                      type='primary'
                      style={{ width: 'auto' }}
                      title='Thêm liệu trình mới'
                      disabled={serviceCardSelected.length < 1 || customer === null}
                    >
                      Tạo
                    </Button>
                  </Popconfirm>
                </Col>
                <Col span={24}>
                  <DebouncedSearch
                    placeholder='Tìm thẻ dịch vụ'
                    debounceTime={1000}
                    onSearch={(value) => handleSearch(value)}
                    loading={isLoading}
                    resetValue={resetValueSearchServiceCard}
                  />
                </Col>
                <Col span={24}>
                  {!isLoading && checkData ? (
                    <ServiceCardList
                      columnsGird={8}
                      onServiceClick={handleSelectServiceCard}
                      cards={listServicesCard}
                      resetCard={resetServiceCard}
                    />
                  ) : !checkData && isLoading ? (
                    <Skeleton active />
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
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </Fragment>
  )
}

export default SoldServicesCardService
