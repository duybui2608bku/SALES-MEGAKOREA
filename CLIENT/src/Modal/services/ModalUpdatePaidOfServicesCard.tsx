import { useMutation } from '@tanstack/react-query'
import { Col, Form, Input, InputNumber, message, Modal, Row, Select, Typography } from 'antd'
import { HttpStatusCode } from 'axios'
import { useContext } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { optionsMethodPayment } from 'src/Constants/option'
import { AppContext } from 'src/Context/AppContext'
import createOptimisticUpdateHandler from 'src/Function/product/createOptimisticUpdateHandler'
import {
  ServicesOfCardType,
  UpdatePaidOfServicesCardRequestBody,
  UpdateServicesCardRequestBody
} from 'src/Interfaces/services/services.interfaces'
import { queryClient } from 'src/main'
import { servicesApi } from 'src/Service/services/services.api'
import { generateCode } from 'src/Utils/util.utils'

interface ModalUpdatePaidOfServicesCardProps {
  visible: boolean
  onClose: () => void
  servicesCard: ServicesOfCardType
}

interface FieldsUpdatePaidOfServicesCard {
  paid: number
  method: string
  descriptions?: string
}

const ModalUpdatePaidOfServicesCard = (props: ModalUpdatePaidOfServicesCardProps) => {
  const { visible, onClose, servicesCard } = props
  const [form] = Form.useForm<FieldsUpdatePaidOfServicesCard>()
  const { profile } = useContext(AppContext)
  const updateMutation = useMutation({
    mutationFn: (body: UpdatePaidOfServicesCardRequestBody) => servicesApi.updateServicesCard(body),
    onMutate: async () => {
      return createOptimisticUpdateHandler(queryClient, ['getAllServicesCategory'])()
    },
    onSuccess: () => {
      message.success('Cập nhật thanh toán thành công!')
      queryClient.invalidateQueries({ queryKey: ['getAllServicesCategory'] })
      onClose()
      form.resetFields()
    },
    onError: (error: any, _, context) => {
      queryClient.setQueryData(['getAllServicesCategory'], context?.previousData)
      const errorMsg =
        error.response?.status === HttpStatusCode.BadRequest
          ? 'Dữ liệu không hợp lệ!'
          : error.response?.status === HttpStatusCode.NotFound
            ? 'Thẻ dịch vụ không tồn tại!'
            : `Lỗi khi cập nhật danh mục: ${error.message}`
      message.error(errorMsg)
    }
  })

  // Di chuyển logic early return xuống dưới hooks
  if (!servicesCard) return null

  const onFinish = (values: FieldsUpdatePaidOfServicesCard) => {
    const _id = servicesCard._id
    const out_standing = servicesCard.price - servicesCard.price_paid - values.paid // Số tiền còn lại
    const user_id = profile?._id as string // Lấy id của người dùng hiện tại
    const paid = servicesCard.price_paid + values.paid // Tổng số tiền đã thanh toán
    const history_paid = [
      {
        ...values,
        date: new Date(),
        user_id,
        out_standing,
        code: generateCode()
      }
    ]
    updateMutation.mutate({
      history_paid,
      _id,
      paid_initial: paid
    })
  }

  const handleCancelModal = () => {
    onClose()
    form.resetFields()
  }

  return (
    <Fragment>
      <Modal
        onCancel={handleCancelModal}
        open={visible}
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
                    rules={[{ required: true, message: 'Vui lòng nhập số tiền thanh toán!' }]}
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
                      value={servicesCard.price_paid}
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
