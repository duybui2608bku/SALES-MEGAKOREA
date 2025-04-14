import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Col, Flex, message, Popconfirm, Row, Switch, Table, TableColumnType, Typography } from 'antd'
import { Fragment, useEffect, useState } from 'react'
import { IoMdTrash } from 'react-icons/io'
import { optionsBranch } from 'src/Constants/option'
import { BranchType } from 'src/Interfaces/branch/branch.interface'
import {
  ProductOfServices,
  ServicesCategoryType,
  ServicesType,
  StepServicesType
} from 'src/Interfaces/services/services.interfaces'
import { servicesApi } from 'src/Service/services/services.api'
import { PaginationType } from 'src/Types/util.type'
import { IoPencil } from 'react-icons/io5'
import { PiHandArrowDownDuotone } from 'react-icons/pi'
import ServiceStepsModal from './Components/StepServices'
import OptionsBranch from 'src/Components/OptionsBranch'
import DebouncedSearch from 'src/Components/DebouncedSearch'
import { GoPlus } from 'react-icons/go'
import ModalCreateService from 'src/Modal/services/ModalCreateService'
import { FcCancel } from 'react-icons/fc'
import { queryClient } from 'src/main'
const { Paragraph } = Typography

const LIMIT = 9
const PAGE = 1
const STALETIME = 5 * 60 * 1000

interface ColumnsServicesType {
  _id: string
  code: string
  name: string
  price: number
  branch: string[]
  descriptions: string
  is_active: boolean
  step_services: StepServicesType[]
  products: ProductOfServices[]
  service_group: ServicesCategoryType
  created_at: Date
  updated_at: Date
}

enum ModalType {
  NONE = 0,
  MODAL_STEP_SERVICES = 1,
  MODAL_CREATE_SERVICE = 2
}

const Service = () => {
  const [services, setServices] = useState<ServicesType[]>([])
  const [filterBranch, setFilterBranch] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [servicesToEdit, setServicesToEdit] = useState<ServicesType | null>(null)
  const [servicesSelected, setServicesSelected] = useState<StepServicesType[]>([])
  const [modalType, setModalType] = useState<ModalType>(ModalType.NONE)

  const [pagination, setPagination] = useState<PaginationType>({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })

  const { data, isLoading } = useQuery({
    queryKey: ['getAllServices', pagination, filterBranch],
    queryFn: () => {
      const query =
        filterBranch.length > 0
          ? {
              page: pagination.page,
              limit: LIMIT,
              branch: encodeURI(filterBranch.join(','))
            }
          : {
              page: pagination.page,
              limit: LIMIT
            }
      return servicesApi.getAllServices(query)
    },
    staleTime: STALETIME
  })

  useEffect(() => {
    if (data) {
      const services = data.data.result.services
      const total = data.data.result.total
      setServices(services)
      setPagination({
        ...pagination,
        total: total
      })
    }
  }, [data])

  const columns: TableColumnType<ColumnsServicesType>[] = [
    {
      title: 'Mã sản phẩm',
      dataIndex: 'code',
      key: 'code',
      width: 130,
      align: 'center'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 120,
      render: (isActive: boolean, record: ServicesType) => {
        return (
          <Flex justify='center'>
            <Switch checked={isActive} onChange={() => console.log(record)} />
          </Flex>
        )
      }
    },
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Danh mục',
      dataIndex: 'service_group',
      key: 'service_group',
      render: (service_group: ServicesCategoryType) => {
        return (
          <Typography.Text
            ellipsis={{
              tooltip: true
            }}
          >
            {service_group?.name || 'Chưa có'}
          </Typography.Text>
        )
      }
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
      sorter: (a: ServicesType, b: ServicesType) => a.price - b.price,
      sortDirections: ['descend', 'ascend'],
      width: 150
    },
    {
      title: 'Chi nhánh',
      dataIndex: 'branch',
      key: 'branch',
      render: (branch: BranchType[]) => (
        <Paragraph
          ellipsis={{
            expandable: true,
            rows: 1
          }}
        >
          {branch?.length === optionsBranch.length + 1 ? 'Toàn bộ' : branch.map((b) => b.name).join(', ')}
        </Paragraph>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'descriptions',
      key: 'descriptions',
      render: (text: string) => <Typography.Text ellipsis={{ tooltip: true }}>{text}</Typography.Text>
    },
    {
      title: 'Quy trình',
      dataIndex: 'step_services',
      key: 'step_services',
      render: (_, record: ServicesType) =>
        record.step_services.length > 0 ? (
          <PiHandArrowDownDuotone
            onClick={() => {
              setModalType(ModalType.MODAL_STEP_SERVICES)
              setServicesSelected(record.step_services)
            }}
            color='royalblue'
            size={30}
            cursor='pointer'
          />
        ) : (
          <FcCancel size={30} />
        ),
      width: 130,
      align: 'center'
    },
    {
      title: 'Hành động',
      dataIndex: '_id',
      key: '_id',
      render: (_id: string, record: ServicesType) => (
        <Flex gap={10}>
          <Button
            onClick={() => {
              setModalType(ModalType.MODAL_CREATE_SERVICE)
              setServicesToEdit(record)
            }}
            title='Sửa'
            icon={<IoPencil color='blue' />}
          />
          <Popconfirm
            title={
              <Typography>
                Bạn có chắc chắn muốn <div>xóa dịch vụ này không?</div>
              </Typography>
            }
            okText='Có'
            cancelText='Không'
            onConfirm={() => handleDeleteService(_id)}
            okButtonProps={{
              loading: isPending
            }}
          >
            <Button title='Xóa' icon={<IoMdTrash color='red' />} />
          </Popconfirm>
        </Flex>
      ),
      width: 130
    }
  ]

  const { mutate: deleteServices, isPending } = useMutation({
    mutationFn: servicesApi.deleteServices,
    onSuccess: () => {
      message.success('Xóa sản phẩm thành công!')
      queryClient.invalidateQueries({ queryKey: ['getAllServices'] })
    },
    onError: (error: Error) => {
      message.error(`Lỗi khi xóa dịch vụ: ${error.message}`)
    }
  })

  const handleDeleteService = (id: string) => {
    deleteServices(id)
  }

  const handleFilterBranch = (value: string[]) => {
    setFilterBranch(value)
  }

  const goToNextPage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page
    }))
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setPagination((prev) => ({ ...prev, page: PAGE, total: 1 }))
  }

  const handleTableChange = async (page: number) => {
    goToNextPage(page)
  }

  return (
    <Fragment>
      <Row
        style={{
          padding: 20
        }}
      >
        <Col span={24}>
          <Flex justify='center' style={{ margin: 20 }}>
            <Typography.Title level={2}>Danh sách dịch vụ</Typography.Title>
          </Flex>
        </Col>
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
              onClick={() => {
                setModalType(ModalType.MODAL_CREATE_SERVICE)
              }}
              type='primary'
              style={{ width: '100%' }}
              icon={<GoPlus size={20} />}
              title='Thêm dịch vụ'
            >
              Thêm dịch vụ
            </Button>
          </Col>
          <Col sm={24} md={3}>
            <OptionsBranch mode='multiple' search onchange={handleFilterBranch} />
          </Col>
          <Col sm={24} md={4}>
            <DebouncedSearch
              placeholder='Tìm kiếm dich vụ'
              onSearch={(value) => handleSearch(value)}
              debounceTime={1000}
            />
          </Col>
        </Col>
        <Col span={24}>
          <Table
            bordered
            columns={columns}
            dataSource={services}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              onChange: handleTableChange,
              position: ['bottomCenter']
            }}
            loading={isLoading}
          />
        </Col>
      </Row>
      <ServiceStepsModal
        visible={modalType === ModalType.MODAL_STEP_SERVICES}
        onClose={() => {
          setModalType(ModalType.NONE)
          setServicesSelected([])
        }}
        stepServices={servicesSelected}
      />
      <ModalCreateService
        visible={modalType === ModalType.MODAL_CREATE_SERVICE}
        onClose={() => {
          setModalType(ModalType.NONE)
          setServicesToEdit(null)
        }}
        serviceToEdit={servicesToEdit}
      />
    </Fragment>
  )
}

export default Service
