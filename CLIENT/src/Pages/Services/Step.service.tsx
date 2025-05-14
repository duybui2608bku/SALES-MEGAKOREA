import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Card, Col, Flex, Popconfirm, Row, Table, TableColumnType, Typography, message } from 'antd'
import { useEffect, useState, useContext } from 'react'
import { GoPlus } from 'react-icons/go'
import { IoMdTrash } from 'react-icons/io'
import { IoPencil } from 'react-icons/io5'
import { Fragment } from 'react/jsx-runtime'
import DebouncedSearch from 'src/Components/DebouncedSearch'
import OptionsCategoryServices from 'src/Components/OptionsCategoryServices'
import { TypeCommision, RoleUser } from 'src/Constants/enum'
import { ServicesCategoryType, StepServicesInterface } from 'src/Interfaces/services/services.interfaces'
import ModalCreateOrUpdateStepService from 'src/Modal/services/ModalCreateOrUpdateStepService'
import { servicesApi } from 'src/Service/services/services.api'
import { getTypeCommision, handleRefresh } from 'src/Utils/util.utils'
import OptionsBranch from 'src/Components/OptionsBranch'
import { AppContext } from 'src/Context/AppContext'
import { MdOutlineHomeRepairService } from 'react-icons/md'
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons'
import HiddenColumns from 'src/Components/HiddenColumns'
const { Title } = Typography

type ColumnsStepServiceType = StepServicesInterface

const LIMIT = 8
const PAGE = 1
const STALETIME = 5 * 60 * 1000

const { Text } = Typography

const StepService = () => {
  const queryClient = useQueryClient()
  const [pagination, setPagination] = useState({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })
  const [stepService, setStepService] = useState<StepServicesInterface[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryQuery, setCategoryQuery] = useState('')
  const [openModalCreateOrUpdateStepService, setOpenModalCreateOrUpdateStepService] = useState(false)
  const [stepServiceToEdit, setStepServiceToEdit] = useState<StepServicesInterface | null>(null)
  const { profile } = useContext(AppContext)
  const isAdmin = profile?.role === RoleUser.ADMIN
  const userBranchId = profile?.branch?._id && !isAdmin ? [profile.branch._id] : []
  const [branchFilter, setBranchFilter] = useState<string[]>(userBranchId)

  const columns: TableColumnType<ColumnsStepServiceType & { branch_details?: any[] }>[] = [
    {
      title: 'Tên bước dịch vụ',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string) => <Text>{name}</Text>
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 200,
      render: (category: ServicesCategoryType) => <Text>{category ? category.name : 'Không có'}</Text>
    },
    {
      title: 'Chi nhánh',
      dataIndex: 'branch_details',
      key: 'branch_details',
      width: 200,
      render: (branch_details: any[] = []) =>
        branch_details.length > 0 ? branch_details.map((b) => b.name).join(', ') : 'Không có'
    },
    {
      title: 'Loại hoa hồng',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      align: 'center',
      render: (type: TypeCommision) => <Text>{getTypeCommision(type)}</Text>
    },
    {
      title: 'Hoa hồng',
      dataIndex: 'commision',
      key: 'commision',
      align: 'center',
      width: 200,
      sorter: (a: StepServicesInterface, b: StepServicesInterface) => a.commision - b.commision,
      sortDirections: ['descend', 'ascend'],
      render: (commision: number) => (
        <Text strong style={{ color: '#ff4d4f', fontSize: '15px' }}>
          {commision.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
        </Text>
      )
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      fixed: 'right',
      width: 120,
      render: (_, record: StepServicesInterface) => (
        <Flex style={{ alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Button onClick={() => handleUpdateStepService(record)} title='Sửa' icon={<IoPencil color='blue' />} />
          <Popconfirm
            title={
              <Typography>
                Bạn có chắc chắn muốn <div>xóa bước dịch vụ này không?</div>
              </Typography>
            }
            okText='Có'
            cancelText='Không'
            onConfirm={() => handleDeleteStepService(record._id)}
          >
            <Button title='Xoá' icon={<IoMdTrash color='red' />} />
          </Popconfirm>
        </Flex>
      )
    }
  ]
  const [newColumns, setNewColumns] = useState([])

  const { data, isLoading } = useQuery({
    queryKey: ['stepServices', searchQuery, categoryQuery, branchFilter],
    queryFn: () => {
      const query: any = { search: searchQuery, services_category_id: categoryQuery, branch: branchFilter }
      return servicesApi.getAllStepService(query)
    },
    staleTime: STALETIME
  })

  const goToNextPage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page
    }))
  }

  const handleTableChange = async (page: number) => {
    goToNextPage(page)
  }

  useEffect(() => {
    if (data) {
      setStepService(data.data.result)
    }
  }, [data])

  // Handle update step service
  const handleUpdateStepService = (stepService: StepServicesInterface) => {
    setStepServiceToEdit(stepService)
    setOpenModalCreateOrUpdateStepService(true)
  }

  // Handle delete step service
  const handleDeleteStepService = async (id: string) => {
    try {
      await servicesApi.deleteStepService(id)
      message.success('Xóa bước dịch vụ thành công')
      queryClient.invalidateQueries({ queryKey: ['stepServices'] })
    } catch (error) {
      message.error('Xóa bước dịch vụ thất bại')
      console.error('Error deleting step service:', error)
    }
  }

  // Handler cho thay đổi branch filter
  const handleBranchFilterChange = (value: string[]) => {
    setBranchFilter(value)
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
                <MdOutlineHomeRepairService style={{ marginRight: '12px', color: '#1890ff' }} />
                Quản lý danh sách bước dịch vụ
              </Title>
            </Col>
            <Col>
              <Button
                type='primary'
                icon={<ReloadOutlined />}
                onClick={() => handleRefresh('stepServices')}
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
              onClick={() => setOpenModalCreateOrUpdateStepService(true)}
              type='primary'
              style={{ width: '100%' }}
              icon={<GoPlus size={20} title='Thêm bước dịch vụ' />}
            >
              Thêm bước dịch vụ
            </Button>
          </Col>
          <Col xs={24} sm={12} md={4} lg={4}>
            <DebouncedSearch
              placeholder='Tìm kiếm bước dịch vụ'
              debounceTime={1000}
              onSearch={(value) => setSearchQuery(value)}
            />
          </Col>
          <Col xs={24} sm={12} md={4} lg={4}>
            <OptionsCategoryServices placeholder='Chọn danh mục' search onchange={(value) => setCategoryQuery(value)} />
          </Col>
          <Col xs={24} sm={12} md={4} lg={4}>
            <OptionsBranch
              mode='multiple'
              placeholder='Lọc theo chi nhánh'
              search
              onchange={isAdmin ? handleBranchFilterChange : undefined}
              value={branchFilter}
              disabled={!isAdmin}
            />
          </Col>
          <Col xs={24} sm={12} md={4} lg={4}>
            <HiddenColumns
              STORAGE_KEY='stepService_table_columns'
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
              <span>Danh sách bước dịch vụ</span>
            </div>
          }
          style={{
            borderRadius: '12px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
          }}
          bodyStyle={{ padding: '0' }}
        >
          <Table
            loading={isLoading}
            sticky
            style={{ width: '100%', borderRadius: '12px' }}
            scroll={{ x: '1000px' }}
            columns={newColumns}
            dataSource={stepService}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              onChange: handleTableChange,
              position: ['bottomCenter']
            }}
            rowKey='_id'
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

      <ModalCreateOrUpdateStepService
        open={openModalCreateOrUpdateStepService}
        onClose={() => {
          setOpenModalCreateOrUpdateStepService(false)
          setStepServiceToEdit(null)
        }}
        stepServiceToEdit={stepServiceToEdit}
        setStepServiceToEdit={setStepServiceToEdit}
      />
    </Fragment>
  )
}

export default StepService
