import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Card, Col, Flex, message, Popconfirm, Row, Switch, Table, TableColumnType, Typography } from 'antd'
import { Fragment, useEffect, useState, useCallback, useContext } from 'react'
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
// import Title from 'src/Components/Title'
import ExpandableParagraph from 'src/Components/ExpandableParagraph'
const { Paragraph, Text, Title } = Typography
import { FaAnglesDown, FaAnglesUp } from 'react-icons/fa6'
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons'
import { AppContext } from 'src/Context/AppContext'
import { RoleUser } from 'src/Constants/enum'
import { RiServiceFill } from 'react-icons/ri'
import HiddenColumns from 'src/Components/HiddenColumns'
import { handleRefresh } from 'src/Utils/util.utils'

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
  step_services_details: StepServicesType[]
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
  const [servicesToEdit, setServicesToEdit] = useState<ServicesType | null>(null)
  const [servicesSelected, setServicesSelected] = useState<StepServicesType[]>([])
  const [modalType, setModalType] = useState<ModalType>(ModalType.NONE)
  const [loadingStatusUpdate, setLoadingStatusUpdate] = useState<string | null>(null)
  const { profile } = useContext(AppContext)
  const isAdmin = profile?.role === RoleUser.ADMIN
  const userBranchId = profile?.branch?._id && !isAdmin ? [profile.branch._id] : []
  const [filterBranch, setFilterBranch] = useState<string[]>(userBranchId)
  const [pagination, setPagination] = useState<PaginationType>({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })
  const columns: TableColumnType<ColumnsServicesType>[] = [
    {
      title: 'Mã sản phẩm',
      dataIndex: 'code',
      key: 'code',
      width: 130,
      align: 'center',
      fixed: 'left'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 120,
      render: (isActive: boolean, record: ServicesType) => {
        return (
          <Flex justify='center'>
            <Switch
              checked={isActive}
              onChange={(checked) => handleToggleStatus(record._id, checked)}
              loading={loadingStatusUpdate === record._id}
            />
          </Flex>
        )
      }
    },
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      fixed: 'left'
    },
    {
      title: 'Danh mục',
      dataIndex: 'service_group',
      key: 'service_group',
      width: 180,
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
      width: 120,
      align: 'center'
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      render: (price: number) => {
        return (
          <Text style={{ color: '#ff4d4f', fontSize: '15px' }} strong>
            {price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </Text>
        )
      },
      sorter: (a: ServicesType, b: ServicesType) => a.price - b.price,
      sortDirections: ['descend', 'ascend'],
      width: 150
    },
    // {
    //   title: 'Hoa hồng',
    //   dataIndex: 'service_group',
    //   key: 'service_group',
    //   align: 'center',
    //   render: (service_group: ServicesCategoryType) => {
    //     return (
    //       <Text style={{ color: '#FFB74D', fontSize: '15px' }} strong>
    //         {(service_group?.tour_price ?? 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
    //       </Text>
    //     )
    //   },
    //   sorter: (a: ServicesType, b: ServicesType) => a.price - b.price,
    //   sortDirections: ['descend', 'ascend'],
    //   width: 150
    // },
    {
      title: 'Chi nhánh',
      dataIndex: 'branch',
      key: 'branch',
      width: 170,
      align: 'center',
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
      width: 150,
      render: (text: string) => {
        return text ? (
          <ExpandableParagraph text={text} moreText={<FaAnglesDown />} lessText={<FaAnglesUp />} rows={1} />
        ) : null
      }
    },
    {
      title: 'Quy trình',
      dataIndex: 'step_services_details',
      key: 'step_services_details',
      render: (_, record: ServicesType) => {
        const stepServices = Array.isArray(record.step_services_details)
          ? (record.step_services_details as StepServicesType[])
          : []

        return stepServices.length > 0 ? (
          <PiHandArrowDownDuotone
            onClick={() => {
              setModalType(ModalType.MODAL_STEP_SERVICES)
              setServicesSelected(stepServices)
            }}
            color='royalblue'
            size={30}
            cursor='pointer'
          />
        ) : (
          <FcCancel style={{ cursor: 'not-allowed' }} size={30} />
        )
      },
      width: 120,
      align: 'center'
    },
    {
      title: 'Hành động',
      dataIndex: '_id',
      key: '_id',
      align: 'center',
      fixed: 'right',
      render: (_id: string, record: ServicesType) => (
        <Flex gap={10} justify='center'>
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
  const [newColumns, setNewColumns] = useState([])

  const { data, isLoading } = useQuery({
    queryKey: ['getAllServices', pagination, filterBranch],
    queryFn: () => {
      const query =
        filterBranch.length > 0
          ? {
              page: pagination.page,
              limit: LIMIT,
              branch: filterBranch.join(',')
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

  const handleDeleteService = useCallback(
    (id: string) => {
      deleteServices(id)
    },
    [deleteServices]
  )

  const handleFilterBranch = useCallback((value: string[]) => {
    setFilterBranch(value)
  }, [])

  const goToNextPage = useCallback((page: number) => {
    setPagination((prev) => ({
      ...prev,
      page
    }))
  }, [])

  const handleSearch = useCallback((value: string) => {
    console.log(`Searching for: ${value}`)
    setPagination((prev) => ({ ...prev, page: PAGE }))
  }, [])

  const handleTableChange = useCallback(
    (page: number) => {
      goToNextPage(page)
    },
    [goToNextPage]
  )

  const handleCloseModal = useCallback(() => {
    setModalType(ModalType.NONE)
    setServicesToEdit(null)
    setServicesSelected([])
  }, [])

  const handleToggleStatus = useCallback(
    async (id: string, checked: boolean) => {
      setLoadingStatusUpdate(id)

      // Find the service to update
      const serviceToUpdate = services.find((service) => service._id === id)
      if (!serviceToUpdate) {
        message.error('Dịch vụ không tồn tại!')
        setLoadingStatusUpdate(null)
        return
      }

      // Optimistically update UI
      const updatedServices = services.map((service) =>
        service._id === id ? { ...service, is_active: checked } : service
      )
      setServices(updatedServices)

      try {
        await servicesApi.updateServiceStatus(id, checked)
        queryClient.invalidateQueries({ queryKey: ['getAllServices'] })
        message.success('Cập nhật trạng thái thành công!')
      } catch (error: any) {
        // Revert the optimistic update on error
        setServices(services)
        message.error(`Lỗi khi cập nhật trạng thái: ${error?.message || 'Đã xảy ra lỗi'}`)
      } finally {
        setLoadingStatusUpdate(null)
      }
    },
    [services]
  )

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
                <RiServiceFill style={{ marginRight: '12px', color: '#1890ff' }} />
                Quản lý danh sách dịch vụ
              </Title>
            </Col>
            <Col>
              <Button
                type='primary'
                icon={<ReloadOutlined />}
                onClick={() => handleRefresh('getAllServices')}
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
          <Col xs={24} sm={12} md={6} lg={6}>
            <OptionsBranch
              mode='multiple'
              placeholder='Lọc theo chi nhánh'
              search
              onchange={isAdmin ? handleFilterBranch : undefined}
              value={filterBranch}
              disabled={!isAdmin}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <DebouncedSearch placeholder='Tìm kiếm dich vụ' onSearch={handleSearch} debounceTime={1000} />
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <HiddenColumns
              STORAGE_KEY='service_table_columns'
              tableColumns={columns}
              style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifySelf: 'flex-end' }}
              onNewColums={(value) => setNewColumns(value)}
            />
          </Col>
        </Row>

        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FilterOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              <span>Danh sách dịch vụ</span>
            </div>
          }
          style={{
            borderRadius: '12px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
          }}
          bodyStyle={{ padding: '0' }}
        >
          <Table
            sticky
            style={{ width: '100%', borderRadius: '12px' }}
            scroll={{ x: '1200px' }}
            columns={newColumns as any}
            dataSource={services}
            rowKey='_id'
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              onChange: handleTableChange,
              position: ['bottomCenter']
            }}
            loading={isLoading}
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

      <ServiceStepsModal
        visible={modalType === ModalType.MODAL_STEP_SERVICES}
        onClose={handleCloseModal}
        stepServices={servicesSelected}
      />
      <ModalCreateService
        visible={modalType === ModalType.MODAL_CREATE_SERVICE}
        onClose={handleCloseModal}
        serviceToEdit={servicesToEdit}
      />
    </Fragment>
  )
}

export default Service
