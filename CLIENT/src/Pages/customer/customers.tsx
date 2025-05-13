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
  Checkbox,
  Space
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
import Title from 'src/Components/Title'
import { RoleUser } from 'src/Constants/enum'
import { optionsFinalStatus, optionsService } from 'src/Constants/option'
import { AppContext } from 'src/Context/AppContext'
import { Customer, CustomerFilterRequestType } from 'src/Interfaces/customers/customers.interfaces'
import { customerApi } from 'src/Service/customers/customer.api'
import { isAdminValidator } from 'src/Utils/util.utils'
import ExpandableParagraph from 'src/Components/ExpandableParagraph'
const { useBreakpoint } = Grid
const { Text } = Typography
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

const STORAGE_KEY = 'customer_table_columns'
// Hàm đọc trạng thái cột từ localStorage
const getStoredColumns = () => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY)
    return storedData ? JSON.parse(storedData) : null
  } catch (error) {
    console.error('Lỗi khi đọc từ localStorage:', error)
    return null
  }
}

// Hàm lưu trạng thái cột vào localStorage
const saveColumnsToStorage = (columns: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns))
  } catch (error) {
    console.error('Lỗi khi lưu vào localStorage:', error)
  }
}

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
      width: 120
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
      width: 180,
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

  // Handle check options for hidden columns
  const defaultColumns = columnsCustomers.map((item) => item.key).filter(Boolean)
  const storedColumns = getStoredColumns()
  const validStoredColumns = storedColumns
    ? storedColumns.filter((col: any) => defaultColumns.includes(col))
    : defaultColumns
  const [checkedList, setCheckedList] = useState(validStoredColumns)
  const options = columnsCustomers
    .filter((column) => column.key && column.title)
    .map(({ key, title }) => ({
      label: title,
      value: key
    }))

  const handleColumnsChange = (value: string[]) => {
    setCheckedList(value)
    saveColumnsToStorage(value)
  }

  const handleSelectAll = (e: any) => {
    const allValues = options.map((opt) => opt.value as string)
    const newValues = e.target.checked ? allValues : []
    setCheckedList(newValues)
    saveColumnsToStorage(newValues)
  }

  const newColumns = columnsCustomers.map((item) => ({
    ...item,
    hidden: !checkedList.includes(item.key as string)
  }))

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

  const customTagRender = (props: any) => {
    const { label, closable, onClose } = props

    // Hiển thị bình thường cho các trường hợp khác
    return (
      <Tag color='blue' closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
        {label}
      </Tag>
    )
  }

  return (
    <Fragment>
      <Row style={{ padding: '20px' }} gutter={[16, 16]}>
        <Col xs={24}>{Title({ title: 'Danh Sách Khách Hàng', level: 2 })}</Col>
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
        <Col xs={24} sm={12} md={4} lg={4}>
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
      </Row>

      <Row style={{ padding: '0 20px', width: '100%' }}>
        <Col xs={24}>
          <Space direction='vertical' style={{ width: '100%' }}>
            <Checkbox
              checked={checkedList.length === options.length}
              indeterminate={checkedList.length > 0 && checkedList.length < options.length}
              onChange={handleSelectAll}
            >
              Chọn tất cả
            </Checkbox>

            <Select
              mode='multiple'
              style={{ width: '100%' }}
              placeholder='Chọn các cột hiển thị'
              value={checkedList}
              onChange={handleColumnsChange}
              options={options}
              allowClear
              tagRender={customTagRender}
            />
          </Space>
        </Col>
      </Row>

      {/* Table Customer */}
      <Row gutter={16} style={{ padding: '20px' }}>
        <Col span={24}>
          <Table
            columns={newColumns}
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
            scroll={{ x: '1000px' }}
          />
        </Col>
      </Row>
    </Fragment>
  )
}

export default Customers
