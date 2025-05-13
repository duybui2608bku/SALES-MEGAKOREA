import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, InputNumber, Button, Typography, Spin, Alert } from 'antd'
import { useAxios } from 'src/hook/useAxios'
import { ServicesType } from 'src/Interfaces/services/services.interfaces'
import { ICreateQuantityRequestPayload } from 'src/Interfaces/services/quantity-request.interfaces'
import { QuantityRequestAPI } from 'src/Service/services/quantity-request.api'
import styles from 'src/Scss/components/modal.module.scss'

const { Title, Text } = Typography
const { TextArea } = Input

interface ModalRequestQuantityProps {
  isOpen: boolean
  onClose: () => void
  serviceId: string
  onSuccess: () => void
}

const ModalRequestQuantity: React.FC<ModalRequestQuantityProps> = ({ isOpen, onClose, serviceId, onSuccess }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [service, setService] = useState<ServicesType | null>(null)

  const axiosClient = useAxios()
  const quantityRequestAPI = new QuantityRequestAPI(axiosClient)

  // Load service details
  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!serviceId) return

      setLoading(true)
      setError(null)

      try {
        const response = await axiosClient.get(`/api/services/${serviceId}`)
        setService(response.data)
      } catch (err) {
        console.error('Failed to fetch service details:', err)
        setError('Không thể tải thông tin dịch vụ. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchServiceDetails()
    }
  }, [serviceId, isOpen, axiosClient])

  const handleSubmit = async (values: any) => {
    setSubmitting(true)
    setError(null)

    try {
      const payload: ICreateQuantityRequestPayload = {
        serviceId,
        requestedQuantity: values.requestedQuantity,
        reason: values.reason
      }

      await quantityRequestAPI.createRequest(payload)

      form.resetFields()
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Failed to submit request:', err)
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={<Title level={4}>Yêu cầu tăng số lần dịch vụ</Title>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      className={styles.modalLarge}
    >
      <Spin spinning={loading}>
        {error && <Alert message={error} type='error' style={{ marginBottom: 16 }} />}

        {service && (
          <div className={styles.serviceInfo} style={{ marginBottom: 24 }}>
            <Title level={5}>Thông tin dịch vụ</Title>
            <div>
              <Text strong>Tên dịch vụ:</Text> {service.name}
            </div>
            <div>
              <Text strong>Mã dịch vụ:</Text> {service.code}
            </div>
            <div>
              <Text strong>Số lần hiện tại:</Text> {service.quantity || 0}
            </div>
          </div>
        )}

        <Form form={form} layout='vertical' onFinish={handleSubmit} initialValues={{ requestedQuantity: 1 }}>
          <Form.Item
            name='requestedQuantity'
            label='Số lần yêu cầu thêm'
            rules={[
              { required: true, message: 'Vui lòng nhập số lần yêu cầu' },
              { type: 'number', min: 1, message: 'Số lần phải lớn hơn 0' }
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name='reason'
            label='Lý do yêu cầu'
            rules={[{ required: true, message: 'Vui lòng nhập lý do yêu cầu' }]}
          >
            <TextArea rows={4} placeholder='Nhập lý do yêu cầu tăng số lần dịch vụ...' />
          </Form.Item>

          <Form.Item className={styles.formActions}>
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type='primary' htmlType='submit' loading={submitting}>
              Gửi yêu cầu
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  )
}

export default ModalRequestQuantity
