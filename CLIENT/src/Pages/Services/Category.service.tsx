import { useQuery } from '@tanstack/react-query'
import { Button, Col, Flex, Popconfirm, Row, Table, TableColumnType, Typography } from 'antd'
import { Fragment, useEffect, useState } from 'react'
import { IoMdTrash } from 'react-icons/io'
import { IoPencil } from 'react-icons/io5'
import Title from 'src/Components/Title'
import { ServicesCategoryType } from 'src/Interfaces/services/services.interfaces'
import ModalCreateServicesCategory from 'src/Modal/services/ModalCreateServicesCategory'
import { servicesApi } from 'src/Service/services/services.api'
import { PaginationType } from 'src/Types/util.type'
import OptionsBranch from 'src/Components/OptionsBranch'

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
  const [branchFilter, setBranchFilter] = useState<string[]>([])

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

  useEffect(() => {
    if (data) {
      const result = data.data.result.categoryServices
      const total = data.data.result.total
      setCategoryServices(result)
      setPagination({ ...pagination, total })
    }
  }, [data])

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
      width: 130
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

  return (
    <Fragment>
      {/* Title Categories Service */}
      <Row style={{ padding: '20px' }} gutter={[16, 16]}>
        <Col xs={24}>{Title({ title: 'Danh mục dịch vụ', level: 2 })}</Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <Button type='primary' onClick={() => setOpenModal(true)}>
            Thêm danh mục
          </Button>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <OptionsBranch mode='multiple' placeholder='Lọc theo chi nhánh' search onchange={setBranchFilter} />
        </Col>
      </Row>

      {/* Table Categories Service */}
      <Row gutter={16} style={{ padding: '20px' }}>
        <Col span={24}>
          <Table
            bordered
            sticky
            loading={isLoading}
            columns={columnsCategoryServices}
            dataSource={categoryServices}
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
