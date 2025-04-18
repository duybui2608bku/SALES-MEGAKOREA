import { useQuery } from '@tanstack/react-query'
import { Button, Col, DatePicker, Flex, Row, TableColumnType, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import DebouncedSearch from 'src/Components/DebouncedSearch'
import OptionsBranch from 'src/Components/OptionsBranch'
import Title from 'src/Components/Title'
import { BranchType } from 'src/Interfaces/branch/branch.interface'
import { Customer } from 'src/Interfaces/customers/customers.interfaces'
import { GetServicesCardSoldOfCustomer, HistoryPaid } from 'src/Interfaces/services/services.interfaces'
import { UserGeneralInterface } from 'src/Interfaces/user/user.interface'
import { servicesApi } from 'src/Service/services/services.api'

const { Text } = Typography

const LIMIT = 8
const PAGE = 1
const STALETIME = 5 * 60 * 1000

interface ColumnsServicesCardSoldOfCustomerType {
  code: string
  descriptions: string
  price: number
  branch: BranchType
  history_paid: HistoryPaid[]
  history_used: unknown[]
  employee_commision: unknown[]
  created_at: Date
  customers: Customer
  userInfo: UserGeneralInterface
  cards: {
    _id: string
    price: number | null
    name: string
    services_of_card: {
      _id: string
      name: string
      lineTotal: number
    }
  }[]
}

const SoldServicesCard = () => {
  const [servicesCardSoldOfCustomer, setServicesCardSoldOfCustomer] = useState<GetServicesCardSoldOfCustomer[]>([])
  const [pagination, setPagination] = useState({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })

  const { data, isLoading } = useQuery({
    queryKey: ['services-card-sold-customer'],
    queryFn: () =>
      servicesApi.GetServicesCardSoldOfCustomer({
        page: pagination.page,
        limit: pagination.limit
      }),
    staleTime: STALETIME
  })

  useEffect(() => {
    if (data) {
      const result = data.data.result.servicesCardSold
      console.log(result)
    }
  }, [data])

  const columns: TableColumnType<ColumnsServicesCardSoldOfCustomerType>[] = [
    {
      title: 'Mã thẻ / Ngày tạo',
      dataIndex: 'code/created_at',
      key: 'code/created_at',
      render: (_, record) => {
        return (
          <Flex>
            <Text>{record.code}</Text>
            <Text>{new Date(record.created_at).toLocaleDateString()}</Text>
          </Flex>
        )
      }
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customers',
      key: 'customers',
      render: (_, record) => {
        return (
          <Flex>
            <Text>{record.customers?.name}</Text>
            <Text>{record.customers?.phone}</Text>
          </Flex>
        )
      }
    }
  ]

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
          <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
            <Col span={2}>
              <Button style={{ width: '100%' }} type='primary'>
                + Bán Thẻ
              </Button>
            </Col>
            <Col span={4}>
              <DebouncedSearch placeholder='Tìm kiếm thẻ dịch vụ' onSearch={(value) => console.log(value)} />
            </Col>
            <Col span={4}>
              <DatePicker style={{ width: '100%' }}></DatePicker>
            </Col>
            <Col span={4}>
              <OptionsBranch />
            </Col>
          </Row>
        </Col>
      </Row>
    </Fragment>
  )
}

export default SoldServicesCard
