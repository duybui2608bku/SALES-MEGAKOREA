import { useQuery } from '@tanstack/react-query'
import {
  Badge,
  Button,
  Card,
  Col,
  Flex,
  message,
  Popconfirm,
  Row,
  Space,
  Switch,
  Table,
  TableColumnType,
  Typography
} from 'antd'
import { useEffect, useState } from 'react'
import { GoPlus } from 'react-icons/go'
import { RiMoneyDollarCircleLine, RiServiceLine } from 'react-icons/ri'
import { Fragment } from 'react/jsx-runtime'
import DebouncedSearch from 'src/Components/DebouncedSearch'
import OptionsBranch from 'src/Components/OptionsBranch'
import { optionsBranch } from 'src/Constants/option'
import { BranchType } from 'src/Interfaces/branch/branch.interface'
import {
  EmployeeOfServices,
  GetServicesCardRequestBody,
  HistoryPaid,
  ServicesCategoryType,
  ServicesOfCard,
  ServicesOfCardType
} from 'src/Interfaces/services/services.interfaces'
import ModalCreateServiceCard from 'src/Modal/services/ModalCreateServicesCard'
import ModalViewServicesOfCard from 'src/Modal/services/ModalViewServicesOfCard'
import { servicesApi } from 'src/Service/services/services.api'
import { IoMdTrash } from 'react-icons/io'
import { IoPencil } from 'react-icons/io5'
import ModalViewEmployeeCommision from 'src/Modal/services/ModalViewEmployeeCommision'
import { GiPayMoney } from 'react-icons/gi'
import { TbCardsFilled, TbPigMoney } from 'react-icons/tb'
import ModalUpdatePaidOfServicesCard from 'src/Modal/services/ModalUpdatePaidOfServicesCard'
import ModalViewHistoryPaid from 'src/Modal/services/ModalViewHistoryPaid'
// import Title from 'src/Components/Title'
import HiddenColumns from 'src/Components/HiddenColumns'
const { Paragraph, Text, Title } = Typography
import { CalendarOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { queryClient } from 'src/main'

enum ModalType {
  NONE = 0,
  MODAL_CREATE_SERVICE_CARD = 1,
  MODAL_PREVIEW_SERVICE = 2,
  MODAL_VIEW_PRICE_EMPLOYEE = 3,
  MODAL_UPDATE_PAID = 4,
  MODAL_VIEW_HISTORY_PAID = 5
}

enum SearchType {
  CODE = 'code',
  NAME = 'name'
}

interface ColumnsServicesCardType {
  _id?: string
  code: string
  name: string
  price: number
  price_paid: number
  history_paid: HistoryPaid[]
  branch: BranchType[]
  descriptions: string
  is_active: boolean
  session_time: number
  employee: EmployeeOfServices[]
  services_of_card: ServicesOfCard[]
  service_group: ServicesCategoryType
  created_at: Date
  updated_at: Date
}

const LIMIT = 9
const PAGE = 1
const STALETIME = 5 * 60 * 1000

const ServicesCard = () => {
  const [modalType, setModalType] = useState<ModalType>(ModalType.NONE)
  const [searchValue, setSearchValue] = useState<string>('')
  const [servicesCard, setServicesCard] = useState<ServicesOfCardType[]>([])
  const [servicesToView, setServicesToView] = useState<ServicesOfCard[] | null>(null)
  const [servicesCardSelected, setServicesCardSelected] = useState<ServicesOfCardType>()

  const columns: TableColumnType<ColumnsServicesCardType>[] = [
    {
      title: 'Mã thẻ',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      align: 'center'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 120,
      render: (isActive: boolean, record: ColumnsServicesCardType) => {
        return (
          <Flex justify='center'>
            <Switch checked={isActive} onChange={() => console.log(record)} />
          </Flex>
        )
      }
    },
    {
      title: 'Tên thẻ',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at: Date) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarOutlined style={{ color: '#8c8c8c', marginRight: '4px' }} />
            <span>{dayjs(created_at).format('DD/MM/YYYY')}</span>
            <div style={{ marginLeft: '16px', color: '#8c8c8c', fontSize: '12px' }}>
              {dayjs(created_at).format('HH:mm')}
            </div>
          </div>
        </div>
      ),
      width: 200,
      align: 'center'
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      render: (price: number) => (
        <Text strong style={{ color: '#ff4d4f', fontSize: '14px' }}>
          {price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
        </Text>
      ),
      sorter: (a: ColumnsServicesCardType, b: ColumnsServicesCardType) => a.price - b.price,
      sortDirections: ['descend', 'ascend'],
      width: 180
    },
    // {
    //   title: 'Đã thanh toán',
    //   dataIndex: 'price_paid',
    //   key: 'price_paid',
    //   align: 'center',
    //   render: (price_paid: number, record: ColumnsServicesCardType) => {
    //     return (
    //       <Flex gap={10} justify='align' align='center'>
    //         <Flex>{price_paid.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Flex>
    //         <Flex align='center' justify='center' gap={10}>
    //           <Button
    //             onClick={() => {
    //               setModalType(ModalType.MODAL_UPDATE_PAID)
    //               setServicesCardSelected(record as ServicesOfCardType)
    //             }}
    //             type='dashed'
    //           >
    //             <GiPayMoney size={20} />
    //           </Button>
    //           <Button
    //             onClick={() => {
    //               setModalType(ModalType.MODAL_VIEW_HISTORY_PAID)
    //               setServicesCardSelected(record as ServicesOfCardType)
    //             }}
    //             type='dashed'
    //           >
    //             <TbPigMoney fill='yellow' size={20} />
    //           </Button>
    //         </Flex>
    //       </Flex>
    //     )
    //   },
    //   sorter: (a: ColumnsServicesCardType, b: ColumnsServicesCardType) => a.price - b.price,
    //   sortDirections: ['descend', 'ascend'],
    //   width: 200
    // },
    {
      title: 'Chi nhánh',
      dataIndex: 'branch',
      key: 'branch',
      width: 180,
      align: 'center',
      render: (branch: BranchType[]) => (
        <Paragraph
          style={{ margin: 0 }}
          ellipsis={{
            expandable: true,
            rows: 1
          }}
        >
          {branch?.length === optionsBranch.length + 1 ? (
            <Badge offset={[10, 0]} count={optionsBranch.length}>
              Toàn bộ
            </Badge>
          ) : (
            branch.map((b) => b.name).join(', ')
          )}
        </Paragraph>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'descriptions',
      key: 'descriptions',
      width: 200,
      render: (text: string) => (
        <Paragraph
          ellipsis={{
            expandable: true,
            rows: 1
          }}
        >
          {text}
        </Paragraph>
      )
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'services_of_card',
      key: 'services_of_card',
      width: 130,
      align: 'center',
      render: (services_of_card: ServicesOfCard[]) => {
        return (
          <RiServiceLine
            color='blue'
            size={30}
            style={
              services_of_card.length > 0
                ? {}
                : {
                    cursor: 'not-allowed',
                    color: 'gray'
                  }
            }
            cursor='pointer'
            onClick={() => {
              setServicesToView(services_of_card)
              setModalType(ModalType.MODAL_PREVIEW_SERVICE)
            }}
          />
        )
      }
    },
    // {
    //   title: 'Nhân viên',
    //   dataIndex: 'employee',
    //   key: 'employee',
    //   width: 120,
    //   align: 'center',
    //   render: (_, record: ColumnsServicesCardType) => {
    //     return (
    //       <RiMoneyDollarCircleLine
    //         onClick={() => {
    //           setServicesCardSelected(record as unknown as ServicesOfCardType)
    //           setModalType(ModalType.MODAL_VIEW_PRICE_EMPLOYEE)
    //         }}
    //         cursor={'pointer'}
    //         size={30}
    //       />
    //     )
    //   }
    // },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      render: (_: unknown, record: ColumnsServicesCardType) => {
        return (
          <Flex gap={10} justify='center'>
            <Button
              title='Sửa'
              onClick={() => {
                setModalType(ModalType.MODAL_CREATE_SERVICE_CARD)
                setServicesCardSelected(record as unknown as ServicesOfCardType)
              }}
              icon={<IoPencil color='blue' />}
            />
            <Popconfirm
              title={
                <Typography>
                  Bạn có chắc chắn muốn <div>xóa sản phẩm này không?</div>
                </Typography>
              }
              okText='Có'
              cancelText='Không'
            >
              <Button title='Xóa' icon={<IoMdTrash color='red' />} />
            </Popconfirm>
          </Flex>
        )
      },
      width: 150,
      align: 'center',
      fixed: 'right'
    }
  ]
  const [pagination, setPagination] = useState({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })

  const [requestBody, setRequestBody] = useState<GetServicesCardRequestBody>({
    limit: pagination.limit,
    page: pagination.page,
    search: searchValue,
    branch: [],
    code: searchValue,
    is_active: true,
    name: searchValue
  })

  const [newColumns, setNewColumns] = useState([])

  const { data, isLoading } = useQuery({
    queryKey: ['getAllServicesCard', requestBody],
    queryFn: () => servicesApi.getServicesCard(requestBody),
    staleTime: STALETIME
  })

  useEffect(() => {
    if (data) {
      const response = data?.data?.result
      const servicesCard = response?.servicesCard || []
      const total = response?.total || 0
      const page = response?.page || PAGE
      const limit = response?.limit || LIMIT
      setServicesCard(servicesCard)
      setPagination({
        page: page,
        limit: limit,
        total: total
      })
    }
  }, [data])

  const handleFilterBranch = (value: string[]) => {
    setRequestBody((prev) => ({
      ...prev,
      branch: value
    }))
  }

  const handleSearch = ({ value, typeSearch }: { value: string; typeSearch: SearchType }) => {
    setRequestBody((prev) => ({
      ...prev,
      [typeSearch]: value
    }))
  }

  const handleReloadPage = () => {
    message.loading('Đang tải dữ liệu...')
    queryClient.invalidateQueries({ queryKey: ['getAllServicesCard'] })
    setTimeout(() => {
      message.success('Dữ liệu đã được làm mới!')
    }, 3000)
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
                Quản lý danh sách thẻ dịch vụ
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

        <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
          <Col xs={24} sm={12} md={6} lg={6}>
            <Button
              onClick={() => {
                setModalType(ModalType.MODAL_CREATE_SERVICE_CARD)
              }}
              type='primary'
              style={{ width: '100%' }}
              icon={<GoPlus size={20} />}
              title='Thêm dịch vụ'
            >
              Thêm thẻ dịch vụ
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <OptionsBranch mode='multiple' search onchange={handleFilterBranch} />
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <DebouncedSearch
              placeholder='Tìm thẻ kiếm dich vụ'
              onSearch={(value) => {
                handleSearch({
                  value,
                  typeSearch: SearchType.NAME
                })
              }}
              debounceTime={1000}
            />
          </Col>
          <HiddenColumns
            STORAGE_KEY='serviceCard_table_columns'
            tableColumns={columns}
            style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}
            onNewColums={(value) => setNewColumns(value)}
          />
        </Row>

        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FilterOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              <span>Danh sách thẻ dịch vụ</span>
            </div>
          }
          style={{
            borderRadius: '12px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
          }}
          bodyStyle={{ padding: '0' }}
        >
          <Table
            style={{ width: '100%', borderRadius: '12px' }}
            columns={newColumns}
            scroll={{ x: '1300px' }}
            dataSource={servicesCard}
            rowKey={(record: ColumnsServicesCardType) => record._id || ''}
            loading={isLoading}
            pagination={{
              pageSize: LIMIT,
              showSizeChanger: false,
              current: PAGE,
              position: ['bottomCenter']
            }}
          />
        </Card>
      </div>

      <ModalCreateServiceCard
        visible={modalType === ModalType.MODAL_CREATE_SERVICE_CARD}
        onClose={() => {
          setModalType(ModalType.NONE)
        }}
        serviceCardToEdit={servicesCardSelected as unknown as ServicesOfCardType}
      />
      <ModalViewServicesOfCard
        open={modalType === ModalType.MODAL_PREVIEW_SERVICE}
        onCancel={() => {
          setModalType(ModalType.NONE)
        }}
        data={servicesToView || []}
      />
      {/* <ModalViewEmployeeCommision
        open={modalType === ModalType.MODAL_VIEW_PRICE_EMPLOYEE}
        onCancel={() => {
          setServicesCardSelected(undefined)
        }}
        data={servicesCardSelected as ServicesOfCardType}
      /> */}
      <ModalUpdatePaidOfServicesCard
        visible={modalType === ModalType.MODAL_UPDATE_PAID}
        onClose={() => {
          setModalType(ModalType.NONE)
        }}
        servicesCard={servicesCardSelected as ServicesOfCardType}
      />
      {/* <ModalViewHistoryPaid
        open={modalType === ModalType.MODAL_VIEW_HISTORY_PAID}
        onCancel={() => {
          setModalType(ModalType.NONE)
          setServicesCardSelected(undefined)
        }}
        data={servicesCardSelected?.history_paid || []}
      /> */}
    </Fragment>
  )
}

export default ServicesCard
