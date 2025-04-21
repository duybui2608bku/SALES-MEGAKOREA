import { useQuery } from '@tanstack/react-query'
import { Button, Col, DatePicker, Flex, Row, Space, Table, TableColumnType, Tag, Tree, Typography } from 'antd'
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  PlusOutlined,
  PrinterOutlined,
  TagsOutlined
} from '@ant-design/icons'
import { MdDelete } from 'react-icons/md'
import { IoPencilOutline, IoPrintSharp } from 'react-icons/io5'
import { useEffect, useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import DebouncedSearch from 'src/Components/DebouncedSearch'
import OptionsBranch from 'src/Components/OptionsBranch'
import Title from 'src/Components/Title'
import { GetServicesCardSoldOfCustomer } from 'src/Interfaces/services/services.interfaces'
import { servicesApi } from 'src/Service/services/services.api'
import { useNavigate } from 'react-router'
import { pathRoutersService } from 'src/Constants/path'

const { Text, Paragraph } = Typography

const LIMIT = 8
const PAGE = 1
const STALETIME = 5 * 60 * 1000

// interface ColumnsServicesCardSoldOfCustomerType {
//   code: string
//   descriptions: string
//   price: number
//   branch: BranchType
//   history_paid: HistoryPaid[]
//   history_used: unknown[]
//   employee_commision: unknown[]
//   created_at: Date
//   customers: Customer
//   userInfo: UserGeneralInterface
//   cards: {
//     _id: string
//     price: number | null
//     name: string
//     services_of_card: {
//       _id: string
//       name: string
//       lineTotal: number
//     }
//   }[]
// }

type ColumnsServicesCardSoldOfCustomerType = GetServicesCardSoldOfCustomer

const SoldServicesCard = () => {
  const navigate = useNavigate()
  const [servicesCardSoldOfCustomer, setServicesCardSoldOfCustomer] = useState<GetServicesCardSoldOfCustomer[]>([])
  const [pagination, setPagination] = useState({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })

  const { data, isLoading } = useQuery({
    queryKey: ['services-card-sold-customer', pagination.page],
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

  const columns: TableColumnType<ColumnsServicesCardSoldOfCustomerType>[] = [
    {
      title: 'Mã thẻ / Ngày tạo',
      dataIndex: 'code/created_at',
      key: 'code/created_at',
      width: 100,
      fixed: 'left',
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
      width: 100,
      render: (_, record) => {
        return (
          <Space direction='vertical' size={2}>
            <Text strong style={{ fontSize: '15px' }}>
              {record.customers?.name} |{' '}
              <Text type='secondary' style={{ fontSize: '12px' }}>
                {record.customers?.sex}
              </Text>
            </Text>

            <Paragraph copyable style={{ fontSize: '13px', color: '#1677ff' }}>
              {record.customers?.phone}
            </Paragraph>
          </Space>
        )
      }
    },
    {
      title: 'Hoa hồng',
      dataIndex: 'commission',
      key: 'commission',
      width: 50
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'cards',
      key: 'cards',
      width: 150,
      render: (_, record) => {
        const treeData = record.cards.map((card) => ({
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

        return <Tree switcherIcon={<DownOutlined />} showLine treeData={treeData} />
      }
    },
    {
      title: 'Liệu trình',
      dataIndex: 'treatment',
      key: 'treatment',
      width: 50,
      align: 'center',
      render: () => {
        return <Text>0/5</Text>
      }
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      width: 100,
      render: (price: number) => {
        return (
          <Text style={{ color: '#ff4d4f', fontSize: '15px' }} strong>
            {price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </Text>
        )
      }
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      fixed: 'right',
      width: 75,
      align: 'center',
      render: () => {
        return (
          <Flex justify='center' gap={10}>
            {/* <Button icon={<PrinterOutlined style={{ color: '#1677ff' }} />}></Button> */}
            <Button icon={<IoPrintSharp color='#000' />}></Button>
            {/* <Button icon={<EditOutlined style={{ color: '#1677ff' }} />}></Button> */}
            <Button icon={<IoPencilOutline color='#1677ff' />}></Button>
            {/* <Button icon={<DeleteOutlined style={{ color: '#1677ff' }} />}></Button> */}
            <Button icon={<MdDelete color='red' />}></Button>
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
        <Col xs={24} sm={12} md={6} lg={6}>
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
          <DebouncedSearch placeholder='Tìm kiếm thẻ dịch vụ' onSearch={(value) => console.log(value)} />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <DatePicker style={{ width: '100%' }}></DatePicker>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <OptionsBranch />
        </Col>
      </Row>

      {/* Talbe Service Card */}
      <Row gutter={16} style={{ padding: '20px' }}>
        <Col span={24}>
          <Table
            sticky
            style={{ width: '100%' }}
            scroll={{ x: '1500px' }}
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
    </Fragment>
  )
}

export default SoldServicesCard
