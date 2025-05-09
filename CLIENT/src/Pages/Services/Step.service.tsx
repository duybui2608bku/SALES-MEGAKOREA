import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Col, Flex, Popconfirm, Row, Table, TableColumnType, Typography, message } from 'antd'
import { useEffect, useState } from 'react'
import { GoPlus } from 'react-icons/go'
import { IoMdTrash } from 'react-icons/io'
import { IoPencil } from 'react-icons/io5'
import { Fragment } from 'react/jsx-runtime'
import DebouncedSearch from 'src/Components/DebouncedSearch'
import OptionsCategoryServices from 'src/Components/OptionsCategoryServices'
import Title from 'src/Components/Title'
import { TypeCommision } from 'src/Constants/enum'
import { ServicesCategoryType, StepServicesInterface } from 'src/Interfaces/services/services.interfaces'
import ModalCreateOrUpdateStepService from 'src/Modal/services/ModalCreateOrUpdateStepService'
import { servicesApi } from 'src/Service/services/services.api'
import { getTypeCommision } from 'src/Utils/util.utils'
const { Text } = Typography

type ColumnsStepServiceType = StepServicesInterface

const LIMIT = 8
const PAGE = 1
const STALETIME = 5 * 60 * 1000

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

  const { data, isLoading } = useQuery({
    queryKey: ['stepServices', searchQuery, categoryQuery],
    queryFn: () => {
      const query = { search: searchQuery, services_category_id: categoryQuery }
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

  const columns: TableColumnType<ColumnsStepServiceType>[] = [
    {
      title: 'Tên bước dịch vụ',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (name: string) => <Text>{name}</Text>
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 220,
      render: (category: ServicesCategoryType) => <Text>{category ? category.name : 'Không có'}</Text>
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

  return (
    <Fragment>
      {/* Title Step Service */}
      <Row style={{ padding: '20px' }} gutter={[16, 16]}>
        <Col xs={24}>{Title({ title: 'Danh sách bước dịch vụ', level: 2 })}</Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <Button
            onClick={() => setOpenModalCreateOrUpdateStepService(true)}
            type='primary'
            style={{ width: '100%' }}
            icon={<GoPlus size={20} title='Thêm bước dịch vụ' />}
          >
            Thêm bước dịch vụ
          </Button>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <DebouncedSearch
            placeholder='Tìm kiếm bước dịch vụ'
            debounceTime={1000}
            onSearch={(value) => setSearchQuery(value)}
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <OptionsCategoryServices placeholder='Chọn danh mục' search onchange={(value) => setCategoryQuery(value)} />
        </Col>
      </Row>

      {/* Talbe List Step Service */}
      <Row gutter={16} style={{ padding: '20px' }}>
        <Col span={24}>
          <Table
            loading={isLoading}
            sticky
            style={{ width: '100%' }}
            bordered
            scroll={{ x: '1000px' }}
            columns={columns}
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
        </Col>
      </Row>
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
