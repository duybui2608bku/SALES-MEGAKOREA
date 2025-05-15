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
  Select,
  Grid,
  Card
} from 'antd'
import dayjs from 'dayjs'
import { Fragment, useContext, useEffect, useState } from 'react'
import { FaFacebook, FaRegCopy } from 'react-icons/fa'
import { FcApproval } from 'react-icons/fc'
import { GoPlus } from 'react-icons/go'
import { ImSpinner10 } from 'react-icons/im'
import { IoIosInformationCircleOutline } from 'react-icons/io'
import { IoPencil } from 'react-icons/io5'
import { MdKeyboardDoubleArrowDown, MdKeyboardDoubleArrowUp } from 'react-icons/md'
import { SlPlus } from 'react-icons/sl'
import DebouncedSearch from 'src/Components/DebouncedSearch'
import OptionsBranch from 'src/Components/OptionsBranch'
import { RoleUser } from 'src/Constants/enum'
import { optionsFinalStatus, optionsService } from 'src/Constants/option'
import { AppContext } from 'src/Context/AppContext'
import { Customer, CustomerFilterRequestType } from 'src/Interfaces/customers/customers.interfaces'
import { customerApi } from 'src/Service/customers/customer.api'
import { isAdminValidator } from 'src/Utils/util.utils'
import ExpandableParagraph from 'src/Components/ExpandableParagraph'
import HiddenColumns from 'src/Components/HiddenColumns'
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons'
import { FaUsers } from 'react-icons/fa6'
import { queryClient } from 'src/main'
const { useBreakpoint } = Grid
const { Text, Title } = Typography

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
  const screens = useBreakpoint()
  const isMobile = !screens.md
  // Columns Table
  const columnsCustomers: TableColumnType<ColumnsCustomer>[] = [
    {
      title: 'Lịch hẹn',
      dataIndex: 'schedule',
      key: 'schedule',
      fixed: isMobile ? undefined : 'left',
      width: 190,
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
      align: 'center',
      render: (text) => {
        return text === optionsFinalStatus[1].value ? (
          <Tag className='status-customer-tagName' icon={<FcApproval size={15} />} color='success'>
            {text}
          </Tag>
        ) : (
          <Tag
            className='status-customer-tagName'
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
      key: 'name',
      fixed: isMobile ? undefined : 'left',
      width: 200,
      render: (name, record) => {
        return (
          <Flex align='center'>
            <Text>{name}</Text>
            {record.parent_id !== null && (
              <Tooltip title={`Đi cùng: ${record.parent_id}`}>
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
      align: 'center',
      width: 160,
      key: 'phone',
      dataIndex: 'phone',
      render: (phone: string, record) => {
        return (
          <Typography
            style={{
              display: 'flex',
              gap: 15,
              alignItems: 'center',
              color: record.is_old_phone ? 'purple' : 'black',
              fontWeight: record.is_old_phone ? 'bold' : 'normal',
              fontSize: record.is_old_phone ? 14 : 14,
              textShadow: record.is_old_phone ? '0 0 5px purple' : undefined,
              animation: record.is_old_phone ? 'pulse 1.5s infinite' : undefined
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
      key: 'branch',
      width: 150
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      width: 180
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'service',
      key: 'service',
      width: 130,
      render: (services) => services.join(', ')
    },
    {
      title: 'Chi tiết dịch vụ',
      dataIndex: 'service_detail',
      key: 'service_detail',
      width: 220,
      render: (text) => (
        <ExpandableParagraph
          text={text}
          rows={1}
          moreText={<MdKeyboardDoubleArrowDown />}
          lessText={<MdKeyboardDoubleArrowUp />}
        />
      )
    },
    {
      title: 'Nguồn',
      dataIndex: 'source',
      key: 'source',
      width: 80,
      render: (source) => {
        return source === 'Facebook' ? <FaFacebook color='#1677ff' size={20} cursor={'pointer'} /> : source
      },
      align: 'center'
    },
    {
      title: 'T.Thái số',
      dataIndex: 'status_data',
      key: 'status_data',
      width: 120,
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
  const [newColumns, setNewColumns] = useState([])

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
  }, [customersResponse, pagination])

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

  const handleRefresh = () => {
    message.loading('Đang tải lại dữ liệu...')
    queryClient.invalidateQueries({ queryKey: ['customers'] })
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
                <FaUsers style={{ marginRight: '12px', color: '#1890ff' }} />
                Quản lý danh sách khách háng
              </Title>
            </Col>
            <Col>
              <Button
                type='primary'
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
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
          <Col xs={24} sm={12} md={4} lg={4}>
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
          <Col xs={24} sm={12} md={4} lg={4}>
            <DebouncedSearch
              placeholder='Tìm điện thoại'
              onSearch={(value) => {
                setSearchQuery(value)
              }}
              debounceTime={1000}
            />
          </Col>
          <Col xs={24} sm={12} md={4} lg={4}>
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
          <Col xs={24} sm={12} md={4} lg={4}>
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
          <Col xs={24} sm={12} md={4} lg={3}>
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
          <Col xs={24} sm={12} md={4} lg={3}>
            <HiddenColumns
              STORAGE_KEY='customers_table_columns'
              tableColumns={columnsCustomers}
              style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}
              onNewColums={(value) => setNewColumns(value)}
            />
          </Col>
        </Row>

        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FilterOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              <span>Danh sách khách hàng</span>
            </div>
          }
          style={{
            borderRadius: '12px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
          }}
          bodyStyle={{ padding: '0' }}
        >
          <Table
            style={{ borderRadius: '12px', width: '100%' }}
            columns={newColumns}
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
            scroll={{ x: '1000px' }}
          />
        </Card>
        <style>{`
        .stat-card {
          border-radius: 12px;
          transition: all 0.3s;
          overflow: hidden;
        }
        .stat-card:hover {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
          transform: translateY(-4px);
        }
        .ant-table {
          border-radius: 12px;
          overflow: hidden;
        }
        .ant-table-thead > tr > th {
          background-color: #fafafa;
        }
        .ant-table-tbody > tr > td {
          padding: 12px 16px;
        }
        .ant-table-row:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .ant-progress-text {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.65);
        }
        .ant-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .ant-modal-content {
          border-radius: 12px;
          overflow: hidden;
        }
        .ant-list-item {
          padding: 10px 0;
          display: flex;
          justify-content: space-between;
        }
        .ant-segmented {
          background-color: #f5f5f5;
          padding: 2px;
          border-radius: 8px;
        }
        .ant-segmented-item-selected {
          background-color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .ant-segmented-item {
          border-radius: 6px !important;
          transition: all 0.3s;
        }
        .ant-card-head {
          border-bottom: 1px solid #f0f0f0;
        }
        .ant-card-head-title {
          padding: 16px 0;
        }
        .ant-card-extra {
          padding: 16px 0;
        }
        .ant-table-pagination {
          margin: 16px;
        }
      `}</style>
      </div>
    </Fragment>
  )
}

export default Customers
