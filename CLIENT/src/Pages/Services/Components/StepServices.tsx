import React from 'react'
import { Modal, Steps, Descriptions, Row, Col, Flex, Typography, ConfigProvider } from 'antd'
import { TypeCommision } from 'src/Constants/enum'
import { CheckCircleOutlined, UserOutlined } from '@ant-design/icons'

// Interface mới cho step services theo yêu cầu
interface StepServiceDetail {
  _id: string
  name: string
  type: number
  commision: number
  services_category_id: string | null
  employee_details?: any
}

interface ServiceStepsModalProps {
  visible: boolean
  onClose: () => void
  stepServices: StepServiceDetail[] // Đã thay đổi type dữ liệu
}

const ServiceStepsModal: React.FC<ServiceStepsModalProps> = ({ visible, onClose, stepServices }) => {
  // Kiểm tra nếu không có dữ liệu
  if (!stepServices || stepServices.length === 0) {
    return null
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
          colorBgContainer: '#fff'
        },
        components: {
          Modal: {
            contentBg: '#ffffff',
            headerBg: '#fafafa',
            borderRadiusLG: 12
          },
          Steps: {
            colorText: '#595959',
            colorPrimary: '#1890ff'
          }
        }
      }}
    >
      <Modal
        centered
        open={visible}
        onCancel={onClose}
        footer={null}
        width={700}
        styles={{
          content: {
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: '12px'
          }
        }}
      >
        <Row gutter={[16, 24]}>
          <Col span={24}>
            <Flex justify='center'>
              <Typography.Title level={3} style={{ color: '#1890ff', margin: 0 }}>
                Các Bước Thực Hiện
              </Typography.Title>
            </Flex>
          </Col>
          <Col span={24}>
            <Steps direction='vertical' current={-1} style={{ padding: '0 16px' }}>
              {stepServices.map((step, index) => (
                <Steps.Step
                  key={step._id || index}
                  title={
                    <span style={{ fontSize: '16px', fontWeight: 500 }}>
                      Bước {index + 1}: {step.name}
                    </span>
                  }
                  icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  description={
                    <Descriptions
                      column={1}
                      size='small'
                      bordered
                      style={{
                        background: '#fafafa',
                        borderRadius: '8px',
                        padding: '8px'
                      }}
                      labelStyle={{ width: '120px', fontWeight: 500, color: '#595959' }}
                      contentStyle={{ color: '#262626' }}
                    >
                      {/* Nhân viên có thể không có trong interface mới */}
                      <Descriptions.Item
                        label={
                          <span>
                            <UserOutlined /> Tên Bước
                          </span>
                        }
                      >
                        {step.name}
                      </Descriptions.Item>
                      <Descriptions.Item label='Loại Tiền'>
                        <span
                          style={{
                            color: step.type === TypeCommision.FIXED ? '#52c41a' : '#fa8c16'
                          }}
                        >
                          {step.type === TypeCommision.FIXED ? 'Cố định' : 'Tỷ lệ phần trăm'}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label='Giá Tiền'>
                        <span style={{ fontWeight: 600 }}>
                          {step.commision
                            ? step.commision.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                            : '0 ₫'}
                        </span>
                      </Descriptions.Item>
                      {/* {step.services_category_id && (
                        <Descriptions.Item label='Danh mục'>{step.services_category_id}</Descriptions.Item>
                      )} */}
                    </Descriptions>
                  }
                />
              ))}
            </Steps>
          </Col>
        </Row>
      </Modal>
    </ConfigProvider>
  )
}

export default ServiceStepsModal
