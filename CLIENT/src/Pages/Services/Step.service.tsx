import { Button, Col, Flex, Popconfirm, Row, Table, TableColumnType, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { GoPlus } from 'react-icons/go'
import { IoMdTrash } from 'react-icons/io'
import { IoPencil } from 'react-icons/io5'
import { Fragment } from 'react/jsx-runtime'
import DebouncedSearch from 'src/Components/DebouncedSearch'
import Title from 'src/Components/Title'
import { TypeCommision } from 'src/Constants/enum'
import { GetStepService } from 'src/Interfaces/services/services.interfaces'
import ModalCreateOrUpdateStepService from 'src/Modal/services/ModalCreateOrUpdateStepService'
import { StepServices } from 'src/Utils/options.utils'
import { getTypeCommision } from 'src/Utils/util.utils'
const { Text } = Typography

type ColumnsStepServiceType = GetStepService

const LIMIT = 8
const PAGE = 1
const STALETIME = 5 * 60 * 1000

const StepService = () => {
  const [pagination, setPagination] = useState({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })
  const [stepService, setStepService] = useState<GetStepService[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [openModalCreateOrUpdateStepService, setOpenModalCreateOrUpdateStepService] = useState(false)
  const [stepServiceToEdit, setStepServiceToEdit] = useState<GetStepService | null>(null)

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
    setStepService(StepServices)
  }, [])

  // Handle update step service
  const handleUpdateStepService = (stepService: GetStepService) => {
    setStepServiceToEdit(stepService)
    setOpenModalCreateOrUpdateStepService(true)
  }

  const columns: TableColumnType<ColumnsStepServiceType>[] = [
    {
      title: 'Tên bước dịch vụ',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (name: string) => <Text>{name}</Text>
    },
    {
      title: 'Danh mục',
      dataIndex: 'services_category',
      key: 'services_category',
      width: 250,
      render: (services_category: string) => <Text>{services_category}</Text>
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
      dataIndex: 'commission',
      key: 'commission',
      align: 'center',
      width: 200,
      sorter: (a: GetStepService, b: GetStepService) => a.commission - b.commission,
      sortDirections: ['descend', 'ascend'],
      render: (commission: number) => (
        <Text strong style={{ color: '#ff4d4f', fontSize: '15px' }}>
          {commission.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
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
      render: (_, record: GetStepService) => (
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
      </Row>

      {/* Talbe List Step Service */}
      <Row gutter={16} style={{ padding: '20px' }}>
        <Col span={24}>
          <Table
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
          />
        </Col>
      </Row>
      <ModalCreateOrUpdateStepService
        open={openModalCreateOrUpdateStepService}
        onClose={setOpenModalCreateOrUpdateStepService}
        stepServiceToEdit={stepServiceToEdit as GetStepService | null}
        setStepServiceToEdit={setStepServiceToEdit}
      />
    </Fragment>
  )
}

export default StepService
