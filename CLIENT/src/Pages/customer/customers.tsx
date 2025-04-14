import { useQuery } from '@tanstack/react-query'
import {
  Button,
  Col,
  Row,
  Typography,
  TableColumnType,
  Table,
  Flex,
  Tooltip,
  message,
  Tag,
  DatePicker,
  Select
} from 'antd'
import dayjs from 'dayjs'
import { useContext, useEffect, useState } from 'react'
import { FaFacebook, FaRegCopy } from 'react-icons/fa'
import { FcApproval } from 'react-icons/fc'
import { GoPlus } from 'react-icons/go'
import { ImSpinner10 } from 'react-icons/im'
import { IoIosInformationCircleOutline } from 'react-icons/io'
import { IoPencil } from 'react-icons/io5'
import { MdKeyboardDoubleArrowDown } from 'react-icons/md'
import { SlPlus } from 'react-icons/sl'
import DebouncedSearch from 'src/Components/DebouncedSearch'
import OptionsBranch from 'src/Components/OptionsBranch'
import Title from 'src/Components/Title'
import { RoleUser } from 'src/Constants/enum'
import { optionsFinalStatus, optionsService } from 'src/Constants/option'
import { AppContext } from 'src/Context/AppContext'
import { Customer, CustomerFilterRequestType } from 'src/Interfaces/customers/customers.interfaces'
import { customerApi } from 'src/Service/customers/customer.api'
import { isAdminValidator } from 'src/Utils/util.utils'
const { Text } = Typography
const { Paragraph } = Typography
const LIMIT = 10
const PAGE = 1
const STALETIME = 5 * 60 * 1000

type ColumnsCustomer = Partial<Customer>

// enum TypeDate {
//   date = 'date',
//   schedule = 'schedule'
// }

enum FillterOptions {
  SERVICES = 'service',
  BRANCH = 'branch',
  BRANCH_STATUS = 'final_status_branch',
  date = 'date'
}

const today = dayjs().format('YYYY-MM-DD')

const Customers = () => {
  const { profile } = useContext(AppContext)
  const [pagination, setPagination] = useState({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })

  const [searchQuery, setSearchQuery] = useState('')

  const [filterCustomers, setFilterCustomers] = useState<CustomerFilterRequestType>({
    date: today,
    branch: isAdminValidator(profile?.role as RoleUser)
      ? undefined
      : [profile?.branch.name].filter((id): id is string => id !== undefined)
  })

  const [customers, setCustomers] = useState<Customer[]>([])

  const {
    data: customersResponse,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['customers', pagination.page, filterCustomers],
    queryFn: () =>
      customerApi.getAllCustomersSchedule({
        limit: pagination.limit,
        page: pagination.page,
        filter: {
          ...filterCustomers,
          service: filterCustomers.service?.length ? filterCustomers.service : undefined
        }
      }),
    staleTime: STALETIME
  })

  const { data: customersByPhone, isLoading: isLoadingSearch } = useQuery({
    queryKey: ['searchCustomersSuccessByPhone', searchQuery],
    queryFn: () => customerApi.searchCustomersByPhoneSuccessSchedule(searchQuery),
    enabled: !!searchQuery,
    staleTime: STALETIME
  })

  useEffect(() => {
    if (customersResponse) {
      const data = customersResponse.data.result.customers
      const total = customersResponse.data.result.total
      const limit = customersResponse.data.result.limit
      const page = customersResponse.data.result.page

      setCustomers(data)
      setPagination({
        ...pagination,
        total,
        limit,
        page
      })
    }
  }, [customersResponse])

  useEffect(() => {
    if (customersByPhone) {
      const data = customersByPhone.data.result
      setCustomers(data)
      // setPagination({
      //   ...pagination,
      //   page: 1,
      //   limit: data.length,
      //   total: data.length
      // })
    }
  }, [customersByPhone])

  useEffect(() => {
    if (searchQuery === '') {
      refetch()
    }
  }, [refetch, searchQuery])

  const columnsCustomers: TableColumnType<ColumnsCustomer>[] = [
    {
      title: 'Lịch hẹn',
      dataIndex: 'schedule',
      key: 'schedule',
      width: 200,
      fixed: 'left',
      render: (date) => {
        return date?.length > 10 ? (
          <Text strong>
            <Text style={{ fontWeight: 'bold' }}>{date.slice(0, 10)}</Text>
            <Text>{` | ${date.slice(10, 16)}`}</Text>
          </Text>
        ) : (
          <Text strong>{date}</Text>
        )
      }
    },
    {
      title: 'C.Nhánh XN',
      dataIndex: 'final_status',
      key: 'final_status',
      fixed: 'right',
      align: 'center',
      render: (text) => {
        return text === optionsFinalStatus[1].value ? (
          <Tag
            icon={
              <FcApproval
                size={15}
                style={{
                  marginRight: '5px',
                  marginTop: '2px'
                }}
              />
            }
            color='success'
          >
            {text}
          </Tag>
        ) : (
          <Tag
            style={{
              padding: '2px 10px'
            }}
            icon={<ImSpinner10 className='spin-icon' size={15} />}
            color='processing'
          >
            {text}
          </Tag>
        )
      },
      width: 130
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'name',
      fixed: 'left',
      key: 'name',
      minWidth: 200,
      render: (name, record) => {
        return (
          <Flex align='center'>
            <Text>{name}</Text>
            {record.parent_id !== null && (
              <Tooltip title={`Đi cùng :${record.parent_id}`}>
                <IoIosInformationCircleOutline
                  size={30}
                  style={{
                    marginLeft: '10px',
                    cursor: 'pointer'
                  }}
                />
              </Tooltip>
            )}
          </Flex>
        )
      }
    },
    {
      title: 'Số điện thoại',
      width: 160,
      dataIndex: 'phone',
      fixed: 'left',
      render: (phone: string, record) => {
        return (
          <Typography
            style={{
              display: 'flex',
              gap: 15,
              alignItems: 'center',
              color: record.is_old_phone ? 'purple' : 'black',
              fontWeight: record.is_old_phone ? 'bold' : 'normal',
              fontSize: record.is_old_phone ? 16 : 14
            }}
          >
            {phone}
            <FaRegCopy
              onClick={() => {
                navigator.clipboard.writeText(phone)
                message.success('Sao chép số điện thoại thành công')
              }}
              style={{ cursor: 'pointer' }}
            />
          </Typography>
        )
      }
    },
    {
      title: 'Chi nhánh',
      dataIndex: 'branch',
      key: 'branch'
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      minWidth: 120
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'service',
      key: 'service',
      minWidth: 150,
      render: (services) => services.join(', ')
    },
    {
      title: 'Chi tiết dịch vụ',
      dataIndex: 'service_detail',
      key: 'service_detail',
      render: (text) => (
        <Paragraph ellipsis={{ rows: 1, expandable: true, symbol: <MdKeyboardDoubleArrowDown /> }}>{text}</Paragraph>
      )
    },
    {
      title: 'Nguồn',
      dataIndex: 'source',
      key: 'source',
      width: 80,
      render: (source) => {
        return source === 'Facebook' ? <FaFacebook color='blue' size={20} cursor={'pointer'} /> : source
      },
      align: 'center'
    },
    {
      title: 'T.Thái số',
      dataIndex: 'status_data',
      key: 'status_data',
      minWidth: 100,
      align: 'center'
    },

    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      render: (_: unknown, record: Partial<Customer>) => {
        return (
          <Flex gap={10}>
            <Button title='Sửa' icon={<IoPencil color='blue' />} />
            <Button title='Sửa' icon={<SlPlus color='blue' />} />
          </Flex>
        )
      },
      width: 110,
      align: 'center',
      fixed: 'right'
    }
  ]

  const goToNextPage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page
    }))
  }

  const handleTableChange = async (page: number) => {
    goToNextPage(page)
  }

  const handleFilter = (filter: keyof CustomerFilterRequestType, value: string | string[]) => {
    setFilterCustomers((prev) => ({
      ...prev,
      [filter]: value
    }))
  }

  return (
    <Row style={{ padding: 20 }} gutter={[16, 16]}>
      <Col span={24}>
        <Row gutter={[16, 16]}>
          <Col span={24}>{Title({ title: 'Danh Sách Khách Hàng', level: 2 })}</Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col
            span={24}
            style={{
              display: 'flex',
              gap: 10,
              marginBottom: 20,
              marginTop: 20
            }}
          >
            <Col sm={24} md={3}>
              <Button
                // onClick={() => {
                //   setModalType(ModalType.MODAL_CREATE_SERVICE_CARD)
                // }}
                type='primary'
                style={{ width: '100%' }}
                icon={<GoPlus size={20} />}
                title='Thêm dịch vụ'
              >
                Thêm khách hàng
              </Button>
            </Col>
            <Col sm={24} md={4}>
              <DebouncedSearch
                placeholder='Tìm điện thoại'
                onSearch={(value) => {
                  setSearchQuery(value)
                }}
                debounceTime={1000}
              />
            </Col>
            <Col span={4}>
              <DatePicker
                placeholder='Ngày hẹn'
                style={{ width: '100%' }}
                format='YYYY-MM-DD'
                defaultValue={dayjs(today)}
                onChange={(date) => {
                  handleFilter(FillterOptions.date, date.format('YYYY-MM-DD'))
                }}
              />
            </Col>
            <Col sm={24} md={3}>
              <OptionsBranch
                initialValue={
                  isAdminValidator(profile?.role as RoleUser)
                    ? undefined
                    : [profile?.branch._id].filter((id): id is string => id !== undefined)
                }
                mode={isAdminValidator(profile?.role as RoleUser) ? 'multiple' : undefined}
                disabled={!isAdminValidator(profile?.role as RoleUser)}
                search
              />
            </Col>
            <Col span={4}>
              <Select
                showSearch
                placeholder='Dich vụ'
                allowClear
                mode='multiple'
                style={{ width: '100%' }}
                onChange={(value) => handleFilter(FillterOptions.SERVICES, value)}
                options={optionsService}
              />
            </Col>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Table
              columns={columnsCustomers}
              bordered
              loading={isLoading || isLoadingSearch}
              dataSource={customers}
              pagination={{
                pageSize: pagination.limit,
                total: pagination.total,
                current: pagination.page,
                showSizeChanger: false,
                onChange: handleTableChange,
                position: ['bottomCenter']
              }}
              scroll={{ x: 'fit-content' }}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default Customers
