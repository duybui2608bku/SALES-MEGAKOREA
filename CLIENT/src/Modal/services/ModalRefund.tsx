import { useState, useEffect } from 'react'
import { Modal, Typography, Radio, Form, InputNumber, Alert, Button, Space, Input, message, Card } from 'antd'
import { GetServicesCardSoldOfCustomer, RefundType } from 'src/Interfaces/services/services.interfaces'
import { RefundEnum } from 'src/Constants/enum'
import { servicesApi } from 'src/Service/services/services.api'
import { useQueryClient } from '@tanstack/react-query'
import { GiTakeMyMoney, GiPayMoney } from 'react-icons/gi'
import { RiMoneyDollarCircleLine } from 'react-icons/ri'
import { motion } from 'framer-motion'

const { Text, Title } = Typography
const { TextArea } = Input

interface ModalRefundProps {
  open: boolean
  onClose: () => void
  servicesCardData: GetServicesCardSoldOfCustomer | null
}

const ModalRefund = ({ open, onClose, servicesCardData }: ModalRefundProps) => {
  const [form] = Form.useForm()
  const [refundType, setRefundType] = useState<RefundEnum>(RefundEnum.NONE)
  const [refundAmount, setRefundAmount] = useState<number>(0)
  const [maxRefundAmount, setMaxRefundAmount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (servicesCardData && open) {
      calculateMaxRefund()
      form.resetFields()
      setRefundType(RefundEnum.NONE)
      setRefundAmount(0)
    }
  }, [servicesCardData, open])

  const calculateMaxRefund = () => {
    if (!servicesCardData) return

    // For full refund, max is the price_paid
    if (refundType === RefundEnum.FULL) {
      setMaxRefundAmount(servicesCardData.price_paid || 0)
      setRefundAmount(servicesCardData.price_paid || 0)
      return
    }

    // For refund by sessions
    if (refundType === RefundEnum.PARTIAL_FULL_TREATMENT) {
      let totalRefundable = 0
      servicesCardData.cards.forEach((card) => {
        card.services_of_card.forEach((service) => {
          const unusedSessions = service.quantity - service.used
          const pricePerSession = service.price / service.quantity
          totalRefundable += unusedSessions * pricePerSession
        })
      })
      setMaxRefundAmount(totalRefundable)
      setRefundAmount(totalRefundable)
      return
    }

    // Default max refund is price_paid
    setMaxRefundAmount(servicesCardData.price_paid || 0)
  }

  // Check if full refund is allowed (only when no service has been used)
  const isFullRefundAllowed = () => {
    if (!servicesCardData) return false

    let hasUsedServices = false
    servicesCardData.cards.forEach((card) => {
      card.services_of_card.forEach((service) => {
        if (service.used > 0) {
          hasUsedServices = true
        }
      })
    })

    return !hasUsedServices
  }

  const handleRefundTypeChange = (e: any) => {
    const newRefundType = e.target.value
    setRefundType(newRefundType)
    calculateMaxRefund()
  }

  const handleRefundAmountChange = (value: number | null) => {
    if (value !== null) {
      setRefundAmount(value)
    }
  }

  const handleSubmit = async () => {
    if (!servicesCardData) return

    try {
      setLoading(true)
      await form.validateFields()

      const refundData: RefundType = {
        type: refundType,
        price: refundAmount,
        date: new Date()
      }

      await servicesApi.updateServicesCardSoldOfCustomer({
        _id: servicesCardData._id,
        refund: refundData
      })

      message.success('Hoàn tiền thành công')
      queryClient.invalidateQueries({ queryKey: ['services-card-sold-customer'] })
      onClose()
    } catch (error) {
      console.error('Error submitting refund:', error)
      message.error('Có lỗi xảy ra khi hoàn tiền')
    } finally {
      setLoading(false)
    }
  }

  const renderRefundOptions = () => {
    if (!servicesCardData) return null

    return (
      <Radio.Group onChange={handleRefundTypeChange} value={refundType} className='refund-options'>
        <Space direction='vertical' style={{ width: '100%' }}>
          {isFullRefundAllowed() && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card
                hoverable
                className={`refund-option-card ${refundType === RefundEnum.FULL ? 'selected' : ''}`}
                onClick={() => handleRefundTypeChange({ target: { value: RefundEnum.FULL } })}
              >
                <Radio value={RefundEnum.FULL}>
                  <Space align='center'>
                    <GiTakeMyMoney size={24} style={{ color: '#1677ff' }} />
                    <div>
                      <Text strong style={{ fontSize: '16px', display: 'block' }}>
                        Hoàn tiền 100%
                      </Text>
                      <Text type='success' style={{ fontSize: '14px' }}>
                        {(servicesCardData.price_paid || 0).toLocaleString('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        })}
                      </Text>
                    </div>
                  </Space>
                </Radio>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card
              hoverable
              className={`refund-option-card disabled ${refundType === RefundEnum.PARTIAL_FULL_TREATMENT ? 'selected' : ''}`}
            >
              <Radio value={RefundEnum.PARTIAL_FULL_TREATMENT} disabled>
                <Space align='center'>
                  <GiPayMoney size={24} style={{ color: '#d9d9d9' }} />
                  <div>
                    <Text type='secondary' style={{ fontSize: '16px', display: 'block' }}>
                      Hoàn tiền theo số buổi
                    </Text>
                    <Text type='secondary' style={{ fontSize: '12px' }}>
                      (Tính năng đang phát triển)
                    </Text>
                  </div>
                </Space>
              </Radio>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card
              hoverable
              className={`refund-option-card ${refundType === RefundEnum.PARTIAL_HALF_REATMENT ? 'selected' : ''}`}
              onClick={() => handleRefundTypeChange({ target: { value: RefundEnum.PARTIAL_HALF_REATMENT } })}
            >
              <Radio value={RefundEnum.PARTIAL_HALF_REATMENT}>
                <Space align='center'>
                  <RiMoneyDollarCircleLine size={24} style={{ color: '#1677ff' }} />
                  <div style={{ width: '100%' }}>
                    <Text strong style={{ fontSize: '16px', display: 'block' }}>
                      Hoàn tiền theo số tiền
                    </Text>
                    {refundType === RefundEnum.PARTIAL_HALF_REATMENT && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        style={{ marginTop: 16 }}
                      >
                        <Form.Item
                          name='refundAmount'
                          rules={[
                            { required: true, message: 'Vui lòng nhập số tiền cần hoàn' },
                            {
                              validator: (_, value) => {
                                if (value > maxRefundAmount) {
                                  return Promise.reject(new Error('Số tiền hoàn không được vượt quá số tiền cho phép'))
                                }
                                return Promise.resolve()
                              }
                            }
                          ]}
                        >
                          <InputNumber
                            style={{ width: '100%' }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => (value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0)}
                            onChange={handleRefundAmountChange}
                            max={maxRefundAmount}
                            min={0}
                            placeholder='Nhập số tiền cần hoàn'
                            size='large'
                          />
                        </Form.Item>
                      </motion.div>
                    )}
                  </div>
                </Space>
              </Radio>
            </Card>
          </motion.div>
        </Space>
      </Radio.Group>
    )
  }

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}>
          <Title level={4} style={{ margin: 0, color: '#1677ff' }}>
            Hoàn tiền dịch vụ
          </Title>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key='cancel' onClick={onClose} size='large'>
          Hủy
        </Button>,
        <Button
          key='submit'
          type='primary'
          loading={loading}
          onClick={handleSubmit}
          disabled={refundType === RefundEnum.NONE || refundAmount <= 0}
          size='large'
        >
          Xác nhận hoàn tiền
        </Button>
      ]}
      className='refund-modal'
    >
      {servicesCardData && (
        <Form form={form} layout='vertical'>
          <Card className='info-card' style={{ marginBottom: 24 }}>
            <Space size={24} style={{ width: '100%', justifyContent: 'space-between' }}>
              <div>
                <Text type='secondary'>Dịch vụ</Text>
                <Text strong style={{ fontSize: '16px', display: 'block' }}>
                  {servicesCardData.code}
                </Text>
              </div>
              <div>
                <Text type='secondary'>Khách hàng</Text>
                <Text strong style={{ fontSize: '16px', display: 'block' }}>
                  {servicesCardData.customers?.name}
                </Text>
              </div>
              <div>
                <Text type='secondary'>Tổng tiền</Text>
                <Text strong style={{ fontSize: '16px', display: 'block', color: '#FF4D4F' }}>
                  {(servicesCardData.price || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </Text>
              </div>
              <div>
                <Text type='secondary'>Đã thanh toán</Text>
                <Text strong style={{ fontSize: '16px', display: 'block', color: '#52C41A' }}>
                  {(servicesCardData.price_paid || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </Text>
              </div>
            </Space>
          </Card>

          <Form.Item
            label={
              <Text strong style={{ fontSize: '16px' }}>
                Phương thức hoàn tiền
              </Text>
            }
            name='refundType'
            rules={[{ required: true, message: 'Vui lòng chọn phương thức hoàn tiền' }]}
          >
            {renderRefundOptions()}
          </Form.Item>

          {refundType !== RefundEnum.NONE && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Alert
                message={
                  <Text strong style={{ fontSize: '15px' }}>
                    Số tiền sẽ hoàn:{' '}
                    <Text style={{ color: '#FF9900', fontSize: '16px' }}>
                      {refundAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </Text>
                  </Text>
                }
                type='info'
                style={{ marginBottom: 16, background: '#FFF7E6', border: '1px solid #FFD591' }}
              />

              <Form.Item
                label={
                  <Text strong style={{ fontSize: '16px' }}>
                    Ghi chú
                  </Text>
                }
                name='description'
              >
                <TextArea rows={3} placeholder='Nhập ghi chú về việc hoàn tiền (nếu có)' style={{ borderRadius: 6 }} />
              </Form.Item>
            </motion.div>
          )}
        </Form>
      )}
    </Modal>
  )
}

export default ModalRefund
