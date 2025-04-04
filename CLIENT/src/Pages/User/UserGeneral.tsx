import { Avatar, Button, Col, Flex, Row, Switch, Table, TableColumnType } from 'antd'
import Title from 'antd/es/typography/Title'
import { Fragment } from 'react/jsx-runtime'
import { PlusOutlined, UserOutlined } from '@ant-design/icons'
import OptionsBranch from 'src/Components/OptionsBranch'
import DebouncedSearch from 'src/Components/DebouncedSearch'
import { UserGeneralInterface } from 'src/Interfaces/user.interface'
import { useEffect, useState } from 'react'
import userApi from 'src/Service/user/user.api'
import { useQuery } from '@tanstack/react-query'

type ColumsUserGeneralType = UserGeneralInterface

const PAGE = 1
const LIMIT = 10
const STALETIME = 5 * 60 * 1000

const UserGeneral = () => {
  const [usersGeneral, setUsersGeneral] = useState<UserGeneralInterface[]>([])
  const [usersSearch, setUsersSearch] = useState<UserGeneralInterface[]>([])
  const [pagination, setPagination] = useState({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })

  //   Fetch users data
  const { data, isLoading } = useQuery({
    queryKey: ['getUsersGeneral', pagination.page, pagination.limit],
    queryFn: async () => {
      const query = {
        page: pagination.page,
        limit: LIMIT
      }

      const response = await userApi.getUsers(query)
      return response
    },
    staleTime: STALETIME
  })

  useEffect(() => {
    if (data?.data.success) {
      const response = data.data.result
      console.log(response.users)
      setUsersGeneral(response.users)
      setPagination({
        page: response.page || PAGE,
        limit: response.limit,
        total: 0
      })
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

  const columsUserGeneral: TableColumnType<ColumsUserGeneralType>[] = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      render: () => (
        <Flex justify='center'>
          <Avatar size={50} icon={<UserOutlined />} />
        </Flex>
      )
    },
    {
      title: 'Tên nhân viên',
      dataIndex: 'name',
      key: 'name',
      minWidth: 70
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: boolean) => (
        <Flex justify='center'>
          <Switch checked={status} />
        </Flex>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 120
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 120
    },
    {
      title: 'Chi nhánh',
      dataIndex: 'branch',
      key: 'branch',
      width: 120
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 130
    }
  ]

  return (
    <Fragment>
      {/* Title User General */}
      <Row style={{ padding: '20px' }} gutter={[16, 16]}>
        <Col span={24}>
          <Title className='center-div' level={2}>
            Danh Sách Nhân Viên
          </Title>
        </Col>
        <Col span={8} sm={24} md={4}>
          <Button icon={<PlusOutlined />} type='primary'>
            Thêm tài khoản
          </Button>
        </Col>
        <Col span={8} sm={24} md={4}>
          <OptionsBranch mode='multiple' search />
        </Col>
        <Col span={8} sm={24} md={6}>
          <DebouncedSearch
            placeholder='Tìm kiếm tài khoản'
            onSearch={(value) => console.log(value)}
            debounceTime={1000}
          />
        </Col>
      </Row>

      {/* Table User General */}
      <Row gutter={16} style={{ padding: '20px' }}>
        <Col span={24}>
          <Table
            scroll={{ x: 'fit-content' }}
            loading={isLoading}
            dataSource={usersGeneral}
            bordered
            columns={columsUserGeneral}
            pagination={{
              current: 1,
              pageSize: pagination.limit,
              total: 100,
              showSizeChanger: true,
              onShowSizeChange: (_, size) => {
                setPagination((prev) => ({ ...prev, limit: size, page: 1 }))
              },
              onChange: handleTableChange,
              position: ['bottomCenter']
            }}
          />
        </Col>
      </Row>
    </Fragment>
  )
}

export default UserGeneral
