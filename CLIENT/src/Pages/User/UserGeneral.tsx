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
import { UserGeneralInterface } from 'src/Interfaces/user/user.interface'
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
import { omit } from 'lodash'
// const { Paragraph } = Typography

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
  // const [usersSearch, setUsersSearch] = useState<UserGeneralInterface[]>([])
  const [pagination, setPagination] = useState({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })
  // const [searchQuery, setSearchQuery] = useState('')
  const [filterBranch, setFilterBranch] = useState<string>('')

  //   Fetch users data (Gọi từ API phía SERVER)
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
              limit: pagination.limit
            }

      const response = await userApi.getUsers(query)
      return response
    },
    staleTime: STALETIME
  })

  // Fetch users data with search
  // const { data: searchUsers, isLoading: isLoadingSearch } = useQuery({
  //   queryKey: ['searchUser', searchQuery, filterBranch],
  //   queryFn: async () => {
  //     const query = {
  //       result: searchQuery
  //     }
  //     const response = await userApi.searchUser(query)
  //     return response
  //   },
  //   staleTime: STALETIME,
  //   enabled: !!searchQuery
  // })

  // Delete user
  const { mutate: deleteUser, isPending } = useMutation({
    mutationFn: userApi.deleteUserById,
    onSuccess: () => {
      message.success('Xoá nhân viên thành công!')
      queryClient.invalidateQueries({ queryKey: ['getUsersGeneral'] })
    },
    onError: (error: Error) => {
      message.error(`Lỗi khi xoá nhân viên: ${error.message}`)
    }
  })

  useEffect(() => {
    if (data?.data.result) {
      const response = data.data.result as unknown as UserGeneralInterface[]

      setUsersGeneral(response)
      setPagination({
        page: 1,
        limit: 10,
        total: 100
      })
    }
  }, [data?.data.result])

  // useEffect(() => {
  //   if (searchUsers?.data) {
  //     const users = searchUsers.data as unknown as UserGeneralInterface[]
  //     setUsersSearch(users)
  //   }
  // }, [searchUsers])

  // const goToNextPage = (page: number) => {
  //   setPagination((prev) => ({
  //     ...prev,
  //     page
  //   }))
  // }

  // const handleTableChange = async (page: number) => {
  //   goToNextPage(page)
  // }

  const handleFilterBranch = (branch: string) => {
    console.log('branch: ', branch)
    setFilterBranch(branch)
  }

  // const handleSearch = (value: string) => {
  //   console.log('value: ', value)
  //   setSearchQuery(value)
  // }

  const handleDeleteUser = (id: string) => {
    deleteUser(id)
  }

  // Handle change status
  const handleUpdateStatusUser = async (user: UserGeneralInterface) => {
    try {
      setLoadingStatus(user._id)
      // Loại bỏ trường 'update_at" ra khỏi Object user
      const userData = omit(user, ['updated_at'])

      const response = await userApi.updateUser({
        ...userData,
        status: user.status == UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE
      })

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
  const handleBannedUser = async (user: UserGeneralInterface, func: FuncBanned) => {
    try {
      setLoadingBanned(user._id)
      // Loại bỏ trường 'update_at" ra khỏi Object user
      const userData = omit(user, ['updated_at'])
      const status = func == FuncBanned.BANNED ? UserStatus.BANNED : UserStatus.INACTIVE
      const response = await userApi.updateUser({
        ...userData,
        status: status
      })

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
    setUserToEdit(user)
    setOpenModalCreateOrUpdateUser(true)
  }

  const columsUserGeneral: TableColumnType<ColumsUserGeneralType>[] = [
    {
      title: 'Thông tin nhân viên',
      key: 'avatar-name',
      width: 280,
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
            onChange={() => handleUpdateStatusUser(record)}
            loading={loadingStatus === record._id}
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
          <Flex justify='center' style={{ margin: '0', padding: '0' }}>
            <TagRoleUserComponent roleUser={role} />
          </Flex>
        )
      }
    },
    // {
    //   title: 'Chi nhánh',
    //   dataIndex: 'branch',
    //   key: 'branch',
    //   align: 'center',
    //   width: 150,
    //   render: (branch: string) => {
    //     if (!branch) return <Paragraph>Không có</Paragraph>
    //     return (
    //       <Paragraph
    //         ellipsis={{
    //           rows: 1,
    //           expandable: true
    //         }}
    //       >
    //         {branch}
    //       </Paragraph>
    //     )
    //   }
    // },
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
              okButtonProps={{ loading: loadingBanned == record._id }}
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
              onConfirm={() => handleBannedUser(record, FuncBanned.UNBANNED)}
              okText='Có'
              cancelText='Không'
            >
              <Button
                disabled={loadingBanned == record._id}
                title='Mở'
                icon={<CheckCircleOutlined style={{ color: 'green' }} />}
              />
            </Popconfirm>
          ) : (
            <Popconfirm
              okButtonProps={{ loading: loadingBanned == record._id }}
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
              onConfirm={() => handleBannedUser(record, FuncBanned.BANNED)}
              okText='Có'
              cancelText='Không'
            >
              <Button disabled={loadingBanned == record._id} title='Cấm' icon={<StopOutlined color='black' />} />
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
            onConfirm={() => handleDeleteUser(record._id)}
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
            onSearch={(value) => console.log(value)}
            debounceTime={1000}
          />
        </Col>
      </Row>

      {/* Table User General */}
      <Row gutter={16} style={{ padding: '20px' }}>
        <Col span={24}>
          <Table
            scroll={{ x: '1000px' }}
            loading={isLoading}
            dataSource={usersGeneral}
            bordered
            columns={columsUserGeneral}
            pagination={{
              current: 1,
              pageSize: 10,
              total: 100,
              showSizeChanger: true,
              // onChange: handleTableChange,
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
