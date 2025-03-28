import React from 'react'
import { Modal, Steps, Descriptions, Row, Col, Flex, Typography, ConfigProvider } from 'antd'
import { StepServicesType } from 'src/Interfaces/services/services.interfaces'
import { PriceType } from 'src/Constants/enum'
import { CheckCircleOutlined, UserOutlined } from '@ant-design/icons'

interface ServiceStepsModalProps {
  visible: boolean
  onClose: () => void
  stepServices: StepServicesType[]
}

const ServiceStepsModal: React.FC<ServiceStepsModalProps> = ({ visible, onClose, stepServices }) => {
  if (stepServices.length === 0) {
    return null
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff', // Màu chủ đạo
          borderRadius: 8, // Bo góc
          colorBgContainer: '#fff' // Màu nền
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
                  key={index}
                  title={
                    <span style={{ fontSize: '16px', fontWeight: 500 }}>
                      Bước {index + 1}: {step.descriptions}
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
                      <Descriptions.Item
                        label={
                          <span>
                            <UserOutlined /> Nhân Viên
                          </span>
                        }
                      >
                        {step.employee.name}
                      </Descriptions.Item>
                      <Descriptions.Item label='Loại Tiền'>
                        <span
                          style={{
                            color: step.type_step_price === PriceType.FIXED ? '#52c41a' : '#fa8c16'
                          }}
                        >
                          {step.type_step_price === PriceType.FIXED ? 'Cố định' : 'Tỷ lệ phần trăm'}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label='Giá Tiền'>
                        <span style={{ fontWeight: 600 }}>
                          {step.price
                            ? step.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                            : '0 ₫'}
                        </span>
                      </Descriptions.Item>
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
