import { useQuery } from '@tanstack/react-query'
import { Badge, Button, Col, Flex, Popconfirm, Row, Switch, Table, TableColumnType, Typography } from 'antd'
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
import ModalViewEmployeeCommission from 'src/Modal/services/ModalViewEmployeeCommission'
import { GiPayMoney } from 'react-icons/gi'
import { TbPigMoney } from 'react-icons/tb'
import ModalUpdatePaidOfServicesCard from 'src/Modal/services/ModalUpdatePaidOfServicesCard'
import ModalViewHistoryPaid from 'src/Modal/services/ModalViewHistoryPaid'
import Title from 'src/Components/Title'
const { Paragraph } = Typography

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

  const columns: TableColumnType<ColumnsServicesCardType>[] = [
    {
      title: 'Mã thẻ',
      dataIndex: 'code',
      key: 'code',
      width: 100,
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
      key: 'name'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at: string) => new Date(created_at).toLocaleDateString('vi-VN'),
      width: 130,
      align: 'center'
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
      sorter: (a: ColumnsServicesCardType, b: ColumnsServicesCardType) => a.price - b.price,
      sortDirections: ['descend', 'ascend'],
      width: 150
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
      minWidth: 130,
      align: 'center',
      render: (branch: BranchType[]) => (
        <Paragraph
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
      width: 100,
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
          <Flex gap={10}>
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
      width: 120,
      align: 'center',
      fixed: 'right'
    }
  ]

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

  return (
    <Fragment>
      {/* Title Services Card Service */}
      <Row style={{ padding: '20px' }} gutter={[16, 16]}>
        <Col xs={24}>{Title({ title: 'Danh sách thẻ dịch vụ', level: 2 })}</Col>
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
      </Row>

      {/* Table Services Card Service */}
      <Row gutter={16} style={{ padding: '20px' }}>
        <Col span={24}>
          <Table
            columns={columns}
            bordered
            scroll={{ x: 'max-content' }}
            dataSource={servicesCard}
            rowKey={(record: ColumnsServicesCardType) => record._id || ''}
            loading={isLoading}
            pagination={{
              pageSize: LIMIT,
              showSizeChanger: false,
              current: PAGE
            }}
          />
        </Col>
      </Row>
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
      {/* <ModalViewEmployeeCommission
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
