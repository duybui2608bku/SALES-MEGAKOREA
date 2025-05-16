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
  Card
} from 'antd'
// import Title from 'antd/es/typography/Title'
import { Fragment } from 'react/jsx-runtime'
import {
  CalendarOutlined,
  CheckCircleOutlined,
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
  StopOutlined
} from '@ant-design/icons'
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
import { BranchType } from 'src/Interfaces/branch/branch.interface'
import OptionsBranch from 'src/Components/OptionsBranch'
const { Paragraph, Title } = Typography
import { FaUserGroup } from 'react-icons/fa6'
import dayjs from 'dayjs'

type ColumsUserGeneralType = UserGeneralInterface

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

  //   Fetch users data (Gọi từ API phía SERVER)
  const { data, isLoading } = useQuery({
    queryKey: ['getUsersGeneral'],
    queryFn: async () => {
      const response = await userApi.getUsers()
      return response
    },
    staleTime: STALETIME
  })

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
    if (data) {
      const response = data.data.result as unknown as UserGeneralInterface[]

      setUsersGeneral(response)
    }
  }, [data])

  const handleDeleteUser = (id: string) => {
    deleteUser(id)
  }

  // Handle change status
  const handleUpdateStatusUser = async (user: UserGeneralInterface) => {
    try {
      setLoadingStatus(user._id)
      const valueUpdate = {
        _id: user._id,
        status: user.status == UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE
      }

      const response = await userApi.updateUser(valueUpdate)

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
        status: status,
        branch: user.branch._id
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

  const handleRefresh = () => {
    message.loading('Đang tải lại dữ liệu...')
    queryClient.invalidateQueries({ queryKey: ['getUsersGeneral'] })
    setTimeout(() => {
      message.success('Dữ liệu đã được làm mới!')
    }, 3000)
  }

  const columsUserGeneral: TableColumnType<ColumsUserGeneralType>[] = [
    {
      title: 'Thông tin nhân viên',
      key: 'avatar-name',
      width: 270,
      fixed: 'left',
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
      width: 120,
      render: (status: number, record: UserGeneralInterface) => (
        <Flex justify='center'>
          <Switch
            disabled={record.status == UserStatus.BANNED}
            onChange={() => handleUpdateStatusUser(record)}
            loading={loadingStatus === record._id}
            checked={status === UserStatus.ACTIVE}
          />
        </Flex>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      align: 'center',
      width: 230
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      align: 'center',
      width: 150,
      render: (role: RoleUser) => {
        return (
          <Flex justify='center' style={{ margin: '0', padding: '0' }}>
            <TagRoleUserComponent roleUser={role} />
          </Flex>
        )
      }
    },
    {
      title: 'Hệ số lương',
      dataIndex: 'coefficient',
      key: 'coefficient',
      align: 'center',
      width: 140
    },
    {
      title: 'Chi nhánh',
      dataIndex: 'branch',
      key: 'branch',
      align: 'center',
      width: 150,
      render: (branch: BranchType) => {
        if (!branch) return <Paragraph>Không có</Paragraph>
        return (
          <Paragraph
            ellipsis={{
              rows: 1,
              expandable: true
            }}
          >
            {branch.name}
          </Paragraph>
        )
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      width: 180,
      render: (created_at: Date) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarOutlined style={{ color: '#8c8c8c', marginRight: '4px' }} />
            <span>{dayjs(created_at).format('DD/MM/YYYY')}</span>
            <div style={{ marginLeft: '16px', color: '#8c8c8c', fontSize: '12px' }}>
              {dayjs(created_at).format('HH:mm')}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      width: 150,
      fixed: 'right',
      render: (_: unknown, record: UserGeneralInterface) => (
        <Flex gap={10} justify='center'>
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
                <FaUserGroup style={{ marginRight: '12px', color: '#1890ff' }} />
                Quản lý nhân viên
              </Title>
            </Col>
            <Col>
              <Button
                type='primary'
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
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
            <Button block onClick={() => setOpenModalCreateOrUpdateUser(true)} icon={<PlusOutlined />} type='primary'>
              Thêm tài khoản
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <OptionsBranch />
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <DebouncedSearch
              placeholder='Tìm kiếm nhân viên'
              onSearch={(value) => console.log(value)}
              debounceTime={1000}
            />
          </Col>
        </Row>

        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FilterOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              <span>Danh sách nhân viên</span>
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
            sticky
            style={{ width: '100%', borderRadius: '12px' }}
            scroll={{ x: '1300px' }}
            loading={isLoading}
            dataSource={usersGeneral}
            columns={columsUserGeneral}
            pagination={false}
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
