import { useQuery } from '@tanstack/react-query'
import { Button, Card, Col, Flex, Popconfirm, Row, Table, TableColumnType, Typography } from 'antd'
import { Fragment, useContext, useEffect, useState } from 'react'
import { IoMdTrash } from 'react-icons/io'
import { IoPencil } from 'react-icons/io5'
import { ServicesCategoryType } from 'src/Interfaces/services/services.interfaces'
import ModalCreateServicesCategory from 'src/Modal/services/ModalCreateServicesCategory'
import { servicesApi } from 'src/Service/services/services.api'
import { PaginationType } from 'src/Types/util.type'
import OptionsBranch from 'src/Components/OptionsBranch'
import { AppContext } from 'src/Context/AppContext'
import { RoleUser } from 'src/Constants/enum'
import { handleRefresh } from 'src/Utils/util.utils'
import { MdCategory } from 'react-icons/md'
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons'
import HiddenColumns from 'src/Components/HiddenColumns'
const { Title } = Typography

const LIMIT = 9
const PAGE = 1
const STALETIME = 5 * 60 * 1000

interface ColumnsCategoryServicesType {
  _id: string
  name: string
  descriptions: string
}

const CategoryService = () => {
  const [categoryServices, setCategoryServices] = useState<ServicesCategoryType[]>([])
  const [categoryServicesToEdit, setCategoryServicesToEdit] = useState<ServicesCategoryType | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [pagination, setPagination] = useState<PaginationType>({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })
  const { profile } = useContext(AppContext)
  const isAdmin = profile?.role === RoleUser.ADMIN
  const userBranchId = profile?.branch?._id && !isAdmin ? [profile.branch._id] : []
  const [branchFilter, setBranchFilter] = useState<string[]>(userBranchId)

  const columnsCategoryServices: TableColumnType<ColumnsCategoryServicesType & { branch_details?: any[] }>[] = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Mô tả',
      dataIndex: 'descriptions',
      key: ' descriptions',
      render: (text: string) => <Typography.Text ellipsis={{ tooltip: true }}>{text}</Typography.Text>
    },
    {
      title: 'Chi nhánh',
      dataIndex: 'branch_details',
      key: 'branch_details',
      render: (branch_details: any[] = []) =>
        branch_details.length > 0 ? branch_details.map((b) => b.name).join(', ') : 'Không có'
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      render: (_: unknown, record: ServicesCategoryType & { branch_details?: any[] }) => (
        <Flex gap={10} justify='center'>
          <Button
            onClick={() => {
              setCategoryServicesToEdit(record)
              setOpenModal(true)
            }}
            title='Sửa'
            icon={<IoPencil color='blue' />}
          />
          <Popconfirm
            title={
              <Typography>
                Bạn có chắc chắn muốn <div>xóa sản danh mục này không?</div>
              </Typography>
            }
            okText='Có'
            cancelText='Không'
          >
            <Button title='Xóa' icon={<IoMdTrash color='red' />} />
          </Popconfirm>
        </Flex>
      ),
      width: 150
    }
  ]
  const [newColumns, setNewColumns] = useState([])

  const { data, isLoading } = useQuery({
    queryKey: ['getAllServicesCategory', pagination.page, branchFilter],
    queryFn: () =>
      servicesApi.getAllServicesCategory({
        limit: pagination.limit,
        page: pagination.page,
        branch: branchFilter
      }),
    staleTime: STALETIME
  })

  console.log('branchFilter: ', branchFilter)

  useEffect(() => {
    if (data) {
      const result = data.data.result.categoryServices
      const total = data.data.result.total
      setCategoryServices(result)
      setPagination({ ...pagination, total })
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

  const handleBranchFilterChange = (value: string[]) => {
    console.log('valueHangleBranchFilter: ', value)

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
          styles={{
            body: {
              padding: '20px 24px'
            }
          }}
        >
          <Row align='middle' justify='space-between'>
            <Col>
              <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                <MdCategory style={{ marginRight: '12px', color: '#1890ff' }} />
                Quản lý danh sách danh mục dịch vụ
              </Title>
            </Col>
            <Col>
              <Button
                type='primary'
                icon={<ReloadOutlined />}
                onClick={() => handleRefresh('getAllServicesCategory')}
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
            <Button style={{ width: '100%' }} type='primary' onClick={() => setOpenModal(true)}>
              Thêm danh mục
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <OptionsBranch
              mode='multiple'
              placeholder='Lọc theo chi nhánh'
              search
              value={branchFilter}
              onchange={isAdmin ? handleBranchFilterChange : undefined}
              disabled={!isAdmin}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <HiddenColumns
              STORAGE_KEY='categoryService_table_columns'
              tableColumns={columnsCategoryServices}
              style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifySelf: 'flex-end' }}
              onNewColums={(value) => setNewColumns(value)}
            />
          </Col>
        </Row>

        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FilterOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              <span>Danh sách danh mục</span>
            </div>
          }
          style={{
            borderRadius: '12px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
          }}
          styles={{
            body: {
              padding: '0'
            }
          }}
        >
          <Table
            style={{ width: '100%', borderRadius: '12px' }}
            rowKey='_id'
            sticky
            loading={isLoading}
            columns={newColumns}
            dataSource={categoryServices}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              onChange: handleTableChange,
              position: ['bottomCenter']
            }}
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

      <ModalCreateServicesCategory
        visible={openModal}
        onClose={() => {
          setCategoryServicesToEdit(null)
          setOpenModal(false)
        }}
        category={categoryServicesToEdit || null}
        setCategoryServices={setCategoryServicesToEdit}
      />
    </Fragment>
  )
}

export default CategoryService
