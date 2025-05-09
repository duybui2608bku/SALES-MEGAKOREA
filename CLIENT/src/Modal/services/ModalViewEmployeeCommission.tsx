import { Modal, Card, Descriptions, Tag, Typography, Space } from 'antd'
import { TypeCommision } from 'src/Constants/enum'
import { ServicesOfCardType } from 'src/Interfaces/services/services.interfaces'
import { User } from 'src/Interfaces/user/user.interface'
import { getRoleUser } from 'src/Utils/util.utils'

const { Title, Text } = Typography

interface ModalViewEmployeeCommisionProps {
  open: boolean
  onCancel: () => void
  data: ServicesOfCardType
}

const ModalViewEmployeeCommision = (props: ModalViewEmployeeCommisionProps) => {
  const { open, onCancel, data } = props
  if (!data) return null

  // Nhóm tất cả nhân viên (sale từ employee và nhân viên từ step_services) theo id_employee
  const groupedEmployees = data.employee.reduce(
    (acc, sale) => {
      const employeeId = sale.employee_details._id
      if (!acc[employeeId]) {
        acc[employeeId] = {
          employee_details: sale.employee_details,
          commisions: []
        }
      }
      acc[employeeId].commisions.push({
        type: 'Sale',
        price: sale.commision,
        type_price: sale.type_price,
        descriptions: 'Hoa hồng bán hàng'
      })
      return acc
    },
    {} as Record<
      string,
      {
        employee_details: User
        commisions: { type: string; price: number; type_price: number; rate?: number; descriptions: string }[]
      }
    >
  )

  // Thêm nhân viên từ step_services vào nhóm, tránh trùng lặp
  const processedStepServices = new Set<string>() // Dùng Set để theo dõi các step_services đã xử lý
  data.services_of_card.forEach((service) => {
    service.service_details.step_services.forEach((step) => {
      const employeeId = step.id_employee
      const stepKey = `${step.id_employee}-${step.descriptions}-${step.commision}` // Tạo key duy nhất cho step

      if (!processedStepServices.has(stepKey)) {
        if (!groupedEmployees[employeeId]) {
          groupedEmployees[employeeId] = {
            employee_details: step.employee_details,
            commisions: []
          }
        }
        groupedEmployees[employeeId].commisions.push({
          type: 'Step Service',
          price: step.commision,
          type_price: step.type_step_price,
          rate: step.commision,
          descriptions: step.descriptions || 'Hoa hồng bước dịch vụ'
        })
        processedStepServices.add(stepKey) // Đánh dấu step này đã được xử lý
      }
    })
  })

  return (
    <Modal
      title={
        <Title className='text-center' level={4}>
          Thông tin hoa hồng của nhân viên
        </Title>
      }
      open={open}
      onCancel={onCancel}
      onOk={onCancel}
      width={1000}
      footer={null}
      centered
    >
      <Space direction='vertical' style={{ width: '100%', maxHeight: '80vh', overflowY: 'auto' }} size='large'>
        {Object.entries(groupedEmployees).map(([_, { employee_details, commisions }], index) => {
          // Tính tổng hoa hồng cho nhân viên này
          const totalCommision = commisions.reduce((sum, commision) => sum + commision.price, 0)

          return (
            <Card key={index} title={`Nhân viên: ${employee_details.name}`} style={{ marginBottom: 16 }}>
              <Space direction='vertical' style={{ width: '100%' }}>
                {/* Thông tin nhân viên */}
                <Descriptions column={2} bordered size='small'>
                  <Descriptions.Item label='Tên'>{employee_details.name}</Descriptions.Item>
                  <Descriptions.Item label='Vai trò'>
                    <Tag color='green'>{getRoleUser(employee_details.role)}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label='Số chi nhánh'>{employee_details.branch.length}</Descriptions.Item>
                  <Descriptions.Item label='Ngày tạo'>
                    {new Date(employee_details.created_at).toLocaleDateString()}
                  </Descriptions.Item>
                </Descriptions>

                {/* Danh sách hoa hồng */}
                <Card size='small' title='Chi tiết hoa hồng' style={{ marginTop: 16 }}>
                  {commisions.map((commision, commisionIndex) => (
                    <Card
                      key={commisionIndex}
                      hoverable={false}
                      style={{
                        width: '100%',
                        padding: 12,
                        marginBottom: 8,
                        boxShadow: 'none'
                      }}
                    >
                      <Descriptions column={2} size='small'>
                        <Descriptions.Item label='Loại'>
                          {commision.type === 'Sale' ? 'Hoa hồng bán hàng' : 'Bước dịch vụ'}
                        </Descriptions.Item>
                        <Descriptions.Item label='Mô tả'>{commision.descriptions}</Descriptions.Item>
                        <Descriptions.Item label='Hoa hồng'>
                          <Text type='success'>{commision?.price?.toLocaleString() || 0} VNĐ</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label='Loại giá'>
                          <Tag
                            color={
                              commision.type_price === TypeCommision.FIXED || commision.type_price === 2
                                ? 'blue'
                                : 'purple'
                            }
                          >
                            {commision.type_price === TypeCommision.PRECENT || commision.type_price === 1
                              ? 'Theo tỷ lệ'
                              : 'Cố định'}
                          </Tag>
                        </Descriptions.Item>
                        {/* {commision.rate ? (
                          <Descriptions.Item label='Tỷ lệ hoa hồng'>
                            {(commision.rate * 100).toFixed(2)}%
                          </Descriptions.Item>
                        ) : (
                          <Descriptions.Item label=''>{''}</Descriptions.Item>
                        )} */}
                      </Descriptions>
                    </Card>
                  ))}
                </Card>

                {/* Tổng hoa hồng của nhân viên */}
                <Descriptions column={1} bordered size='small'>
                  <Descriptions.Item label='Tổng hoa hồng'>
                    <Text type='success'>{totalCommision.toLocaleString()} VNĐ</Text>
                  </Descriptions.Item>
                </Descriptions>
              </Space>
            </Card>
          )
        })}
      </Space>
    </Modal>
  )
}

export default ModalViewEmployeeCommision
