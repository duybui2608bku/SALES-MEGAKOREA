import { Button, Col, Empty, Input, message, Popconfirm, Row, Skeleton, Tag, Typography } from 'antd'
import { useContext, useEffect, useState } from 'react'
import { GoPlus } from 'react-icons/go'
import { Fragment } from 'react/jsx-runtime'
import SelectSearchCustomers from 'src/Components/SelectSearchCustomers'
import Title from 'src/Components/Title'
import { Customer } from 'src/Interfaces/customers/customers.interfaces'
import CustomerSingleCard from './Components/CustomerSingleCard'
import { ServicesOfCardType } from 'src/Interfaces/services/services.interfaces'
import { useMutation, useQuery } from '@tanstack/react-query'
import { servicesApi } from 'src/Service/services/services.api'
import ServiceCardList from './Components/ServiceCardList'
import { customerApi } from 'src/Service/customers/customer.api'
import { BranchDataHardCode } from 'src/Utils/util.utils'
import { AppContext } from 'src/Context/AppContext'

const { Search } = Input

const LIMIT = 6
const PAGE = 1
const STALETIME = 5 * 60 * 1000

const SoldServicesCardService = () => {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const { profile } = useContext(AppContext)
  const [listServicesCard, setListServicesCard] = useState<ServicesOfCardType[]>([])
  const [serviceCardSelected, setServiceCardSelected] = useState<string[]>([])

  const handleChangeCustomer = (value: Customer) => {
    setCustomer(value)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['services-card'],
    queryFn: () => servicesApi.getServicesCard({ page: PAGE, limit: LIMIT }),
    staleTime: STALETIME
  })

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

  const handleSelectServiceCard = (serviceCardIds: string[]) => {
    setServiceCardSelected(serviceCardIds)
  }

  // Create database customer
  console.log('Customer: ', customer)
  const { mutateAsync: createCustomerService, isPending: isCreatingCustomer } = useMutation({
    mutationFn: customerApi.createCustomer,
    onSuccess: () => {
      message.success('Tạo khách hàng thành công!')
    },
    onError: (error: Error) => {
      message.error(`Lỗi khi tạo khách hàng: ${error.message}`)
    }
  })

  // Create Service Card Sold Of Customer
  const { mutate: createServiceCardSoldOfCustomer, isPending: isCreatingServiceCard } = useMutation({
    mutationFn: servicesApi.createServicesCardSoldOfCustomer,
    onSuccess: () => {
      message.success('Tạo Service card sold of customer thành công!')
    },
    onError: (error: Error) => {
      message.error(`Lỗi khi tạo Service card: ${error.message}`)
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

    const response = await createCustomerService(createCustomer)
    const customerId = String(response.data.result)
    console.log('customerId: ', customerId)

    const userId = String(profile._id)
    console.log('userId: ', userId)

    const createServiceCard = {
      customer_id: customerId,
      user_id: userId,
      card_services_sold_id: serviceCardSelected
    }
    createServiceCardSoldOfCustomer(createServiceCard)
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
            <Col span={12}>
              <SelectSearchCustomers
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onHandleChange={handleChangeCustomer as any}
                style={{ width: '100%' }}
                placeholder='Tìm khách hàng bằng số điện thoại'
              />
            </Col>
            <Col span={12}>
              <Button type='primary' style={{ width: '100%' }} icon={<GoPlus size={20} />} title='Tạo khách hàng mới'>
                Tạo Khách Hàng Mới
              </Button>
            </Col>
          </Row>
          <Row gutter={[32, 32]} style={{ marginTop: 30 }}>
            <Col span={8} style={{ marginTop: 30 }}>
              {customer ? (
                <CustomerSingleCard data={customer} />
              ) : (
                <Empty
                  style={{
                    margin: 'auto',
                    paddingTop: 250,
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
                  <Popconfirm
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
                  <Search placeholder='Tìm thẻ liệu trình' loading enterButton />
                </Col>
                <Col span={24}>
                  {isLoading || listServicesCard.length > 0 ? (
                    <ServiceCardList
                      columnsGird={8}
                      onServiceClick={handleSelectServiceCard}
                      cards={listServicesCard}
                    />
                  ) : (
                    <Skeleton active />
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
