import { Button, Col, Flex, message, Popconfirm, Row, Switch, Table, TableColumnType, Typography } from 'antd'
import Title from 'antd/es/typography/Title'
import { Fragment } from 'react/jsx-runtime'
import { PlusOutlined, StopOutlined } from '@ant-design/icons'
import OptionsBranch from 'src/Components/OptionsBranch'
import DebouncedSearch from 'src/Components/DebouncedSearch'
import { UserGeneralInterface } from 'src/Interfaces/user.interface'
import { useEffect, useState } from 'react'
import userApi from 'src/Service/user/user.api'
import { useMutation, useQuery } from '@tanstack/react-query'
import { RoleUser, UserStatus } from 'src/Constants/enum'
import { getRoleUser } from 'src/Utils/util.utils'
import { queryClient } from 'src/main'
import InforUserComponent from './Components/InforUserComponent'
import { IoPencil } from 'react-icons/io5'
import { IoMdTrash } from 'react-icons/io'
import { optionsBranch } from 'src/Constants/option'
import ModalCreateOrUpdateUser from 'src/Modal/ModalCreateOrUpdateUser'
const { Paragraph } = Typography

type ColumsUserGeneralType = UserGeneralInterface

const PAGE = 1
const LIMIT = 10
const STALETIME = 5 * 60 * 1000

const UserGeneral = () => {
  const [openModalCreateOrUpdateUser, setOpenModalCreateOrUpdateUser] = useState(false)
  const [userToEdit, setUserToEdit] = useState<UserGeneralInterface | null>(null)
  const [loadingStatus, setLoadingStatus] = useState('')
  const [usersGeneral, setUsersGeneral] = useState<UserGeneralInterface[]>([])
  const [pagination, setPagination] = useState({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [usersSearch, setUsersSearch] = useState<UserGeneralInterface[]>([])
  const [filterBranch, setFilterBranch] = useState<string[]>([])

  //   Fetch users data
  const { data, isLoading } = useQuery({
    queryKey: ['getUsersGeneral', filterBranch, pagination.page, pagination.limit],
    queryFn: async () => {
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

      const response = await userApi.getUsers(query)
      return response
    },
    staleTime: STALETIME
  })

  // Fetch users data with search
  const { data: searchUsers, isLoading: isLoadingSearch } = useQuery({
    queryKey: ['searchUser', searchQuery, filterBranch],
    queryFn: async () => {
      const query = {
        result: searchQuery,
        branch: encodeURI(filterBranch.join(',')) || ''
      }
      const response = await userApi.searchUser(query)
      return response
    },
    staleTime: STALETIME
  })

  // Delete user
  const { mutate: deleteUser, isPending } = useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      message.success('Xoá nhân viên thành công!')
      queryClient.invalidateQueries({ queryKey: ['getUsersGeneral'] })
    },
    onError: (error: Error) => {
      message.error(`Lỗi khi xoá nhân viên: ${error.message}`)
    }
  })

  useEffect(() => {
    if (data?.data) {
      const response = data.data as unknown as UserGeneralInterface[]
      setUsersGeneral(response)
      setPagination({
        page: 1,
        limit: 10,
        total: 1
      })
    }
  }, [data])

  useEffect(() => {
    if (searchUsers?.data) {
      const users = searchUsers.data as unknown as UserGeneralInterface[]
      setUsersSearch(users)
    }
  }, [searchUsers])

  const goToNextPage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page
    }))
  }

  const handleTableChange = async (page: number) => {
    goToNextPage(page)
  }

  const handleFilterBranch = (branch: string[]) => {
    console.log('branch: ', branch)
    setFilterBranch(branch)
  }

  const handleSearch = (value: string) => {
    console.log('value: ', value)
    setSearchQuery(value)
  }

  const handleDeleteUser = (id: string) => {
    deleteUser(id)
  }

  // Hande change status
  const handleUpdateStatusUser = async (id: string, status: number) => {
    try {
      setLoadingStatus(id)
      const response = await userApi.updateUser({
        id: id,
        status: status == UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE,
        updated_at: new Date()
      })

      console.log(response.data)

      if (response.data) {
        setLoadingStatus('')
        message.success('Cập nhật trạng thái nhân viên thành công!')
        queryClient.invalidateQueries({ queryKey: ['getUsersGeneral'] })
      }
    } catch (error) {
      setLoadingStatus('')
      message.error('Lỗi khi cập nhật trạng thái nhân viên')
    }
  }

  const columsUserGeneral: TableColumnType<ColumsUserGeneralType>[] = [
    {
      title: 'Thông tin nhân viên',
      key: 'avatar-name',
      align: 'center',
      render: (_: unknown, record: UserGeneralInterface) => (
        <Flex justify='center'>
          <InforUserComponent avatar={record.avatar} name={record.name} />
        </Flex>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status: number, record: UserGeneralInterface) => (
        <Flex justify='center'>
          <Switch
            onChange={() => handleUpdateStatusUser(record.id, status)}
            loading={loadingStatus === record.id}
            checked={status == UserStatus.ACTIVE ? true : false}
          />
        </Flex>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      align: 'center'
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      align: 'center',
      render: (role: RoleUser) => {
        return (
          <Flex justify='center'>
            <Typography>{getRoleUser(role)}</Typography>
          </Flex>
        )
      }
    },
    {
      title: 'Chi nhánh',
      dataIndex: 'branch',
      key: 'branch',
      align: 'center',
      render: (branch: string[]) => (
        <Paragraph
          ellipsis={{
            rows: 1,
            expandable: true
          }}
        >
          {branch.length === optionsBranch.length ? 'Toàn bộ' : branch.map((b) => b).join(', ')}
        </Paragraph>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center'
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      render: (_: unknown, record: UserGeneralInterface) => (
        <Flex gap={10}>
          <Button title='Sửa' icon={<IoPencil color='blue' />} />
          <Popconfirm
            okButtonProps={{ loading: isPending }}
            title={
              <Typography>
                Bạn có chắc chắn muốn <div>xoá nhân viên này không?</div>
              </Typography>
            }
            onConfirm={() => handleDeleteUser(record.id)}
            okText='Có'
            cancelText='Không'
          >
            <Button title='Xóa' icon={<IoMdTrash color='red' />} />
          </Popconfirm>
          <Button title='Cấm' icon={<StopOutlined color='black' />} />
        </Flex>
      )
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
          <Button onClick={() => setOpenModalCreateOrUpdateUser(true)} icon={<PlusOutlined />} type='primary'>
            Thêm tài khoản
          </Button>
        </Col>
        <Col span={8} sm={24} md={4}>
          <OptionsBranch mode='multiple' search onchange={handleFilterBranch} />
        </Col>
        <Col span={8} sm={24} md={6}>
          <DebouncedSearch
            placeholder='Tìm kiếm nhân viên'
            onSearch={(value) => handleSearch(value)}
            debounceTime={1000}
          />
        </Col>
      </Row>

      {/* Table User General */}
      <Row gutter={16} style={{ padding: '20px' }}>
        <Col span={24}>
          <Table
            scroll={{ x: 'fit-content' }}
            loading={isLoading || isLoadingSearch}
            dataSource={searchQuery.length > 0 ? usersSearch : usersGeneral}
            bordered
            columns={columsUserGeneral}
            pagination={{
              current: 1,
              pageSize: pagination.limit,
              total: 10,
              showSizeChanger: true,
              onChange: handleTableChange,
              position: ['bottomCenter']
            }}
          />
        </Col>
      </Row>
      <ModalCreateOrUpdateUser
        open={openModalCreateOrUpdateUser}
        close={setOpenModalCreateOrUpdateUser}
        userToEdit={userToEdit as UserGeneralInterface | null}
        setUserToEdit={setUserToEdit}
      />
    </Fragment>
  )
}

export default UserGeneral
