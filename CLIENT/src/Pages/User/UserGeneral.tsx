import {
  Button,
  Col,
  Flex,
  message,
  Popconfirm,
  Row,
  Switch,
  Table,
  TableColumnType,
  Typography,
  Tag,
  Select
} from 'antd'
import Title from 'antd/es/typography/Title'
import { Fragment } from 'react/jsx-runtime'
import { CheckCircleOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons'
// import OptionsBranch from 'src/Components/OptionsBranch'
import DebouncedSearch from 'src/Components/DebouncedSearch'
import { UserGeneralInterface } from 'src/Interfaces/user.interface'
import { useEffect, useState } from 'react'
import userApi from 'src/Service/user/user.api'
import { useMutation, useQuery } from '@tanstack/react-query'
import { RoleUser, UserStatus } from 'src/Constants/enum'
import { queryClient } from 'src/main'
import InforUserComponent from './Components/InforUserComponent'
import { IoPencil } from 'react-icons/io5'
import { IoMdTrash } from 'react-icons/io'
import ModalCreateOrUpdateUser from 'src/Modal/users/ModalCreateOrUpdateUser'
import TagRoleUserComponent from './Components/tagRoleUserComponent'
const { Paragraph } = Typography

type ColumsUserGeneralType = UserGeneralInterface

const PAGE = 1
const LIMIT = 10
const STALETIME = 5 * 60 * 1000

export enum FuncBanned {
  BANNED = 1,
  UNBANNED = 2
}

const UserGeneral = () => {
  const [openModalCreateOrUpdateUser, setOpenModalCreateOrUpdateUser] = useState(false)
  const [userToEdit, setUserToEdit] = useState<UserGeneralInterface | null>(null)
  const [loadingStatus, setLoadingStatus] = useState('')
  const [loadingBanned, setLoadingBanned] = useState('')
  const [usersGeneral, setUsersGeneral] = useState<UserGeneralInterface[]>([])
  const [usersSearch, setUsersSearch] = useState<UserGeneralInterface[]>([])
  const [pagination, setPagination] = useState({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBranch, setFilterBranch] = useState<string>('')

  //   Fetch users data
  const { data, isLoading } = useQuery({
    queryKey: ['getUsersGeneral', filterBranch, pagination.page, pagination.limit],
    queryFn: async () => {
      const query =
        filterBranch.length > 0 && filterBranch != 'all'
          ? {
              page: pagination.page,
              limit: LIMIT,
              branch: filterBranch
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
        result: searchQuery
      }
      const response = await userApi.searchUser(query)
      return response
    },
    staleTime: STALETIME,
    enabled: !!searchQuery
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

  const handleFilterBranch = (branch: string) => {
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

  // Handle change status
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

  // Handle change status (BANNED)
  const handleBannedUser = async (id: string, func: FuncBanned) => {
    try {
      setLoadingBanned(id)
      const status = func == FuncBanned.BANNED ? UserStatus.BANNED : UserStatus.ACTIVE
      const response = await userApi.updateUser({
        id: id,
        status: status,
        updated_at: new Date()
      })

      console.log(response.data)

      if (response.data) {
        setLoadingBanned('')
        if (func == FuncBanned.BANNED) {
          message.success('Cập nhật trạng thái (BANNED) nhân viên thành công!')
        } else {
          message.success('Cập nhật trạng thái (UNBANNED) nhân viên thành công!')
        }
        queryClient.invalidateQueries({ queryKey: ['getUsersGeneral'] })
      }
    } catch (error) {
      setLoadingBanned('')
      message.error('Lỗi khi cập nhật trạng thái (BANNED) nhân viên')
    }
  }

  // Handle update user
  const handleUpdateUser = (user: UserGeneralInterface) => {
    console.log('user: ', user)
    setUserToEdit(user)
    setOpenModalCreateOrUpdateUser(true)
  }

  const columsUserGeneral: TableColumnType<ColumsUserGeneralType>[] = [
    {
      title: 'Thông tin nhân viên',
      key: 'avatar-name',
      render: (_: unknown, record: UserGeneralInterface) => (
        <Flex align='center'>
          <InforUserComponent avatar={record.avatar} name={record.name} status={record.status} />
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
            disabled={record.status == UserStatus.BANNED}
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
            <TagRoleUserComponent roleUser={role} />
          </Flex>
        )
      }
    },
    {
      title: 'Chi nhánh',
      dataIndex: 'branch',
      key: 'branch',
      align: 'center',
      width: 150,
      render: (branch: string) => {
        if (!branch) return <Paragraph>Không có</Paragraph>
        return (
          <Paragraph
            ellipsis={{
              rows: 1,
              expandable: true
            }}
          >
            {branch}
          </Paragraph>
        )
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      render: (created_at: string) => new Date(created_at).toLocaleDateString('vi-VN')
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      render: (_: unknown, record: UserGeneralInterface) => (
        <Flex gap={10}>
          {/* Button update */}
          <Button
            disabled={record.status === UserStatus.BANNED}
            onClick={() => handleUpdateUser(record)}
            title='Sửa'
            icon={<IoPencil color='blue' />}
          />

          {/* Button ban */}
          {record.status === UserStatus.BANNED ? (
            <Popconfirm
              okButtonProps={{ loading: loadingBanned == record.id }}
              title={
                <Typography>
                  Bạn có chắc chắn muốn mở khoá
                  <div>
                    <Tag bordered={false} color='error'>
                      {record.name}
                    </Tag>
                    không?
                  </div>
                </Typography>
              }
              onConfirm={() => handleBannedUser(record.id, FuncBanned.UNBANNED)}
              okText='Có'
              cancelText='Không'
            >
              <Button
                disabled={loadingBanned == record.id}
                title='Mở'
                icon={<CheckCircleOutlined style={{ color: 'green' }} />}
              />
            </Popconfirm>
          ) : (
            <Popconfirm
              okButtonProps={{ loading: loadingBanned == record.id }}
              title={
                <Typography>
                  Bạn có chắc chắn muốn khoá{' '}
                  <div>
                    <Tag bordered={false} color='error'>
                      {record.name}
                    </Tag>
                    không?
                  </div>
                </Typography>
              }
              onConfirm={() => handleBannedUser(record.id, FuncBanned.BANNED)}
              okText='Có'
              cancelText='Không'
            >
              <Button disabled={loadingBanned == record.id} title='Cấm' icon={<StopOutlined color='black' />} />
            </Popconfirm>
          )}

          {/* Button delete */}
          <Popconfirm
            okButtonProps={{ loading: isPending }}
            title={
              <Typography>
                Bạn có chắc chắn muốn xoá
                <div>
                  {' '}
                  <Tag bordered={false} color='red'>
                    {record.name}
                  </Tag>
                  không?
                </div>
              </Typography>
            }
            onConfirm={() => handleDeleteUser(record.id)}
            okText='Có'
            cancelText='Không'
          >
            <Button disabled={record.status === UserStatus.BANNED} title='Xóa' icon={<IoMdTrash color='red' />} />
          </Popconfirm>
        </Flex>
      )
    }
  ]

  return (
    <Fragment>
      {/* Title User General */}
      <Row style={{ padding: '20px' }} gutter={[16, 16]}>
        <Col xs={24}>
          <Title style={{ textAlign: 'center' }} className='center-div' level={2}>
            Danh Sách Nhân Viên
          </Title>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <Button block onClick={() => setOpenModalCreateOrUpdateUser(true)} icon={<PlusOutlined />} type='primary'>
            Thêm tài khoản
          </Button>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          {/* <OptionsBranch mode='multiple' search onchange={handleFilterBranch} /> */}
          <Select
            style={{ width: '100%' }}
            showSearch
            onChange={handleFilterBranch}
            placeholder='Chọn chi nhánh'
            defaultValue={'all'}
            options={[
              { value: 'all', label: 'Tất cả' },
              { value: 'Quảng Bình', label: 'Quảng Bình' },
              { value: 'Huế', label: 'Huế' },
              { value: 'Quảng Trị', label: 'Quảng Trị' },
              { value: 'Buôn Ma Thuột', label: 'Buôn Ma Thuột' },
              { value: 'Cà Mau', label: 'Cà Mau' },
              { value: 'Phan Thiết', label: 'Phan Thiết' },
              { value: 'Nha Trang', label: 'Nha Trang' },
              { value: 'Medicare NT', label: 'Medicare NT' },
              { value: 'Đà Nẵng', label: 'Đà Nẵng' }
            ]}
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
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
            scroll={{ x: '1000px' }}
            loading={isLoading || isLoadingSearch}
            dataSource={searchQuery.length != 0 ? usersSearch : usersGeneral}
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
