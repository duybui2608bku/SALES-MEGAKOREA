import { Button, Col, Input, Row } from 'antd'
import { useEffect, useState } from 'react'
import { GoPlus } from 'react-icons/go'
import { Fragment } from 'react/jsx-runtime'
import SelectSearchCustomers from 'src/Components/SelectSearchCustomers'
import Title from 'src/Components/Title'
import { Customer } from 'src/Interfaces/customers/customers.interfaces'
import CustomerSingleCard from './Components/CustomerSingleCard'
import { ServicesOfCardType } from 'src/Interfaces/services/services.interfaces'
import { useQuery } from '@tanstack/react-query'
import { servicesApi } from 'src/Service/services/services.api'
import ServiceCardList from './Components/ServiceCardList'

const { Search } = Input

const LIMIT = 8
const PAGE = 1
const STALETIME = 5 * 60 * 1000

const SoldServicesCardService = () => {
  const [customer, setCustomer] = useState<Customer>()

  const [listServicesCard, setListServicesCard] = useState<ServicesOfCardType[]>([])

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

  return (
    <Fragment>
      <Row
        gutter={[16, 16]}
        style={{
          padding: 20
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
          <Row>
            <Col span={24} style={{ marginTop: 30 }}>
              {customer && <CustomerSingleCard data={customer} />}
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Title title='Chọn gói combo liệu trình' level={4} justify='left' />
            </Col>
            <Col span={24}>
              <Search placeholder='Tìm thẻ liệu trình' loading enterButton />
            </Col>
            <Col span={24}>{listServicesCard.length > 0 ? <ServiceCardList cards={listServicesCard} /> : null}</Col>
          </Row>
        </Col>
      </Row>
    </Fragment>
  )
}

export default SoldServicesCardService
