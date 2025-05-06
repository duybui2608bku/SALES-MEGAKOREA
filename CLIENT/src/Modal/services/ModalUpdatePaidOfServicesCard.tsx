import { useMutation } from '@tanstack/react-query'
import { Col, Form, Input, InputNumber, message, Modal, Row, Select, Typography } from 'antd'
import { HttpStatusCode } from 'axios'
import { useContext, useEffect, useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { optionsMethodPayment } from 'src/Constants/option'
import { AppContext } from 'src/Context/AppContext'
import createOptimisticUpdateHandler from 'src/Function/product/createOptimisticUpdateHandler'
import {
  GetServicesCardSoldOfCustomer,
  UpdatePaidOfServicesCardRequestBody
} from 'src/Interfaces/services/services.interfaces'
import { queryClient } from 'src/main'
import { servicesApi } from 'src/Service/services/services.api'
import { generateCode } from 'src/Utils/util.utils'

interface ModalUpdatePaidOfServicesCardProps {
  open: boolean
  onClose: () => void
  servicesCardSoldOfCustomerData: GetServicesCardSoldOfCustomer | null
}

interface FieldsUpdatePaidOfServicesCard {
  paid: number
  method: string
  descriptions?: string
}

const ModalUpdatePaidOfServicesCard = (props: ModalUpdatePaidOfServicesCardProps) => {
  const { open, onClose, servicesCardSoldOfCustomerData } = props
  const [form] = Form.useForm<FieldsUpdatePaidOfServicesCard>()
  const { profile } = useContext(AppContext)
  const [oweMoney, setOweMoney] = useState(0)

  useEffect(() => {
    if (servicesCardSoldOfCustomerData) {
      const price = servicesCardSoldOfCustomerData.price ?? 0
      const pricePaid = servicesCardSoldOfCustomerData.price_paid ?? 0
      const remaining = price - pricePaid
      setOweMoney(remaining)
    }
  }, [servicesCardSoldOfCustomerData])

  const updateMutation = useMutation({
    mutationFn: (body: UpdatePaidOfServicesCardRequestBody) => servicesApi.updateHistoryPaid(body),
    onMutate: async () => {
      return createOptimisticUpdateHandler(queryClient, ['services-card-sold-customer'])()
    },
    onSuccess: () => {
      message.success('Cập nhật thanh toán thành công!')
      queryClient.invalidateQueries({ queryKey: ['services-card-sold-customer'] })
      form.resetFields()
      onClose()
    },
    onError: (error: any, _, context) => {
      queryClient.setQueryData(['services-card-sold-customer'], context?.previousData)
      const errorMsg =
        error.response?.status === HttpStatusCode.BadRequest
          ? 'Dữ liệu không hợp lệ!'
          : error.response?.status === HttpStatusCode.NotFound
            ? 'Thẻ dịch vụ không tồn tại!'
            : `Lỗi khi cập nhật thẻ dịch vụ: ${error.message}`
      message.error(errorMsg)
    }
  })

  // Di chuyển logic early return xuống dưới hooks
  if (!servicesCardSoldOfCustomerData) return null

  const onFinish = (values: FieldsUpdatePaidOfServicesCard) => {
    if (values.paid > oweMoney) {
      message.error(`Số tiền thanh toán không được lớn hơn số tiền còn nợ (${oweMoney.toLocaleString('vi-VN')} VNĐ)`)
      return
    }

    const _id = servicesCardSoldOfCustomerData._id
    const out_standing =
      (servicesCardSoldOfCustomerData.price ?? 0) - (servicesCardSoldOfCustomerData.price_paid ?? 0) - values.paid
    const user_id = profile?._id as string // Lấy id của người dùng hiện tại
    const paid = values.paid // Tổng số tiền đã thanh toán
    const data = {
      ...values,
      code: generateCode(),
      user_id,
      paid,
      out_standing,
      services_card_sold_of_customer_id: _id,
      date: new Date()
    }
    if (out_standing < 0) {
      message.error('Số tiền thanh toán không được lớn hơn số tiền còn lại!')
      return
    }
    updateMutation.mutate(data)
  }

  const handleCancelModal = () => {
    onClose()
    form.resetFields()
  }

  // Validator số tiền thanh toán
  const validatePaymentAmount = (_: any, value: number) => {
    if (value > oweMoney) {
      return Promise.reject(
        new Error(`Số tiền thanh toán không được lớn hơn số tiền còn nợ (${oweMoney.toLocaleString('vi-VN')} VNĐ)`)
      )
    }
    return Promise.resolve()
  }

  return (
    <Fragment>
      <Modal
        onCancel={handleCancelModal}
        open={open}
        centered
        width={600}
        okText='Xác nhận'
        cancelText='Hủy'
        onOk={() => form.submit()}
        confirmLoading={updateMutation.isPending}
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Typography.Title className='center-div' level={4}>
              Thanh Toán
            </Typography.Title>
          </Col>
          <Col span={24}>
            <Form
              form={form}
              layout='vertical'
              name='update-paid'
              onFinish={onFinish}
              initialValues={{
                method: optionsMethodPayment[0].value
              }}
            >
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Form.Item<FieldsUpdatePaidOfServicesCard>
                    name='paid'
                    label='Số tiền thanh toán'
                    rules={[
                      { required: true, message: 'Vui lòng nhập số tiền thanh toán!' },
                      { validator: validatePaymentAmount },
                      { type: 'number', min: 1, message: ' Số tiền thanh toán phải lớn hơn 0!' }
                    ]}
                    validateTrigger={['onChange', 'onBlur']}
                  >
                    <InputNumber
                      suffix='đ'
                      style={{ width: '100%' }}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => (value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0)}
                      step={100000}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label='Số tiền đã thanh toán'>
                    <InputNumber
                      suffix='đ'
                      disabled
                      value={servicesCardSoldOfCustomerData.price_paid ?? 0}
                      style={{ width: '100%' }}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item<FieldsUpdatePaidOfServicesCard> name='method' label='Phương thức thanh toán'>
                    <Select style={{ width: '100%' }} options={optionsMethodPayment} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item<FieldsUpdatePaidOfServicesCard>
                    name='descriptions'
                    label='Mô tả'
                    rules={[{ type: 'string', message: 'Mô tả phải là chuỗi!' }]}
                  >
                    <Input.TextArea rows={2} placeholder='Nhập mô tả thanh toán' />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </Modal>
    </Fragment>
  )
}

export default ModalUpdatePaidOfServicesCard
